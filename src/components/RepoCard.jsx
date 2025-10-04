import { useState } from 'react';
import { Star, GitFork, Users, AlertCircle, GitPullRequest, Code, BookmarkPlus, Bookmark, ExternalLink, Calendar } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getHealthScoreColor, getHealthScoreBgColor, getHealthScoreLabel } from '../utils/healthScore';
import { useAuth } from '../contexts/AuthContext';
import { saveRepo, unsaveRepo } from '../services/firebase';

const RepoCard = ({ repo, isSaved = false, onToggleSave }) => {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  // Check if user is authenticated via Firebase OR localStorage
  const isAuthenticated = currentUser || userData || localStorage.getItem('isAuthenticated') === 'true';

  const splitStringWithLineBreaks = (str, chunkSize = 15) => {
    const parts = [];
    for (let i = 0; i < str.length; i += chunkSize) {
      parts.push(str.substring(i, i + chunkSize));
    }
    return parts;
  };
  
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save repositories');
      return;
    }

    // If we don't have Firebase currentUser yet, store locally and sync later
    if (!currentUser) {
      alert('Your account is being set up. Please try again in a moment.');
      return;
    }

    setSaving(true);
    try {
      if (saved) {
        await unsaveRepo(currentUser.uid, repo.id);
      } else {
        await saveRepo(currentUser.uid, repo.id);
      }
      setSaved(!saved);
      await refreshUserData();
      if (onToggleSave) onToggleSave(repo.id, !saved);
    } catch (error) {
      console.error('Error toggling save:', error);
      alert('Failed to save repository. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Prepare data for sparkline
  const sparklineData = repo.issueHistory.map((value, index) => ({
    value,
    index
  }));

  return (
    <div className="card p-6 h-full flex flex-col relative">
      {/* Header */}
      <button
        onClick={handleToggleSave}
        disabled={saving}
        className="absolute top-4 right-4 p-2 hover:bg-teal-900/30 rounded-lg transition-colors z-10"
        title={saved ? 'Remove from saved' : 'Save repository'}
      >
        {saved ? (
          <Bookmark className="text-teal-200" size={20} fill="currentColor" />
        ) : (
          <BookmarkPlus className="text-gray-400" size={20} />
        )}
      </button>

      {/* Header (title & description) */}
      <div className="mb-3">
        <h3 className="text-xl font-bold hover:text-teal-200 transition-colors leading-snug">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block whitespace-pre-line"
          >
            {splitStringWithLineBreaks(repo.fullName).map((part, idx) => (
              <span key={idx}>
                {part}
                {idx !== splitStringWithLineBreaks(repo.fullName).length - 1 && <br />}
              </span>
            ))}
          </a>
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mt-1">
          {repo.description}
        </p>
      </div>

      {/* Health Score Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`${getHealthScoreBgColor(repo.healthScore)} px-3 py-1 rounded-full`}>
          <span className={`text-sm font-bold ${getHealthScoreColor(repo.healthScore)}`}>
            Health Score: {repo.healthScore}
          </span>
        </div>
        <span className={`text-xs font-medium ${getHealthScoreColor(repo.healthScore)}`}>
          {getHealthScoreLabel(repo.healthScore)}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Star className="text-yellow-500" size={16} />
          <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(repo.stars)}</span>
          <span className="text-gray-600 dark:text-gray-400">stars</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <GitFork className="text-gray-600 dark:text-gray-400" size={16} />
          <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(repo.forks)}</span>
          <span className="text-gray-600 dark:text-gray-400">forks</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="text-blue-600 dark:text-blue-400" size={16} />
          <span className="font-semibold text-gray-900 dark:text-white">{repo.contributors}</span>
          <span className="text-gray-600 dark:text-gray-400">contributors</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <GitPullRequest className="text-purple-600 dark:text-purple-400" size={16} />
          <span className="font-semibold text-gray-900 dark:text-white">{repo.activePRs}</span>
          <span className="text-gray-600 dark:text-gray-400">active PRs</span>
        </div>
      </div>

      {/* Good First Issues Highlight */}
      {repo.goodFirstIssues > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-green-600 dark:text-green-400" size={16} />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              {repo.goodFirstIssues} good first issue{repo.goodFirstIssues !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Issue History Sparkline */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Issue Activity (Last 12 months)
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {repo.openIssues} open
          </span>
        </div>
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={sparklineData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#0ea5e9" 
              strokeWidth={2} 
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tech Stack Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
          <Code size={14} className="text-gray-600 dark:text-gray-400" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{repo.language}</span>
        </div>
        {repo.topics.slice(0, 3).map((topic, index) => (
          <span
            key={index}
            className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-md text-xs font-medium"
          >
            {topic}
          </span>
        ))}
        {repo.topics.length > 3 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 py-1">
            +{repo.topics.length - 3} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>Updated {formatDate(repo.lastCommitDate)}</span>
        </div>
        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {repo.license}
        </span>
      </div>
    </div>
  );
};

export default RepoCard;

