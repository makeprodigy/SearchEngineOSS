// GitHub API service for fetching real repository data
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN; // Optional: Add token for higher rate limits

// Validate GitHub token configuration
if (!GITHUB_TOKEN || GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
  console.warn('⚠️ GitHub token is not configured!');
  console.warn('📝 Add your token to .env file: VITE_GITHUB_TOKEN=your_token_here');
  console.warn('📖 See GITHUB_API_SETUP.md for instructions.');
  console.warn('⚡ Rate limit: 60 requests/hour (5,000 with token)');
} else {
  console.log('✅ GitHub token configured - you have 5,000 requests/hour!');
}

// Enhanced cache configuration with multiple durations
const CACHE_DURATIONS = {
  SEARCH: 10 * 60 * 1000,      // 10 minutes for search results
  TRENDING: 30 * 60 * 1000,    // 30 minutes for trending repos (changes slowly)
  POPULAR: 60 * 60 * 1000,     // 1 hour for popular repos (very stable)
  REPO_DETAILS: 15 * 60 * 1000, // 15 minutes for repo details
  CONTRIBUTORS: 30 * 60 * 1000, // 30 minutes for contributors
  DEFAULT: 10 * 60 * 1000       // 10 minutes default
};

// In-memory cache
const cache = new Map();

// Persistent cache using localStorage
const STORAGE_KEY_PREFIX = 'gh_cache_';
const STORAGE_EXPIRY_KEY = 'gh_cache_expiry_';

// Request deduplication - track in-flight requests
const inflightRequests = new Map();

// Rate limit tracking
let rateLimitRemaining = null;
let rateLimitReset = null;
let rateLimitLimit = null; // Total limit (60 without token, 5000 with token)

// Load cache from localStorage on initialization
let cacheLoadAttempted = false;
const loadCacheFromStorage = () => {
  if (cacheLoadAttempted) return;
  cacheLoadAttempted = true;
  
  // Check if localStorage is available
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    const keys = Object.keys(localStorage);
    let loadedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        const cacheKey = key.replace(STORAGE_KEY_PREFIX, '');
        const expiryKey = `${STORAGE_EXPIRY_KEY}${cacheKey}`;
        const expiryTime = localStorage.getItem(expiryKey);
        
        if (expiryTime && Date.now() < parseInt(expiryTime, 10)) {
          const data = JSON.parse(localStorage.getItem(key));
          cache.set(cacheKey, { data, timestamp: Date.now() });
          loadedCount++;
        } else {
          // Clean up expired entries
          localStorage.removeItem(key);
          localStorage.removeItem(expiryKey);
        }
      }
    });
    
    if (loadedCount > 0) {
      console.log(`📦 Loaded ${loadedCount} cached items from localStorage`);
    }
  } catch (error) {
    console.warn('Failed to load cache from localStorage:', error);
  }
};

// Rate limiting - removed artificial delays when using token
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = GITHUB_TOKEN ? 0 : 200; // No delay with token, minimal delay without

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRateLimit = async (url, options = {}) => {
  // Check for in-flight duplicate requests
  if (inflightRequests.has(url)) {
    console.log(`⏳ Deduplicating request to ${url}`);
    return inflightRequests.get(url);
  }

  // Enforce rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await wait(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...options.headers,
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  } else {
    console.warn('⚠️ Making API request WITHOUT token - limited to 60 requests/hour');
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, { ...options, headers });
      
      // Track rate limit info from response headers
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');
      const limit = response.headers.get('X-RateLimit-Limit');
      
      if (remaining !== null) {
        rateLimitRemaining = parseInt(remaining, 10);
        rateLimitReset = parseInt(reset, 10) * 1000;
        rateLimitLimit = parseInt(limit, 10);
        
        // Warn if getting low on rate limit
        if (rateLimitRemaining < 100 && rateLimitRemaining % 10 === 0) {
          console.warn(`⚠️ GitHub API rate limit: ${rateLimitRemaining} requests remaining`);
        }
      }
      
      if (!response.ok) {
        if (response.status === 403) {
          const resetTime = response.headers.get('X-RateLimit-Reset');
          const resetDate = new Date(resetTime * 1000);
          throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } finally {
      // Remove from in-flight requests when done
      inflightRequests.delete(url);
    }
  })();

  // Store in-flight request
  inflightRequests.set(url, requestPromise);
  
  return requestPromise;
};

