// GitHub API service for fetching real repository data
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN; // Optional: Add token for higher rate limits

// Cache to store recent API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRateLimit = async (url, options = {}) => {
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
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    if (response.status === 403) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      throw new Error(`GitHub API rate limit exceeded. Resets at ${new Date(resetTime * 1000).toLocaleTimeString()}`);
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Get cached data if available and fresh
const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

// Store data in cache
const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

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
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const searchQuery = query || 'stars:>1000'; // Default to popular repos
  const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}&page=${page}&sort=${sort}`;
  
  try {
    const data = await fetchWithRateLimit(url);
    const results = data.items || [];
    setCache(cacheKey, results);
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
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  
  try {
    const data = await fetchWithRateLimit(url);
    setCache(cacheKey, data);
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
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=1`;
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {}
    });
    
    const linkHeader = response.headers.get('Link');
    if (linkHeader) {
      const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (matches) {
        const count = parseInt(matches[1]);
        setCache(cacheKey, count);
        return count;
      }
    }
    
    // If no Link header, fetch the actual list (small repo)
    const data = await fetchWithRateLimit(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100`);
    const count = data.length;
    setCache(cacheKey, count);
    return count;
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    return 0;
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
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  const labels = ['good first issue', 'good-first-issue', 'beginner', 'beginner-friendly', 'first-timers-only'];
  const url = `${GITHUB_API_BASE}/search/issues?q=repo:${owner}/${repo}+is:issue+is:open+label:"${labels.join('","')}"&per_page=1`;
  
  try {
    const data = await fetchWithRateLimit(url);
    const count = data.total_count || 0;
    setCache(cacheKey, count);
    return count;
  } catch (error) {
    console.error(`Error fetching good first issues for ${owner}/${repo}:`, error);
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
  const cached = getCached(cacheKey);
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
    setCache(cacheKey, result);
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
 * @returns {Promise<Array>} Array of 12 issue counts
 */
export const getIssueHistory = async (owner, repo) => {
  // For performance, we'll generate a simplified version
  // In a production app, you might want to fetch actual historical data
  const currentIssues = await getRepository(owner, repo);
  const openIssues = currentIssues.open_issues_count || 0;
  
  // Generate approximate history with some variance
  return Array.from({ length: 12 }, (_, i) => {
    const variance = Math.random() * 0.3 - 0.15; // ±15% variance
    return Math.max(0, Math.round(openIssues * (1 + variance)));
  });
};

/**
 * Transform GitHub API repository to app format
 * @param {Object} githubRepo - Repository from GitHub API
 * @param {Object} additionalData - Additional fetched data
 * @returns {Object} Repository in app format
 */
export const transformRepository = async (githubRepo, additionalData = {}) => {
  const owner = githubRepo.owner.login;
  const name = githubRepo.name;
  
  // Use provided additional data or defaults
  const contributors = additionalData.contributors ?? 0;
  const goodFirstIssues = additionalData.goodFirstIssues ?? 0;
  const commits = additionalData.commits ?? { lastWeek: 0, lastMonth: 0 };
  const issueHistory = additionalData.issueHistory ?? Array(12).fill(githubRepo.open_issues_count || 0);

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
    stars: githubRepo.stargazers_count,
    forks: githubRepo.forks_count,
    watchers: githubRepo.watchers_count,
    openIssues: githubRepo.open_issues_count,
    contributors,
    goodFirstIssues,
    license: githubRepo.license?.spdx_id || githubRepo.license?.name || 'No License',
    lastCommitDate: githubRepo.pushed_at ? new Date(githubRepo.pushed_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    activePRs: 0, // GitHub doesn't provide this easily, would need separate call
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
  
  // Activity score (30 points)
  const activityScore = Math.min(30, (repo.commits.lastMonth / 100) * 30);
  score += activityScore;
  
  // Community engagement (25 points)
  const contributorsScore = Math.min(15, (repo.contributors / 1000) * 15);
  const starsScore = Math.min(10, (repo.stars / 50000) * 10);
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
  const issueRatio = repo.openIssues / (repo.stars / 100);
  const issueScore = issueRatio < 1 ? 20 :
                    issueRatio < 2 ? 15 :
                    issueRatio < 5 ? 10 : 5;
  score += issueScore;
  
  return Math.round(Math.min(100, score));
};

/**
 * Fetch enriched repository data (with all additional info)
 * @param {Object} githubRepo - Basic repository data from search
 * @param {boolean} fetchAll - Whether to fetch all additional data
 * @returns {Promise<Object>} Enriched repository
 */
export const enrichRepository = async (githubRepo, fetchAll = false) => {
  const owner = githubRepo.owner.login;
  const name = githubRepo.name;
  
  if (!fetchAll) {
    // Quick transform without additional API calls
    return transformRepository(githubRepo);
  }
  
  try {
    // Fetch additional data in parallel
    const [contributors, goodFirstIssues, commits] = await Promise.all([
      getContributorsCount(owner, name),
      getGoodFirstIssues(owner, name),
      getCommitActivity(owner, name),
    ]);
    
    const issueHistory = await getIssueHistory(owner, name);
    
    return transformRepository(githubRepo, {
      contributors,
      goodFirstIssues,
      commits,
      issueHistory,
    });
  } catch (error) {
    console.error(`Error enriching repository ${owner}/${name}:`, error);
    // Return basic transform if enrichment fails
    return transformRepository(githubRepo);
  }
};

/**
 * Fetch trending repositories (most stars recently)
 * @param {number} limit - Number of repositories to fetch
 * @returns {Promise<Array>} Array of repositories
 */
export const getTrendingRepos = async (limit = 6) => {
  const cacheKey = `trending:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Get repos created in the last month with most stars
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const dateString = date.toISOString().split('T')[0];
  
  try {
    const repos = await searchRepositories(`created:>${dateString}`, limit, 1, 'stars');
    const enriched = await Promise.all(
      repos.slice(0, limit).map(repo => enrichRepository(repo, false))
    );
    setCache(cacheKey, enriched);
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
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const repos = await searchRepositories('stars:>50000', limit, 1, 'stars');
    const enriched = await Promise.all(
      repos.slice(0, limit).map(repo => enrichRepository(repo, false))
    );
    setCache(cacheKey, enriched);
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
 * @returns {Promise<Array>} Array of repositories
 */
export const searchWithFilters = async (query, filters = {}) => {
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
    const repos = await searchRepositories(finalQuery, 30, 1, sort);
    const enriched = await Promise.all(
      repos.map(repo => enrichRepository(repo, false))
    );
    
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
    
    return filtered;
  } catch (error) {
    console.error('Error searching with filters:', error);
    throw error;
  }
};

/**
 * Clear the cache
 */
export const clearCache = () => {
  cache.clear();
};

