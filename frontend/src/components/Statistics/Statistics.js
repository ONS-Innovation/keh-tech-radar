import React, { useState, useMemo, useCallback } from 'react';
import "../../styles/components/Statistics.css";
import { IoSearch } from 'react-icons/io5';
import { subMonths, isValid, parseISO } from 'date-fns';
import SkeletonStatCard from './Skeletons/SkeletonStatCard';
import SkeletonLanguageCard from './Skeletons/SkeletonLanguageCard';

/**
 * Statistics component for displaying repository statistics.
 * 
 * @param {Object} props - The props passed to the Statistics component.
 * @param {Object} props.data - The data object containing statistics.
 * @param {Function} props.onTechClick - Function to handle technology click.
 * @param {Function} props.onDateChange - Function to handle date change.
 * @param {boolean} props.isLoading - Whether the data is loading.
 */
function Statistics({ data, onTechClick, onDateChange, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'repo_count', direction: 'desc' });
  const [selectedDate, setSelectedDate] = useState('all');
  const [hoveredLanguage, setHoveredLanguage] = useState(null);
  const [showTechRadarOnly, setShowTechRadarOnly] = useState(false);
  const [repoView, setRepoView] = useState('unarchived'); // 'unarchived', 'archived', 'total'

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: '1', label: 'Last Month' },
    { value: '3', label: 'Last 3 Months' },
    { value: '6', label: 'Last 6 Months' },
    { value: '12', label: 'Last Year' },
    { value: 'custom', label: 'Custom Date' }
  ];

  /**
   * handleDateChange function handles the date change event.
   * 
   * @param {string} value - The selected date value.
   */
  const handleDateChange = (value) => {
    setSelectedDate(value);
    if (value === 'all') {
      onDateChange(null, repoView);
    } else if (value === 'custom') {
      // Do nothing, wait for custom date input
    } else {
      const date = subMonths(new Date(), parseInt(value));
      onDateChange(date.toISOString(), repoView);
    }
  };

  /**
   * handleCustomDateChange function handles the custom date change event.
   * 
   * @param {Event} e - The event object.
   */
  const handleCustomDateChange = (e) => {
    const date = e.target.value;
    if (date && isValid(parseISO(date))) {
      onDateChange(new Date(date).toISOString(), repoView);
    }
  };

  /**
   * getTechnologyStatus function gets the technology status for a given language.
   * 
   * @param {string} language - The language to get the status for.
   * @returns {string|null} - The technology status or null if not found.
   */
  const getTechnologyStatus = useCallback((language) => {
    if (!data || !data.radar_entries) return null;
    const entry = data.radar_entries.find(
      entry => entry.title.toLowerCase() === language.toLowerCase()
    );
    return entry ? entry.timeline[0].ringId.toLowerCase() : null;
  }, [data]);

  /**
   * handleLanguageClick function handles the language click event.
   * 
   * @param {string} language - The language to handle the click for.
   */
  const handleLanguageClick = (language) => {
    const status = getTechnologyStatus(language);
    if (status) {
      onTechClick(language);
    }
  };

  /**
   * getCurrentStats function gets the current stats based on the repository view.
   * 
   * @returns {Object|null} - The current stats or null if not found.
   */
  const getCurrentStats = () => {
    if (!data) return null;
    // NEEDS ERROR HANDLING SEB
    // Otherwise, use the split format (stats_unarchived/stats_archived)
    if (repoView === 'archived') {
      return data.stats_archived || null;
    } else if (repoView === 'total') {
      return data.stats || null;
    }
    return data.stats_unarchived || null;
  };

  /**
   * getCurrentLanguageStats function gets the current language stats based on the repository view.
   * 
   * @returns {Object|null} - The current language stats or null if not found.
   */
  const getCurrentLanguageStats = useCallback(() => {
    if (!data) return null;

    if (repoView === 'archived') {
      return data.language_statistics_archived || {};
    } else if (repoView === 'total') {
      return data.language_statistics || {};
    }
    return data.language_statistics_unarchived || {};
  }, [data, repoView]);

  /**
   * sortedAndFilteredLanguages function sorts and filters the languages based on the search term and sort configuration.
   * 
   * @returns {Array} - The sorted and filtered languages.
   */
  const sortedAndFilteredLanguages = useMemo(() => {
    const languageStats = getCurrentLanguageStats();
    if (!languageStats) return [];

    let filtered = Object.entries(languageStats)
      .filter(([language]) => {
        const matchesSearch = language.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (showTechRadarOnly) {
          const status = getTechnologyStatus(language);
          return matchesSearch && status !== null;
        }
        
        return matchesSearch;
      });

    filtered.sort((a, b) => {
      if (sortConfig.key === 'language') {
        return sortConfig.direction === 'asc' 
          ? a[0].localeCompare(b[0]) 
          : b[0].localeCompare(a[0]);
      }

      const aValue = a[1][sortConfig.key];
      const bValue = b[1][sortConfig.key];
      
      return sortConfig.direction === 'asc' 
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });

    return filtered;
  }, [getCurrentLanguageStats, searchTerm, sortConfig, getTechnologyStatus, showTechRadarOnly]);

  /**
   * handleSort function handles the sort event.
   * 
   * @param {string} key - The key to sort by.
   */
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  /**
   * getRepoCountDisplay function gets the repository count display.
   * 
   * @param {number} repoCount - The repository count.
   * @returns {string} - The repository count display.
   */
  const getRepoCountDisplay = (repoCount) => {
    const stats = getCurrentStats();
    if (hoveredLanguage && stats?.total) {
      const percentage = ((repoCount / stats.total) * 100).toFixed(1);
      return `${repoCount} / ${stats.total} (${percentage}%)`;
    }
    return repoCount;
  };

  const metadata = data?.metadata || {};
  const stats = getCurrentStats();
  const languageStats = getCurrentLanguageStats();

  return (
    <div className="statistics-content">
      <div className="statistics-header">
        <div className="statistics-header-left">
          <h3>Repository Statistics</h3>
          <div className="header-controls">
            <div className="date-selector">
              <select 
                value={selectedDate} 
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={isLoading}
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {selectedDate === 'custom' && (
                <input
                  type="date"
                  onChange={handleCustomDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="custom-date-input"
                />
              )}
            </div>
            <select
              className="archive-toggle"
              value={repoView}
              onChange={(e) => {
                setRepoView(e.target.value);
                let dateToUse = null;
                if (selectedDate === 'all') {
                  dateToUse = null;
                } else if (selectedDate === 'custom') {
                  const customDate = document.querySelector('.custom-date-input')?.value;
                  if (customDate) {
                    dateToUse = new Date(customDate).toISOString();
                  }
                } else {
                  dateToUse = subMonths(new Date(), parseInt(selectedDate)).toISOString();
                }
                onDateChange(dateToUse, e.target.value);
              }}
              disabled={isLoading}
            >
              <option value="unarchived">Active Repos</option>
              <option value="archived">Archived Repos</option>
              <option value="total">All Repos</option>
            </select>
          </div>
        </div>
        <div className="metadata">
          {metadata?.last_updated && (
            <>
              Last updated: {new Date(metadata.last_updated).toLocaleDateString()}
            </>
          )}
        </div>
      </div>
      
      {!stats && !isLoading ? (
        <div className="no-data-message">
          <p>No statistics available</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {isLoading ? (
              <>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </>
            ) : (
              <>
                <div className="stat-card">
                  <h3>Total Repositories</h3>
                  <p>{hoveredLanguage && languageStats ? 
                      getRepoCountDisplay(languageStats[hoveredLanguage]?.repo_count) :
                      stats.total || 0}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Public Repos</h3>
                  <p>{stats.public || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Private Repos</h3>
                  <p>{stats.private || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Internal Repos</h3>
                  <p>{stats.internal || 0}</p>
                </div>
              </>
            )}
          </div>

          <div className="language-section">
            <div className="language-header">
              <div className="language-header-left">
                <h3>Language Statistics</h3>
              </div>
              <div className="language-header-right">
                <div className="search-box">
                  <IoSearch size={16} />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="sort-options">
              <button 
                className={sortConfig.key === 'language' ? 'active' : ''}
                onClick={() => handleSort('language')}
                disabled={isLoading}
              >
                Name {sortConfig.key === 'language' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={sortConfig.key === 'repo_count' ? 'active' : ''}
                onClick={() => handleSort('repo_count')}
                disabled={isLoading}
              >
                Repos {sortConfig.key === 'repo_count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={sortConfig.key === 'average_percentage' ? 'active' : ''}
                onClick={() => handleSort('average_percentage')}
                disabled={isLoading}
              >
                Usage {sortConfig.key === 'average_percentage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={sortConfig.key === 'average_lines' ? 'active' : ''}
                onClick={() => handleSort('average_lines')}
                disabled={isLoading}
              >
                Lines {sortConfig.key === 'average_lines' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={` ${showTechRadarOnly ? 'active' : ''}`}
                onClick={() => setShowTechRadarOnly(!showTechRadarOnly)}
                disabled={isLoading}
              >
                Tech Radar Only
              </button>
            </div>

            <div className="language-grid">
              {isLoading ? (
                <>
                  <SkeletonLanguageCard />
                  <SkeletonLanguageCard />
                  <SkeletonLanguageCard />
                  <SkeletonLanguageCard />
                  <SkeletonLanguageCard />
                  <SkeletonLanguageCard />
                  <SkeletonLanguageCard />
                  <SkeletonLanguageCard />
                </>
              ) : (
                sortedAndFilteredLanguages.map(([language, stats]) => {
                  const status = getTechnologyStatus(language);
                  return (
                    <div 
                      key={language} 
                      className={`language-card ${status || ''} ${status ? 'clickable' : ''}`}
                      onClick={() => handleLanguageClick(language)}
                      onMouseEnter={() => setHoveredLanguage(language)}
                      onMouseLeave={() => setHoveredLanguage(null)}
                    >
                      <h4>{language}</h4>
                      <div className="language-stats">
                        <p>
                          <strong>{stats.repo_count}</strong> repos
                        </p>
                        <p>
                          <strong>{stats.average_percentage.toFixed(1)}%</strong> avg usage
                        </p>
                        <p>
                          <strong>{Math.round(stats.average_lines).toLocaleString()}</strong> avg lines
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Statistics;