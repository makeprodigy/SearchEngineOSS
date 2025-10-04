// Calculate repository health score (0-100)
export const calculateHealthScore = (repo) => {
  let score = 0;
  
  // Activity score (30 points)
  const activityScore = Math.min(30, (repo.commits.lastMonth / 100) * 30);
  score += activityScore;
  
  // Community engagement (25 points)
  const contributorsScore = Math.min(15, (repo.contributors / 1000) * 15);
  const starsScore = Math.min(10, (repo.stars / 50000) * 10);
  score += contributorsScore + starsScore;
  
  // Maintenance (25 points)
  const lastCommitDate = new Date(repo.lastCommitDate);
  const daysSinceLastCommit = Math.floor((new Date() - lastCommitDate) / (1000 * 60 * 60 * 24));
  const maintenanceScore = daysSinceLastCommit <= 7 ? 25 : 
                           daysSinceLastCommit <= 30 ? 20 :
                           daysSinceLastCommit <= 90 ? 15 :
                           daysSinceLastCommit <= 180 ? 10 : 5;
  score += maintenanceScore;
  
  // Issue management (20 points)
  const issueRatio = repo.openIssues / (repo.stars / 100);
  const issueScore = issueRatio < 1 ? 20 :
                     issueRatio < 2 ? 15 :
                     issueRatio < 5 ? 10 : 5;
  score += issueScore;
  
  return Math.round(Math.min(100, score));
};

export const getHealthScoreColor = (score) => {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 75) return 'text-blue-600 dark:text-blue-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

export const getHealthScoreBgColor = (score) => {
  if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
  if (score >= 75) return 'bg-blue-100 dark:bg-blue-900/30';
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
};

export const getHealthScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
};

