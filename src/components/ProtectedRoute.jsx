import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, userData } = useAuth();
  
  // Check if user is authenticated via localStorage
  const isLocallyAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access if Firebase user exists OR localStorage shows authenticated
  if (!currentUser && !isLocallyAuthenticated && !userData) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

