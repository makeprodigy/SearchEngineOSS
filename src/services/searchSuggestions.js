// Search suggestions service
const SUGGESTION_TYPES = {
  REPOSITORY: 'repository',
  LANGUAGE: 'language',
  TOPIC: 'topic',
  USER: 'user'
};

// Popular repositories for suggestions
const POPULAR_REPOS = [
  'facebook/react',
  'microsoft/vscode',
  'tensorflow/tensorflow',
  'vuejs/vue',
  'angular/angular',
  'nodejs/node',
  'pytorch/pytorch',
  'flutter/flutter',
  'kubernetes/kubernetes',
  'django/django',
  'rust-lang/rust',
  'vercel/next.js',
  'tailwindlabs/tailwindcss',
  'sveltejs/svelte',
  'electron/electron'
];

// Popular programming languages
const POPULAR_LANGUAGES = [
  'JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB'
];

// Popular topics/technologies
const POPULAR_TOPICS = [
  'machine-learning', 'web-framework', 'mobile-app', 'database', 'api',
  'frontend', 'backend', 'devops', 'blockchain', 'ai', 'react', 'vue',
  'angular', 'nodejs', 'python', 'javascript', 'typescript', 'docker',
  'kubernetes', 'aws', 'azure', 'gcp', 'microservices', 'rest-api',
  'graphql', 'mongodb', 'postgresql', 'redis', 'elasticsearch'
];

// Popular GitHub users/organizations
const POPULAR_USERS = [
  'microsoft', 'google', 'facebook', 'apple', 'amazon', 'netflix',
  'uber', 'airbnb', 'spotify', 'github', 'gitlab', 'docker',
  'kubernetes', 'tensorflow', 'pytorch', 'react', 'vuejs', 'angular'
];

export const getSearchSuggestions = async (query, limit = 8) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const suggestions = [];

  // Repository suggestions
  const repoMatches = POPULAR_REPOS
    .filter(repo => repo.toLowerCase().includes(normalizedQuery))
    .slice(0, 3)
    .map(repo => ({
      text: repo,
      type: SUGGESTION_TYPES.REPOSITORY,
      icon: '📁',
      description: 'Repository'
    }));

  // Language suggestions
  const langMatches = POPULAR_LANGUAGES
    .filter(lang => lang.toLowerCase().includes(normalizedQuery))
    .slice(0, 2)
    .map(lang => ({
      text: `language:${lang}`,
      type: SUGGESTION_TYPES.LANGUAGE,
      icon: '💻',
      description: 'Programming Language'
    }));

  // Topic suggestions
  const topicMatches = POPULAR_TOPICS
    .filter(topic => topic.toLowerCase().includes(normalizedQuery))
    .slice(0, 2)
    .map(topic => ({
      text: topic,
      type: SUGGESTION_TYPES.TOPIC,
      icon: '🏷️',
      description: 'Topic'
    }));

  // User suggestions
  const userMatches = POPULAR_USERS
    .filter(user => user.toLowerCase().includes(normalizedQuery))
    .slice(0, 1)
    .map(user => ({
      text: `user:${user}`,
      type: SUGGESTION_TYPES.USER,
      icon: '👤',
      description: 'User/Organization'
    }));

  suggestions.push(...repoMatches, ...langMatches, ...topicMatches, ...userMatches);

  // Sort by relevance (exact matches first, then partial matches)
  suggestions.sort((a, b) => {
    const aExact = a.text.toLowerCase().startsWith(normalizedQuery);
    const bExact = b.text.toLowerCase().startsWith(normalizedQuery);
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return a.text.length - b.text.length;
  });

  return suggestions.slice(0, limit);
};

// Get recent searches (you can implement localStorage for this)
export const getRecentSearches = () => {
  try {
    const recent = localStorage.getItem('recentSearches');
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

export const saveRecentSearch = (query) => {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter(item => item !== query);
    const updated = [query, ...filtered].slice(0, 5); // Keep only 5 recent searches
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};
