import Fuse from 'fuse.js';

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'fullName', weight: 1.8 },
    { name: 'description', weight: 1.5 },
    { name: 'topics', weight: 1.3 },
    { name: 'language', weight: 1.2 },
    { name: 'owner', weight: 1 }
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2
};

export const searchRepos = (repos, query, filters = {}) => {
  let results = [...repos];

  // Apply fuzzy search if query exists
  if (query && query.trim()) {
    const fuse = new Fuse(repos, fuseOptions);
    const searchResults = fuse.search(query);
    results = searchResults.map(result => result.item);
  }

  // Apply filters
  if (filters.languages && filters.languages.length > 0) {
    results = results.filter(repo => 
      filters.languages.includes(repo.language)
    );
  }

  if (filters.licenses && filters.licenses.length > 0) {
    results = results.filter(repo => 
      filters.licenses.includes(repo.license)
    );
  }

  if (filters.topics && filters.topics.length > 0) {
    results = results.filter(repo =>
      filters.topics.some(topic => 
        repo.topics.some(repoTopic => 
          repoTopic.toLowerCase().includes(topic.toLowerCase())
        )
      )
    );
  }

  if (filters.minStars !== undefined) {
    results = results.filter(repo => repo.stars >= filters.minStars);
  }

  if (filters.maxStars !== undefined) {
    results = results.filter(repo => repo.stars <= filters.maxStars);
  }

  if (filters.minForks !== undefined) {
    results = results.filter(repo => repo.forks >= filters.minForks);
  }

  if (filters.minIssues !== undefined) {
    results = results.filter(repo => repo.openIssues >= filters.minIssues);
  }

  if (filters.maxIssues !== undefined) {
    results = results.filter(repo => repo.openIssues <= filters.maxIssues);
  }

  if (filters.minPRs !== undefined) {
    results = results.filter(repo => repo.activePRs >= filters.minPRs);
  }

  if (filters.hasGoodFirstIssues) {
    results = results.filter(repo => repo.goodFirstIssues > 0);
  }

  if (filters.minGoodFirstIssues !== undefined) {
    results = results.filter(repo => repo.goodFirstIssues >= filters.minGoodFirstIssues);
  }

  if (filters.minHealthScore !== undefined) {
    results = results.filter(repo => repo.healthScore >= filters.minHealthScore);
  }

  if (filters.daysSinceLastCommit !== undefined) {
    results = results.filter(repo => {
      const lastCommit = new Date(repo.lastCommitDate);
      const daysSince = Math.floor((new Date() - lastCommit) / (1000 * 60 * 60 * 24));
      return daysSince <= filters.daysSinceLastCommit;
    });
  }

  // Apply sorting
  if (filters.sortBy) {
    results = sortRepos(results, filters.sortBy, filters.sortOrder || 'desc');
  }

  return results;
};

export const sortRepos = (repos, sortBy, sortOrder = 'desc') => {
  const sorted = [...repos];
  
  sorted.sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'stars':
        valueA = a.stars;
        valueB = b.stars;
        break;
      case 'forks':
        valueA = a.forks;
        valueB = b.forks;
        break;
      case 'issues':
        valueA = a.openIssues;
        valueB = b.openIssues;
        break;
      case 'prs':
        valueA = a.activePRs;
        valueB = b.activePRs;
        break;
      case 'goodFirstIssues':
        valueA = a.goodFirstIssues;
        valueB = b.goodFirstIssues;
        break;
      case 'healthScore':
        valueA = a.healthScore;
        valueB = b.healthScore;
        break;
      case 'lastCommit':
        valueA = new Date(a.lastCommitDate);
        valueB = new Date(b.lastCommitDate);
        break;
      case 'contributors':
        valueA = a.contributors;
        valueB = b.contributors;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  return sorted;
};

// Get unique values for filter options
export const getUniqueLanguages = (repos) => {
  return [...new Set(repos.map(repo => repo.language))].filter(Boolean).sort();
};

export const getUniqueLicenses = (repos) => {
  return [...new Set(repos.map(repo => repo.license))].filter(Boolean).sort();
};

export const getUniqueTopics = (repos) => {
  const allTopics = repos.flatMap(repo => repo.topics);
  return [...new Set(allTopics)].sort();
};

