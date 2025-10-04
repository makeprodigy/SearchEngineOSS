import { Link, useNavigate } from 'react-router-dom';
import { Code2, User, Bookmark, LogOut, LogIn } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { currentUser, userData, signout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            <Code2 size={32} />
            <span className="hidden sm:inline">OSS Discovery</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <ThemeToggle />

            {currentUser ? (
              <>
                <Link
                  to="/saved"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Saved Repositories"
                >
                  <Bookmark size={20} className="text-gray-700 dark:text-gray-300" />
                </Link>
                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Profile"
                >
                  <User size={20} className="text-gray-700 dark:text-gray-300" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 btn-primary"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

