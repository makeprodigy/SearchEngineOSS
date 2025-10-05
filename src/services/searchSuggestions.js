// Search suggestions service
import { Folder, Code, Tag, User } from 'lucide-react';

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

// Popular topics/technologies with enhanced coverage
const POPULAR_TOPICS = [
  // Core technologies
  'machine-learning', 'web-framework', 'mobile-app', 'database', 'api',
  'frontend', 'backend', 'devops', 'blockchain', 'ai', 'react', 'vue',
  'angular', 'nodejs', 'python', 'javascript', 'typescript', 'docker',
  'kubernetes', 'aws', 'azure', 'gcp', 'microservices', 'rest-api',
  'graphql', 'mongodb', 'postgresql', 'redis', 'elasticsearch',
  
  // Additional popular topics
  'web-app', 'desktop-app', 'cli', 'library', 'framework', 'tool',
  'plugin', 'extension', 'theme', 'template', 'starter', 'boilerplate',
  'education', 'learning', 'tutorial', 'example', 'demo', 'showcase',
  'game', 'gaming', 'engine', 'simulation', 'visualization', 'chart',
  'ui', 'ux', 'design', 'css', 'html', 'scss', 'sass', 'less',
  'testing', 'unit-test', 'integration-test', 'e2e', 'automation',
  'ci', 'cd', 'pipeline', 'deployment', 'monitoring', 'logging',
  'security', 'cryptography', 'encryption', 'authentication', 'authorization',
  'performance', 'optimization', 'cache', 'cdn', 'pwa', 'spa',
  'ssr', 'ssg', 'jamstack', 'serverless', 'edge', 'cloud',
  'iot', 'hardware', 'arduino', 'raspberry-pi', 'embedded', 'firmware',
  'mobile', 'ios', 'android', 'flutter', 'react-native', 'xamarin',
  'data-science', 'analytics', 'visualization', 'dashboard', 'reporting',
  'nlp', 'computer-vision', 'deep-learning', 'neural-network', 'tensorflow',
  'pytorch', 'scikit-learn', 'opencv', 'pandas', 'numpy', 'matplotlib'
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
      icon: Folder,
      description: 'Repository'
    }));

  // Language suggestions
  const langMatches = POPULAR_LANGUAGES
    .filter(lang => lang.toLowerCase().includes(normalizedQuery))
    .slice(0, 2)
    .map(lang => ({
      text: `language:${lang}`,
      type: SUGGESTION_TYPES.LANGUAGE,
      icon: Code,
      description: 'Programming Language'
    }));

  // Topic suggestions with enhanced matching
  const topicMatches = POPULAR_TOPICS
    .filter(topic => {
      const topicLower = topic.toLowerCase();
      return topicLower.includes(normalizedQuery) || 
             topicLower.split('-').some(part => part.startsWith(normalizedQuery)) ||
             topicLower.split(' ').some(part => part.startsWith(normalizedQuery));
    })
    .slice(0, 3)
    .map(topic => ({
      text: `topic:${topic}`,
      type: SUGGESTION_TYPES.TOPIC,
      icon: Tag,
      description: 'Search in topics'
    }));

  // User suggestions
  const userMatches = POPULAR_USERS
    .filter(user => user.toLowerCase().includes(normalizedQuery))
    .slice(0, 1)
    .map(user => ({
      text: `user:${user}`,
      type: SUGGESTION_TYPES.USER,
      icon: User,
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

/**
 * Get topic-based search suggestions
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of suggestions
 * @returns {Array} Array of topic suggestions
 */
export const getTopicSuggestions = (query, limit = 5) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  return POPULAR_TOPICS
    .filter(topic => {
      const topicLower = topic.toLowerCase();
      return topicLower.includes(normalizedQuery) || 
             topicLower.split('-').some(part => part.startsWith(normalizedQuery)) ||
             topicLower.split(' ').some(part => part.startsWith(normalizedQuery));
    })
    .slice(0, limit)
    .map(topic => ({
      text: topic,
      type: SUGGESTION_TYPES.TOPIC,
      icon: Tag,
      description: 'Topic'
    }));
};

/**
 * Parse search query to extract topics and other qualifiers
 * @param {string} query - Search query
 * @returns {Object} Parsed query with topics and base query
 */
export const parseSearchQuery = (query) => {
  if (!query || !query.trim()) {
    return { baseQuery: '', topics: [], qualifiers: {} };
  }

  const topics = [];
  const qualifiers = {};
  let baseQuery = query.trim();

  // Extract topic: qualifiers
  const topicRegex = /topic:([^\s]+)/g;
  let match;
  while ((match = topicRegex.exec(query)) !== null) {
    topics.push(match[1].replace(/['"]/g, ''));
  }
  
  // Extract other qualifiers
  const languageRegex = /language:([^\s]+)/g;
  while ((match = languageRegex.exec(query)) !== null) {
    qualifiers.language = match[1];
  }

  const userRegex = /user:([^\s]+)/g;
  while ((match = userRegex.exec(query)) !== null) {
    qualifiers.user = match[1];
  }

  // Remove qualifiers from base query
  baseQuery = baseQuery
    .replace(topicRegex, '')
    .replace(languageRegex, '')
    .replace(userRegex, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { baseQuery, topics, qualifiers };
};