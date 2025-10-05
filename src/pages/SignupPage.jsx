import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Navigate immediately with user data - don't wait for Firebase
    navigate('/onboarding', { 
      state: { 
        email: formData.email, 
        displayName: formData.displayName 
      } 
    });

    // Fire the signup in the background (don't await)
    signup(formData.email, formData.password, formData.displayName).catch(error => {
      console.error('Signup error (background):', error);
      // User is already on onboarding page, so we just log the error
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-primary-100">Start your open source contribution journey</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                {!formData.displayName && (
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-opacity duration-200 pointer-events-none z-10" size={20} />
                )}
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className={`input-field transition-all duration-200 relative z-20 bg-transparent ${formData.displayName ? 'pl-4' : 'pl-10'}`}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                {!formData.email && (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-opacity duration-200 pointer-events-none z-10" size={20} />
                )}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={`input-field transition-all duration-200 relative z-20 bg-transparent ${formData.email ? 'pl-4' : 'pl-10'}`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                {!formData.password && (
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-opacity duration-200 pointer-events-none z-10" size={20} />
                )}
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={`input-field transition-all duration-200 relative z-20 bg-transparent ${formData.password ? 'pl-4' : 'pl-10'}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                {!formData.confirmPassword && (
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-opacity duration-200 pointer-events-none z-10" size={20} />
                )}
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={`input-field transition-all duration-200 relative z-20 bg-transparent ${formData.confirmPassword ? 'pl-4' : 'pl-10'}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

