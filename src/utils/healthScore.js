export const calculateHealthScore = (repo) => {
  let score = 0;

  // Components and weights (total 100)
  // - Activity (commits last month): 30
  // - Stars: 25
  // - Issue management: 20
  // - Recency (last commit): 25

  const monthlyCommits = Number(repo.commits?.lastMonth || 0);
  // scale: 0 commits => 0, 50+ commits => full 30
  const activityScore = Math.min(30, (monthlyCommits / 50) * 30);
  score += activityScore;

  const stars = Number(repo.stars || 0);
  // scale: 0 => 0, 50k+ => full 25
  const starScore = Math.min(25, (stars / 50000) * 25);
  score += starScore;

  const openIssues = Number(repo.openIssues || 0);
  const issueRatio = openIssues / Math.max(1, stars / 100);
  let issueScore = 0;
  if (issueRatio <= 0.5) issueScore = 20;
  else if (issueRatio <= 1) issueScore = 15;
  else if (issueRatio <= 2) issueScore = 10;
  else if (issueRatio <= 5) issueScore = 5;
  else issueScore = 0;
  // scale issueScore into 20-point bucket
  issueScore = (issueScore / 20) * 20;
  score += issueScore;

  const lastCommit = new Date(repo.lastCommitDate);
  const daysAgo = (new Date() - lastCommit) / (1000 * 60 * 60 * 24);
  let freshnessScore = 0;
  if (daysAgo <= 7) freshnessScore = 25;
  else if (daysAgo <= 30) freshnessScore = 20;
  else if (daysAgo <= 90) freshnessScore = 12;
  else if (daysAgo <= 180) freshnessScore = 6;
  else freshnessScore = 0;
  score += freshnessScore;

  // Debug log to help tune the formula in dev
  if (typeof window !== 'undefined') {
    try {
      console.log('HealthScore calc:', {
        repo: repo.fullName || repo.name || repo.id,
        activityScore: Math.round(activityScore),
        starScore: Math.round(starScore),
        issueScore: Math.round(issueScore),
        freshnessScore: Math.round(freshnessScore),
        total: Math.round(Math.min(score, 100))
      });
    } catch (e) {
      console.error('HealthScore calc error:', e);
    }
  }

  return Math.round(Math.min(score, 100));
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