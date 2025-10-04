import RepoCard from './RepoCard';

const RepoGrid = ({ repos, savedRepos = [], onToggleSave, title }) => {
  if (!repos || repos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No repositories found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            isSaved={savedRepos.includes(repo.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </div>
  );
};

export default RepoGrid;