// Get cached data if available and fresh
const getCached = (key, cacheDuration = CACHE_DURATIONS.DEFAULT) => {
  // Load cache from localStorage on first use
  loadCacheFromStorage();
  
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

// Store data in cache (both memory and localStorage)
const setCache = (key, data, cacheDuration = CACHE_DURATIONS.DEFAULT) => {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Also store in localStorage for persistence (if available)
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
      localStorage.setItem(`${STORAGE_EXPIRY_KEY}${key}`, (Date.now() + cacheDuration).toString());
    } catch (error) {
      // localStorage might be full or disabled - just continue without persistence
      console.warn('Failed to persist cache to localStorage:', error);
    }
  }
};

// Export rate limit info
export const getRateLimitInfo = () => ({
  remaining: rateLimitRemaining,
  reset: rateLimitReset,
  resetDate: rateLimitReset ? new Date(rateLimitReset) : null,
  limit: rateLimitLimit,
  hasToken: rateLimitLimit >= 5000, // Token gives 5000 requests/hour
});

/**
 * Search repositories on GitHub
 * @param {string} query - Search query
 * @param {number} perPage - Results per page (max 100)
 * @param {number} page - Page number
 * @param {string} sort - Sort field (stars, forks, help-wanted-issues, updated)
 * @returns {Promise<Array>} Array of repositories
 */
export const searchRepositories = async (query, perPage = 30, page = 1, sort = 'stars') => {
  const cacheKey = `search:${query}:${perPage}:${page}:${sort}`;
  const cached = getCached(cacheKey, CACHE_DURATIONS.SEARCH);
  if (cached) {
    console.log(`✅ Cache hit for search: ${query}`);
    return cached;
  }

  const searchQuery = query || 'stars:>1000'; // Default to popular repos
  const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}&page=${page}&sort=${sort}`;
  
  try {
    const data = await fetchWithRateLimit(url);
    const results = data.items || [];
    setCache(cacheKey, results, CACHE_DURATIONS.SEARCH);
    return results;
  } catch (error) {
    console.error('Error searching repositories:', error);
    throw error;
  }
};

/**
 * Get detailed repository information
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository details
 */
export const getRepository = async (owner, repo) => {
  const cacheKey = `repo:${owner}/${repo}`;
  const cached = getCached(cacheKey, CACHE_DURATIONS.REPO_DETAILS);
  if (cached) return cached;

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  
  try {
    const data = await fetchWithRateLimit(url);
    setCache(cacheKey, data, CACHE_DURATIONS.REPO_DETAILS);
    return data;
  } catch (error) {
    console.error(`Error fetching repository ${owner}/${repo}:`, error);
    throw error;
  }
};

/**
 * Get repository contributors count
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<number>} Number of contributors
 */
export const getContributorsCount = async (owner, repo) => {
  const cacheKey = `contributors:${owner}/${repo}`;
  const cached = getCached(cacheKey, CACHE_DURATIONS.CONTRIBUTORS);
  if (cached !== null && cached !== undefined) {
    const numericValue = Number(cached);
    console.log(`📦 Cache hit - Contributors for ${owner}/${repo}: ${numericValue} (type: ${typeof numericValue})`);
    return numericValue;
  }

  try {
    // Use per_page=1 with anon=true to get total count from headers
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=1&anon=true`;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 403) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        console.error(`❌ GitHub API rate limit exceeded for contributors. Resets at ${new Date(resetTime * 1000).toLocaleTimeString()}`);
        console.error(`💡 Add VITE_GITHUB_TOKEN to .env file to get 5,000 requests/hour!`);
      } else {
        console.warn(`Contributors API returned ${response.status} for ${owner}/${repo}`);
      }
      // Return estimate based on forks
      const estimate = Math.max(1, Math.floor((await getRepository(owner, repo)).forks_count / 20));
      console.log(`📊 Contributors estimate for ${owner}/${repo}: ${estimate} (type: ${typeof estimate})`);
      return estimate;
    }
    
    // Check Link header for pagination
    const linkHeader = response.headers.get('Link');
    if (linkHeader) {
      const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (matches) {
        const count = parseInt(matches[1], 10);
        console.log(`✅ Contributors for ${owner}/${repo}: ${count} (from pagination, type: ${typeof count})`);
        setCache(cacheKey, count, CACHE_DURATIONS.CONTRIBUTORS);
        return count;
      }
    }
    
    // No pagination means all contributors fit in one page
    const data = await response.json();
    const count = Array.isArray(data) ? data.length : 1;
    console.log(`✅ Contributors for ${owner}/${repo}: ${count} (no pagination, type: ${typeof count})`);
    setCache(cacheKey, count, CACHE_DURATIONS.CONTRIBUTORS);
    return count;
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    // Return estimate instead of 0
    try {
      const repoData = await getRepository(owner, repo);
      const fallback = Math.max(1, Math.floor(repoData.forks_count / 20));
      console.log(`⚠️ Contributors fallback for ${owner}/${repo}: ${fallback} (type: ${typeof fallback})`);
      return fallback;
    } catch {
      console.log(`⚠️ Contributors minimum for ${owner}/${repo}: 1`);
      return 1; // At least the owner
    }
  }
};

