import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSidebar = ({ filters = {}, onFilterChange, languages = [], licenses = [], topics = [] }) => {
  const [expandedSections, setExpandedSections] = useState({
    language: true,
    license: true,
    topics: true,
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
    console.log('🔧 Language toggle:', { language, newLanguages });
    onFilterChange({ ...filters, languages: newLanguages });
  };

  const handleLicenseToggle = (license) => {
    const newLicenses = filters.licenses?.includes(license)
      ? filters.licenses.filter(l => l !== license)
      : [...(filters.licenses || []), license];
    console.log('🔧 License toggle:', { license, newLicenses });
    onFilterChange({ ...filters, licenses: newLicenses });
  };

  const handleTopicToggle = (topic) => {
    const newTopics = filters.topics?.includes(topic)
      ? filters.topics.filter(t => t !== topic)
      : [...(filters.topics || []), topic];
    console.log('🔧 Topic toggle:', { topic, newTopics });
    onFilterChange({ ...filters, topics: newTopics });
  };

  const handleClearAll = () => {
    console.log('🧹 Clearing all filters');
    onFilterChange({});
  };

  const hasActiveFilters = () => {
    return (filters.languages?.length > 0) ||
           (filters.licenses?.length > 0) ||
           (filters.topics?.length > 0) ||
           filters.minStars ||
           filters.minHealthScore ||
           filters.minGoodFirstIssues ||
           filters.hasGoodFirstIssues ||
           filters.sortBy;
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between text-left font-semibold text-gray-900 dark:text-white mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
      >
            <span className="flex items-center gap-2">
              {title}
              {expandedSections[section] && (
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {section === 'language' && filters.languages?.length > 0 && `(${filters.languages.length})`}
                  {section === 'license' && filters.licenses?.length > 0 && `(${filters.licenses.length})`}
                  {section === 'topics' && filters.topics?.length > 0 && `(${filters.topics.length})`}
                </span>
              )}
            </span>
        <span className="text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {expandedSections[section] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {expandedSections[section] && (
        <div className="animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-6 flex flex-col max-h-[calc(100vh-7rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h2>
        {hasActiveFilters() && (
          <button
            onClick={handleClearAll}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1 transition-colors duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-2 py-1 rounded-md"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto overflow-x-hidden flex-1 px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        {/* Sort By */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort By
          </label>
          <select
            value={filters.sortBy || ''}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value || undefined })}
            className="input-field text-sm w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
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

        {/* Good First Issues - Moved to top */}
        <FilterSection title="Beginner Friendly" section="goodFirstIssues">
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasGoodFirstIssues || false}
                onChange={(e) => {
                  const newValue = e.target.checked || undefined;
                  console.log('🔧 Good first issues toggle:', { checked: e.target.checked, newValue });
                  onFilterChange({ 
                    ...filters, 
                    hasGoodFirstIssues: newValue 
                  });
                }}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Has good first issues
              </span>
            </label>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">
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

        {/* Health Score Filter - Moved below Beginner Friendly */}
        <FilterSection title="Health Score" section="health">
          <div className="space-y-2">
            {[
              { label: 'Excellent', range: '90+', value: 90, dotColor: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
              { label: 'Good', range: '75+', value: 75, dotColor: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
              { label: 'Fair', range: '60+', value: 60, dotColor: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  console.log('🔧 Health score filter:', { value: option.value, label: option.label });
                  onFilterChange({ ...filters, minHealthScore: option.value });
                }}
                className={`w-full text-left text-sm px-3 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${
                  filters.minHealthScore === option.value
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm ring-2 ring-primary-500/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-sm'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${option.dotColor} flex-shrink-0`}></span>
                  {option.label}
                </span>
                <span className={`text-xs font-semibold ${filters.minHealthScore === option.value ? '' : option.textColor}`}>
                  {option.range}
                </span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Language Filter */}
        <FilterSection title="Language" section="language">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {languages.slice(0, 10).map((language) => (
              <label 
                key={language} 
                className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 -m-2 rounded-md transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  checked={filters.languages?.includes(language) || false}
                  onChange={() => handleLanguageToggle(language)}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 cursor-pointer transition-colors"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {language}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* License Filter */}
        <FilterSection title="License" section="license">
          <div className="space-y-2">
            {licenses.map((license) => (
              <label 
                key={license} 
                className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 -m-2 rounded-md transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  checked={filters.licenses?.includes(license) || false}
                  onChange={() => handleLicenseToggle(license)}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 cursor-pointer transition-colors"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {license}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Topics Filter */}
        <FilterSection title="Topics" section="topics">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {topics.slice(0, 15).map((topic) => (
              <label 
                key={topic} 
                className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 -m-2 rounded-md transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  checked={filters.topics?.includes(topic) || false}
                  onChange={() => handleTopicToggle(topic)}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 cursor-pointer transition-colors"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {topic}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Stars Filter */}
        <FilterSection title="Stars" section="stars">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">
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
                className="input-field text-sm w-full focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              {[1000, 5000, 10000, 50000].map((value) => (
                <button
                  key={value}
                  onClick={() => onFilterChange({ ...filters, minStars: value })}
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    filters.minStars === value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm ring-2 ring-primary-500/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-sm'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {value >= 1000 ? `${value / 1000}K+` : `${value}+`} stars
                </button>
              ))}
            </div>
          </div>
        </FilterSection>


      </div>

      {/* Fade effect at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
    </div>
  );
};

export default FilterSidebar;

