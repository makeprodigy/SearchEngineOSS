import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSidebar = ({ filters, onFilterChange, languages, licenses, topics }) => {
  const [expandedSections, setExpandedSections] = useState({
    language: true,
    license: true,
    stars: true,
    health: true,
    goodFirstIssues: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLanguageToggle = (language) => {
    const newLanguages = filters.languages?.includes(language)
      ? filters.languages.filter(l => l !== language)
      : [...(filters.languages || []), language];
    onFilterChange({ ...filters, languages: newLanguages });
  };

  const handleLicenseToggle = (license) => {
    const newLicenses = filters.licenses?.includes(license)
      ? filters.licenses.filter(l => l !== license)
      : [...(filters.licenses || []), license];
    onFilterChange({ ...filters, licenses: newLicenses });
  };

  const handleClearAll = () => {
    onFilterChange({});
  };

  const hasActiveFilters = () => {
    return (filters.languages?.length > 0) ||
           (filters.licenses?.length > 0) ||
           filters.minStars ||
           filters.minHealthScore ||
           filters.hasGoodFirstIssues ||
           filters.sortBy;
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between text-left font-semibold text-gray-900 dark:text-white mb-3"
      >
        {title}
        {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expandedSections[section] && children}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
        {hasActiveFilters() && (
          <button
            onClick={handleClearAll}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Sort By */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || ''}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value || undefined })}
            className="input-field text-sm"
          >
            <option value="">Best Match</option>
            <option value="stars">Stars</option>
            <option value="forks">Forks</option>
            <option value="healthScore">Health Score</option>
            <option value="lastCommit">Recently Updated</option>
            <option value="goodFirstIssues">Good First Issues</option>
            <option value="contributors">Contributors</option>
          </select>
        </div>

        {/* Language Filter */}
        <FilterSection title="Language" section="language">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {languages.slice(0, 10).map((language) => (
              <label key={language} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.languages?.includes(language) || false}
                  onChange={() => handleLanguageToggle(language)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{language}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* License Filter */}
        <FilterSection title="License" section="license">
          <div className="space-y-2">
            {licenses.map((license) => (
              <label key={license} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.licenses?.includes(license) || false}
                  onChange={() => handleLicenseToggle(license)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{license}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Stars Filter */}
        <FilterSection title="Stars" section="stars">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Minimum Stars
              </label>
              <input
                type="number"
                value={filters.minStars || ''}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  minStars: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="e.g., 1000"
                className="input-field text-sm"
              />
            </div>
            <div className="space-y-2">
              {[1000, 5000, 10000, 50000].map((value) => (
                <button
                  key={value}
                  onClick={() => onFilterChange({ ...filters, minStars: value })}
                  className={`w-full text-left text-sm px-3 py-2 rounded ${
                    filters.minStars === value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {value >= 1000 ? `${value / 1000}K+` : `${value}+`} stars
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Health Score Filter */}
        <FilterSection title="Health Score" section="health">
          <div className="space-y-2">
            {[
              { label: 'Excellent (90+)', value: 90 },
              { label: 'Good (75+)', value: 75 },
              { label: 'Fair (60+)', value: 60 }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange({ ...filters, minHealthScore: option.value })}
                className={`w-full text-left text-sm px-3 py-2 rounded ${
                  filters.minHealthScore === option.value
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Good First Issues */}
        <FilterSection title="Beginner Friendly" section="goodFirstIssues">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasGoodFirstIssues || false}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  hasGoodFirstIssues: e.target.checked || undefined 
                })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Has good first issues
              </span>
            </label>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Minimum Good First Issues
              </label>
              <input
                type="number"
                value={filters.minGoodFirstIssues || ''}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  minGoodFirstIssues: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="e.g., 5"
                className="input-field text-sm"
              />
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterSidebar;