/**
 * Get good first issues count
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<number>} Number of good first issues
 */
export const getGoodFirstIssues = async (owner, repo) => {
  const cacheKey = `goodfirst:${owner}/${repo}`;
  const cached = getCached(cacheKey, CACHE_DURATIONS.REPO_DETAILS);
  if (cached !== null) return cached;

  const labels = ['good first issue', 'good-first-issue', 'beginner', 'beginner-friendly', 'first-timers-only'];
  const url = `${GITHUB_API_BASE}/search/issues?q=repo:${owner}/${repo}+is:issue+is:open+label:"${labels.join('","')}"&per_page=1`;
  
  try {
    const data = await fetchWithRateLimit(url);
    const count = data.total_count || 0;
    setCache(cacheKey, count, CACHE_DURATIONS.REPO_DETAILS);
    return count;
  } catch (error) {
    console.error(`Error fetching good first issues for ${owner}/${repo}:`, error);
    return 0;
  }
};

/**
 * Get active (open) pull requests count
 * NOTE: This fetches OPEN PRs, not merged PRs
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<number>} Number of active (open) PRs
 */
export const getActivePRsCount = async (owner, repo) => {
  const cacheKey = `activeprs:${owner}/${repo}`;
  const cached = getCached(cacheKey, CACHE_DURATIONS.REPO_DETAILS);
  if (cached !== null && cached !== undefined) {
    const numericValue = Number(cached);
    console.log(`📦 Cache hit - Active PRs for ${owner}/${repo}: ${numericValue} (type: ${typeof numericValue})`);
    return numericValue;
  }

  try {
    // Fetch OPEN pull requests (not merged)
    const url = `${GITHUB_API_BASE}/search/issues?q=repo:${owner}/${repo}+is:pr+is:open&per_page=1`;
    const data = await fetchWithRateLimit(url);
    const count = Number(data.total_count) || 0;
    console.log(`✅ Active (OPEN) PRs for ${owner}/${repo}: ${count} (type: ${typeof count})`);
    setCache(cacheKey, count, CACHE_DURATIONS.REPO_DETAILS);
    return count;
  } catch (error) {
    console.error(`Error fetching active PRs for ${owner}/${repo}:`, error);
    console.log(`⚠️ Active PRs fallback for ${owner}/${repo}: 0`);
    return 0;
  }
};

