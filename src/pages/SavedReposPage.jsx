import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RepoGrid from '../components/RepoGrid';
import { mockRepos } from '../data/mockRepos';
import { Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedReposPage = () => {
  const { userData } = useAuth();

  const savedRepos = useMemo(() => {
    if (!userData?.savedRepos || userData.savedRepos.length === 0) {
      return [];
    }
    return mockRepos.filter(repo => userData.savedRepos.includes(repo.id));
  }, [userData?.savedRepos]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="text-primary-600 dark:text-primary-400" size={32} />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Saved Repositories
          </h1>
        </div>

        {savedRepos.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No saved repositories yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start exploring and save repositories that interest you. 
              Click the bookmark icon on any repository card to save it here.
            </p>
            <Link
              to="/search"
              className="inline-block btn-primary"
            >
              Explore Repositories
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You have saved {savedRepos.length} {savedRepos.length === 1 ? 'repository' : 'repositories'}
            </p>
            <RepoGrid 
              repos={savedRepos}
              savedRepos={userData?.savedRepos || []}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SavedReposPage;

