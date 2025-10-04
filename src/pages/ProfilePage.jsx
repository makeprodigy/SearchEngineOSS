import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Code, Save, Edit2, X } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, userData, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    bio: userData?.bio || '',
    techStack: userData?.techStack?.join(', ') || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const techStackArray = formData.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      await updateProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        techStack: techStackArray
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: userData?.displayName || '',
      bio: userData?.bio || '',
      techStack: userData?.techStack?.join(', ') || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Profile
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 btn-primary"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Card */}
          <div className="card p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tech Stack
                  </label>
                  <div className="relative">
                    <Code className="absolute left-3 top-3 text-gray-400" size={20} />
                    <textarea
                      name="techStack"
                      value={formData.techStack}
                      onChange={handleChange}
                      rows={3}
                      className="input-field pl-10 resize-none"
                      placeholder="React, Node.js, Python, etc. (comma-separated)"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Enter your preferred technologies separated by commas. This helps us recommend relevant projects.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 btn-primary disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 btn-secondary"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <Mail size={20} />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-lg text-gray-900 dark:text-white ml-7">
                    {currentUser?.email}
                  </p>
                </div>

                {/* Display Name */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <User size={20} />
                    <span className="font-medium">Display Name</span>
                  </div>
                  <p className="text-lg text-gray-900 dark:text-white ml-7">
                    {userData?.displayName || 'Not set'}
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <User size={20} />
                    <span className="font-medium">Bio</span>
                  </div>
                  <p className="text-gray-900 dark:text-white ml-7">
                    {userData?.bio || 'No bio yet'}
                  </p>
                </div>

                {/* Tech Stack */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <Code size={20} />
                    <span className="font-medium">Tech Stack</span>
                  </div>
                  <div className="ml-7">
                    {userData?.techStack && userData.techStack.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userData.techStack.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No tech stack specified</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Saved Repositories</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {userData?.savedRepos?.length || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {userData?.createdAt ? new Date(userData.createdAt).getFullYear() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

