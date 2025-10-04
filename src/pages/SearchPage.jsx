import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import RepoGrid from '../components/RepoGrid';
import { searchWithFilters, clearCache } from '../services/github';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [useGitHubAPI, setUseGitHubAPI] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [resultsPerPage, setResultsPerPage] = useState(30);

  // Debounce search query and filters for real-time filtering
  const debouncedQuery = useDebounce(query, 800); // Increased debounce time
  const debouncedFilters = useDebounce(filters, 800);

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

  // Perform search when debounced values change (but only if there's a query or filters)
  useEffect(() => {
    // Reset to page 1 when query or filters change
    setCurrentPage(1);
    
    // Only search if we have a query or if user has applied filters
    if (debouncedQuery.trim() || Object.keys(debouncedFilters).length > 0) {
      performSearch(debouncedQuery, debouncedFilters, 1, false);
    } else if (hasSearched) {
      // Clear results if query is cleared after a search
      setResults([]);
      setError(null);
      setHasMore(false);
    }
  }, [debouncedQuery, debouncedFilters, useGitHubAPI, resultsPerPage]);

  const performSearch = async (searchQuery, searchFilters, page = 1, append = false) => {
    // Don't search if query is empty and no filters
    if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
      setResults([]);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    setHasSearched(true);

    try {
      if (useGitHubAPI) {
        // Use GitHub API for real-time data
        const { results: searchResults, hasMore: moreAvailable } = await searchWithFilters(
          searchQuery, 
          searchFilters, 
          page,
          resultsPerPage
        );
        
        if (append) {
          // Append to existing results
          setResults(prev => [...prev, ...searchResults]);
        } else {
          // Replace results
          setResults(searchResults);
        }
        
        setHasMore(moreAvailable);
      } else {
        // Fallback to mock data (if needed for development)
        const { mockRepos } = await import('../data/mockRepos');
        const searchResults = searchRepos(mockRepos, searchQuery, searchFilters);
        setResults(searchResults);
        setHasMore(false);
        
        // Update filter options from mock data
        setLanguages(getUniqueLanguages(mockRepos));
        setLicenses(getUniqueLicenses(mockRepos));
      }
    } catch (err) {
      console.error('Search error:', err);
      
      // Enhanced error message for rate limiting
      if (err.message.includes('rate limit')) {
        setError(err.message);
      } else {
        setError(err.message || 'Failed to fetch repositories. Please try again.');
      }
      
      if (!append) {
        setResults([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    performSearch(query, filters, nextPage, true);
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

  const handleClearCache = () => {
    clearCache();
    setError(null);
    setCurrentPage(1);
    performSearch(query, filters, 1, false);
  };

  const handleResultsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setResultsPerPage(newValue);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search repositories on GitHub..."
          />
          
          <div className="flex items-center justify-between mt-4">
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
              <div className="flex items-center justify-between mb-2 gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {query ? `Search results for "${query}"` : 'Discover Repositories'}
                </h1>
                
                <div className="flex items-center gap-3">
                  {/* Results per page selector */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="resultsPerPage" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      Show:
                    </label>
                    <select
                      id="resultsPerPage"
                      value={resultsPerPage}
                      onChange={handleResultsPerPageChange}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      per page
                    </span>
                  </div>
                  
                  {loading && (
                    <Loader2 className="animate-spin text-primary-600 dark:text-primary-400" size={24} />
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? 'Searching...' : 
                  hasSearched ? `Found ${results.length} ${results.length === 1 ? 'repository' : 'repositories'}` :
                  'Enter a search query or apply filters to discover repositories'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">
                      Error Loading Repositories
                    </h3>
                    <p className="text-red-700 dark:text-red-400 text-sm mb-3">
                      {error}
                    </p>
                    
                    {error.includes('rate limit') && (
                      <div className="bg-red-100 dark:bg-red-900/40 rounded p-3 mb-3 text-sm">
                        <p className="text-red-800 dark:text-red-300 font-medium mb-2">
                          💡 Quick fixes:
                        </p>
                        <ul className="text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                          <li>Click "Clear Cache & Retry" below</li>
                          <li>Wait for the rate limit to reset (see time above)</li>
                          <li>Restart your dev server: <code className="bg-red-200 dark:bg-red-800 px-1 py-0.5 rounded">npm run dev</code></li>
                          <li>Verify your GitHub token is in the .env file</li>
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => performSearch(query, filters)}
                        className="text-sm px-3 py-1.5 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                      >
                        Try again
                      </button>
                      {error.includes('rate limit') && (
                        <button
                          onClick={handleClearCache}
                          className="text-sm px-3 py-1.5 bg-yellow-600 dark:bg-yellow-700 text-white rounded hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
                        >
                          Clear Cache & Retry
                        </button>
                      )}
                      <button
                        onClick={() => setUseGitHubAPI(false)}
                        className="text-sm px-3 py-1.5 border border-red-600 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Use Mock Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && !hasSearched && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Start Your Search
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Search for open-source repositories or use filters to discover projects that match your interests
                  </p>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && hasSearched && (
              <>
                <RepoGrid 
                  repos={results}
                  savedRepos={userData?.savedRepos || []}
                />
                
                {/* Load More Button */}
                {hasMore && results.length > 0 && (
                  <div className="flex justify-center mt-8 mb-4">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Loading More...
                        </>
                      ) : (
                        <>
                          Load More Results
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* End of results message */}
                {!hasMore && results.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      🎉 You've reached the end of the results
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Loading State */}
            {loading && (
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