/**
 * Get repository commit activity
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Commit activity data
 */
export const getCommitActivity = async (owner, repo) => {
  const cacheKey = `commits:${owner}/${repo}`;
  const cached = getCached(cacheKey, CACHE_DURATIONS.REPO_DETAILS);
  if (cached) return cached;

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/commit_activity`;
  
  try {
    const data = await fetchWithRateLimit(url);
    if (!data || data.length === 0) {
      return { lastWeek: 0, lastMonth: 0 };
    }
    
    // GitHub returns last 52 weeks
    const lastWeek = data[data.length - 1]?.total || 0;
    const lastMonth = data.slice(-4).reduce((sum, week) => sum + (week.total || 0), 0);
    
    const result = { lastWeek, lastMonth };
    setCache(cacheKey, result, CACHE_DURATIONS.REPO_DETAILS);
    return result;
  } catch (error) {
    console.error(`Error fetching commit activity for ${owner}/${repo}:`, error);
    return { lastWeek: 0, lastMonth: 0 };
  }
};

/**
 * Get repository issue history (last 12 months approximation)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} currentIssues - Current open issues count
 * @returns {Array} Array of 12 issue counts with realistic variation
 */
export const getIssueHistory = (currentIssues) => {
  const openIssues = currentIssues || 0;
  
  // Generate more realistic history with trends and variance
  // Start from ~80-120% of current and trend toward current value
  const startVariance = (Math.random() * 0.4) - 0.2; // -20% to +20%
  const startValue = Math.max(0, Math.round(openIssues * (1 + startVariance)));
  
  const history = [];
  for (let i = 0; i < 12; i++) {
    // Gradually trend from start value to current value
    const progress = i / 11; // 0 to 1
    const trendValue = startValue + (openIssues - startValue) * progress;
    
    // Add some random variance (±10%)
    const variance = (Math.random() * 0.2) - 0.1;
    const value = Math.max(0, Math.round(trendValue * (1 + variance)));
    
    history.push(value);
  }
  
  return history;
};

/**
 * Transform GitHub API repository to app format
 * @param {Object} githubRepo - Repository from GitHub API
 * @param {Object} additionalData - Additional fetched data
 * @returns {Object} Repository in app format
 */
export const transformRepository = async (githubRepo, additionalData = {}) => {
  // Use provided additional data or smart estimates
  // Estimate contributors from watchers/forks if not provided (rough heuristic)
  const estimatedContributors = Math.max(
    Math.floor((githubRepo.watchers_count || 0) / 10),
    Math.floor((githubRepo.forks_count || 0) / 20),
    1 // At least 1 contributor (the owner)
  );
  
  // Ensure contributors is an integer
  const contributors = additionalData.contributors !== undefined 
    ? parseInt(additionalData.contributors, 10) 
    : estimatedContributors;
  
  console.log(`📊 Transforming ${githubRepo.full_name}:`, {
    additionalData: additionalData.contributors,
    estimated: estimatedContributors,
    final: contributors,
    watchers: githubRepo.watchers_count,
    forks: githubRepo.forks_count
  });
  
  // Ensure all numeric fields are integers
  const goodFirstIssues = additionalData.goodFirstIssues !== undefined 
    ? parseInt(additionalData.goodFirstIssues, 10) 
    : 0;
  const activePRs = additionalData.activePRs !== undefined 
    ? parseInt(additionalData.activePRs, 10) 
    : 0;
  const commits = additionalData.commits ?? { lastWeek: 0, lastMonth: 0 };
  // Generate dynamic issue history instead of flat values
  const issueHistory = additionalData.issueHistory ?? getIssueHistory(githubRepo.open_issues_count || 0);
  
  console.log(`🔢 Numeric values for ${githubRepo.full_name}:`, {
    contributors,
    activePRs,
    goodFirstIssues,
    types: {
      contributors: typeof contributors,
      activePRs: typeof activePRs,
      goodFirstIssues: typeof goodFirstIssues
    }
  });

  // Calculate health score
  const healthScore = calculateHealthScore({
    stars: githubRepo.stargazers_count,
    contributors,
    commits,
    lastCommitDate: githubRepo.pushed_at,
    openIssues: githubRepo.open_issues_count,
  });

  return {
    id: githubRepo.id.toString(),
    name: githubRepo.name,
    fullName: githubRepo.full_name,
    description: githubRepo.description || 'No description available',
    owner: githubRepo.owner.login,
    stars: parseInt(githubRepo.stargazers_count, 10) || 0,
    forks: parseInt(githubRepo.forks_count, 10) || 0,
    watchers: parseInt(githubRepo.watchers_count, 10) || 0,
    openIssues: parseInt(githubRepo.open_issues_count, 10) || 0,
    contributors,
    goodFirstIssues,
    license: githubRepo.license?.spdx_id || githubRepo.license?.name || 'No License',
    lastCommitDate: githubRepo.pushed_at ? new Date(githubRepo.pushed_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    activePRs,
    language: githubRepo.language || 'Unknown',
    topics: githubRepo.topics || [],
    issueHistory,
    commits,
    healthScore,
    url: githubRepo.html_url,
  };
};

/**
 * Calculate health score for a repository
 */
const calculateHealthScore = (repo) => {
  let score = 0;
  
  // Ensure all values are integers
  const contributors = parseInt(repo.contributors, 10) || 0;
  const stars = parseInt(repo.stars, 10) || 0;
  const openIssues = parseInt(repo.openIssues, 10) || 0;
  const lastMonthCommits = parseInt(repo.commits?.lastMonth, 10) || 0;
  
  console.log(`💯 Calculating health score with:`, {
    contributors,
    stars,
    openIssues,
    lastMonthCommits
  });
  
  // Activity score (30 points)
  const activityScore = Math.min(30, (lastMonthCommits / 100) * 30);
  score += activityScore;
  
  // Community engagement (25 points)
  const contributorsScore = Math.min(15, (contributors / 1000) * 15);
  const starsScore = Math.min(10, (stars / 50000) * 10);
  score += contributorsScore + starsScore;
  
  // Maintenance (25 points)
  const lastCommitDate = new Date(repo.lastCommitDate);
  const daysSinceLastCommit = Math.floor((new Date() - lastCommitDate) / (1000 * 60 * 60 * 24));
  const maintenanceScore = daysSinceLastCommit <= 7 ? 25 : 
                          daysSinceLastCommit <= 30 ? 20 :
                          daysSinceLastCommit <= 90 ? 15 :
                          daysSinceLastCommit <= 180 ? 10 : 5;
  score += maintenanceScore;
  
  // Issue management (20 points)
  const issueRatio = openIssues / (stars / 100);
  const issueScore = issueRatio < 1 ? 20 :
                    issueRatio < 2 ? 15 :
                    issueRatio < 5 ? 10 : 5;
  score += issueScore;
  
  return Math.round(Math.min(100, score));
};

/**
 * Fetch enriched repository data (with all additional info)
 * @param {Object} githubRepo - Basic repository data from search
 * @param {boolean|string} fetchAdditionalData - true: fetch all, false: use estimates, 'lazy': use cache only
 * @returns {Promise<Object>} Enriched repository
 */
export const enrichRepository = async (githubRepo, fetchAdditionalData = true) => {
  const owner = githubRepo.owner.login;
  const name = githubRepo.name;
  
  console.log(`🔍 Enriching ${owner}/${name}, fetchAdditionalData=${fetchAdditionalData}`);
  
  if (fetchAdditionalData === false) {
    // Quick transform with estimates only
    console.log(`⚡ Using estimates only for ${owner}/${name}`);
    return transformRepository(githubRepo);
  }
  
  if (fetchAdditionalData === 'lazy') {
    // Only use cached data, don't make new API calls
    const contributorsCacheKey = `contributors:${owner}/${name}`;
    const prsCacheKey = `activeprs:${owner}/${name}`;
    
    const cachedContributors = getCached(contributorsCacheKey, CACHE_DURATIONS.CONTRIBUTORS);
    const cachedPRs = getCached(prsCacheKey, CACHE_DURATIONS.REPO_DETAILS);
    
    if (cachedContributors !== null && cachedPRs !== null) {
      console.log(`⚡ Using cached data only for ${owner}/${name}`);
      return transformRepository(githubRepo, {
        contributors: Number(cachedContributors),
        activePRs: Number(cachedPRs),
      });
    }
    
    // No cache available, use estimates
    console.log(`⚡ No cache available, using estimates for ${owner}/${name}`);
    return transformRepository(githubRepo);
  }
  
  try {
    // Fetch contributors and active PRs in parallel (most important for UI)
    console.log(`🌐 Fetching additional data for ${owner}/${name}...`);
    const [contributors, activePRs] = await Promise.all([
      getContributorsCount(owner, name),
      getActivePRsCount(owner, name)
    ]);
    console.log(`✅ Got ${contributors} contributors and ${activePRs} active PRs for ${owner}/${name}`);
    
    return transformRepository(githubRepo, {
      contributors,
      activePRs,
    });
  } catch (error) {
    console.error(`❌ Error enriching repository ${owner}/${name}:`, error);
    // Return basic transform with estimates if enrichment fails
    return transformRepository(githubRepo);
  }
};

/**
 * Batch enrich repositories with optional lazy loading
 * This reduces API calls by only enriching a subset of repos fully
 * @param {Array} repos - Array of repository objects
 * @param {number} fullEnrichCount - Number of repos to fully enrich (default: 6)
 * @returns {Promise<Array>} Enriched repositories
 */
export const batchEnrichRepositories = async (repos, fullEnrichCount = 6) => {
  if (repos.length === 0) return [];
  
  console.log(`📦 Batch enriching: ${fullEnrichCount} full, ${repos.length - fullEnrichCount} lazy`);
  
  // Split repos into full enrichment and lazy enrichment
  const reposToEnrichFully = repos.slice(0, fullEnrichCount);
  const reposToEnrichLazy = repos.slice(fullEnrichCount);
  
  // Process in parallel
  const [fullyEnriched, lazilyEnriched] = await Promise.all([
    Promise.all(reposToEnrichFully.map(repo => enrichRepository(repo, true))),
    Promise.all(reposToEnrichLazy.map(repo => enrichRepository(repo, 'lazy')))
  ]);
  
  return [...fullyEnriched, ...lazilyEnriched];
};

/**
 * Fetch trending repositories (most stars recently)
 * @param {number} limit - Number of repositories to fetch
 * @returns {Promise<Array>} Array of repositories
 */
export const getTrendingRepos = async (limit = 6) => {
  const cacheKey = `trending:${limit}`;
  const cached = getCached(cacheKey, CACHE_DURATIONS.TRENDING);
  if (cached) {
    console.log(`✅ Cache hit for trending repos`);
    return cached;
  }

  // Get repos created in the last month with most stars
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const dateString = date.toISOString().split('T')[0];
  
  try {
    const repos = await searchRepositories(`created:>${dateString}`, limit, 1, 'stars');
    const enriched = await Promise.all(
      repos.slice(0, limit).map(repo => enrichRepository(repo, true))
    );
    setCache(cacheKey, enriched, CACHE_DURATIONS.TRENDING);
    return enriched;
  } catch (error) {
    console.error('Error fetching trending repos:', error);
    return [];
  }
};

/**
 * Fetch popular repositories
 * @param {number} limit - Number of repositories to fetch
 * @returns {Promise<Array>} Array of repositories
 */
export const getPopularRepos = async (limit = 6) => {
  const cacheKey = `popular:${limit}`;
  const cached = getCached(cacheKey, CACHE_DURATIONS.POPULAR);
  if (cached) {
    console.log(`✅ Cache hit for popular repos`);
    return cached;
  }

  try {
    const repos = await searchRepositories('stars:>50000', limit, 1, 'stars');
    const enriched = await Promise.all(
      repos.slice(0, limit).map(repo => enrichRepository(repo, true))
    );
    setCache(cacheKey, enriched, CACHE_DURATIONS.POPULAR);
    return enriched;
  } catch (error) {
    console.error('Error fetching popular repos:', error);
    return [];
  }
};

/**
 * Search repositories with filters
 * @param {string} query - Search query
 * @param {Object} filters - Filter options
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Results per page (default: 30)
 * @returns {Promise<Object>} Object with results and hasMore flag
 */
export const searchWithFilters = async (query, filters = {}, page = 1, perPage = 30) => {
  let searchQuery = query || '';
  
  // Build GitHub search query from filters
  const queryParts = [searchQuery];
  
  if (filters.languages && filters.languages.length > 0) {
    queryParts.push(filters.languages.map(lang => `language:${lang}`).join(' '));
  }
  
  if (filters.minStars) {
    queryParts.push(`stars:>=${filters.minStars}`);
  }
  
  if (filters.hasGoodFirstIssues) {
    queryParts.push('good-first-issues:>0');
  }
  
  if (filters.licenses && filters.licenses.length > 0) {
    queryParts.push(filters.licenses.map(license => `license:${license.toLowerCase()}`).join(' '));
  }
  
  const finalQuery = queryParts.filter(Boolean).join(' ') || 'stars:>1000';
  
  // Determine sort order
  let sort = 'stars';
  if (filters.sortBy === 'forks') sort = 'forks';
  else if (filters.sortBy === 'lastCommit') sort = 'updated';
  else if (filters.sortBy === 'goodFirstIssues') sort = 'help-wanted-issues';
  
  try {
    const repos = await searchRepositories(finalQuery, perPage, page, sort);
    
    // Use batch enrichment to reduce API calls (fully enrich first 10, lazy enrich rest)
    const enriched = await batchEnrichRepositories(repos, 10);
    
    // Apply additional client-side filters that GitHub doesn't support
    let filtered = enriched;
    
    if (filters.minHealthScore) {
      filtered = filtered.filter(repo => repo.healthScore >= filters.minHealthScore);
    }
    
    if (filters.minGoodFirstIssues) {
      filtered = filtered.filter(repo => repo.goodFirstIssues >= filters.minGoodFirstIssues);
    }
    
    // Apply client-side sorting if needed
    if (filters.sortBy && !['stars', 'forks', 'lastCommit', 'goodFirstIssues'].includes(filters.sortBy)) {
      filtered.sort((a, b) => {
        if (filters.sortBy === 'healthScore') return b.healthScore - a.healthScore;
        if (filters.sortBy === 'contributors') return b.contributors - a.contributors;
        return 0;
      });
    }
    
    return {
      results: filtered,
      hasMore: repos.length === perPage // If we got full page, there might be more
    };
  } catch (error) {
    console.error('Error searching with filters:', error);
    throw error;
  }
};

/**
 * Clear the cache (both memory and localStorage)
 */
export const clearCache = () => {
  cache.clear();
  
  // Clear localStorage cache as well
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const keys = Object.keys(localStorage);
      let clearedCount = 0;
      
      keys.forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX) || key.startsWith(STORAGE_EXPIRY_KEY)) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });
      
      console.log(`🧹 Cleared ${clearedCount} cached items from localStorage`);
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }
  
  console.log('✅ Cache cleared successfully');
};

