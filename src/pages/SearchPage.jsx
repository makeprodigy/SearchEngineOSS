import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import RepoGrid from '../components/RepoGrid';
import { searchWithFilters } from '../services/github';
import { searchRepos, getUniqueLanguages, getUniqueLicenses } from '../utils/searchUtils';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userData } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useGitHubAPI, setUseGitHubAPI] = useState(true);

  // Debounce search query and filters for real-time filtering
  const debouncedQuery = useDebounce(query, 500);
  const debouncedFilters = useDebounce(filters, 500);

  // Available languages and licenses for filters
  const [languages, setLanguages] = useState(['JavaScript', 'Python', 'TypeScript', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP', 'Swift']);
  const [licenses, setLicenses] = useState(['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'LGPL-3.0']);

  // Sync query with URL params
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Perform search when debounced values change
  useEffect(() => {
    performSearch(debouncedQuery, debouncedFilters);
  }, [debouncedQuery, debouncedFilters, useGitHubAPI]);

  const performSearch = async (searchQuery, searchFilters) => {
    setLoading(true);
    setError(null);

    try {
      if (useGitHubAPI) {
        // Use GitHub API for real-time data
        const searchResults = await searchWithFilters(searchQuery, searchFilters);
        setResults(searchResults);
      } else {
        // Fallback to mock data (if needed for development)
        const { mockRepos } = await import('../data/mockRepos');
        const searchResults = searchRepos(mockRepos, searchQuery, searchFilters);
        setResults(searchResults);
        
        // Update filter options from mock data
        setLanguages(getUniqueLanguages(mockRepos));
        setLicenses(getUniqueLicenses(mockRepos));
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch repositories. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search repositories on GitHub..."
            className="max-w-4xl mx-auto"
          />
          
          <div className="flex items-center justify-between mt-4 max-w-4xl mx-auto">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold"
            >
              <SlidersHorizontal size={20} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {/* API Toggle (for development) */}
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={useGitHubAPI}
                  onChange={(e) => setUseGitHubAPI(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Use GitHub API</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`w-full md:w-80 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              languages={languages}
              licenses={licenses}
            />
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {query ? `Search results for "${query}"` : 'Discover Repositories'}
                </h1>
                {loading && (
                  <Loader2 className="animate-spin text-primary-600 dark:text-primary-400" size={24} />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? 'Searching...' : `Found ${results.length} ${results.length === 1 ? 'repository' : 'repositories'}`}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">
                      Error Loading Repositories
                    </h3>
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      {error}
                    </p>
                    <button
                      onClick={() => performSearch(query, filters)}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && (
              <RepoGrid 
                repos={results}
                savedRepos={userData?.savedRepos || []}
              />
            )}

            {/* Loading State */}
            {loading && results.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    Searching GitHub repositories...
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

