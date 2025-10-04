import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Star, Code, Loader2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import RepoGrid from '../components/RepoGrid';
import { getPopularRepos, getTrendingRepos, searchWithFilters } from '../services/github';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularRepos, setPopularRepos] = useState([]);
  const [trendingRepos, setTrendingRepos] = useState([]);
  const [recommendedRepos, setRecommendedRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepositories();
  }, [userData?.techStack]);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      // Fetch popular and trending repos in parallel
      const [popular, trending] = await Promise.all([
        getPopularRepos(6),
        getTrendingRepos(6),
      ]);
      
      setPopularRepos(popular);
      setTrendingRepos(trending);

      // Fetch recommendations based on user's tech stack
      if (userData?.techStack?.length > 0) {
        const query = userData.techStack.join(' OR ');
        const recommended = await searchWithFilters(query, { minStars: 1000 });
        setRecommendedRepos(recommended.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading repositories:', error);
      // If GitHub API fails, we could fallback to mock data
      // For now, we'll just show empty sections
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover Your Next Open Source Project
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Find healthy, beginner-friendly repositories to contribute to
            </p>
            
            {/* Search Bar */}
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search for repositories by name, language, or topic..."
              className="mb-6"
            />
            
            <p className="text-sm text-primary-200">
              Try searching for: React, Machine Learning, Python, Web Development
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400">
                Loading repositories from GitHub...
              </p>
            </div>
          </div>
        )}

        {/* Content - Only show when not loading */}
        {!loading && (
          <>
            {/* Recommended Based on Tech Stack */}
            {recommendedRepos.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Code className="text-primary-600 dark:text-primary-400" size={28} />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Recommended For You
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Based on your tech stack: {userData?.techStack?.join(', ')}
                </p>
                <RepoGrid 
                  repos={recommendedRepos} 
                  savedRepos={userData?.savedRepos || []}
                />
              </section>
            )}

            {/* Most Popular Projects */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Star className="text-yellow-500" size={28} />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Most Popular Projects
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Top starred repositories on GitHub
              </p>
              <RepoGrid 
                repos={popularRepos} 
                savedRepos={userData?.savedRepos || []}
              />
            </section>

            {/* Trending Projects */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-green-500" size={28} />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Trending Recently
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Newly popular repositories gaining stars
              </p>
              <RepoGrid 
                repos={trendingRepos} 
                savedRepos={userData?.savedRepos || []}
              />
            </section>
          </>
        )}

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Contributing?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Create an account to save your favorite projects and get personalized recommendations
          </p>
          <button
            onClick={() => navigate('/search')}
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
          >
            Explore All Projects
          </button>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;

