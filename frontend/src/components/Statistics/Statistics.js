import React, { useState, useMemo } from 'react';
import './Statistics.css';
import { IoSearch } from 'react-icons/io5';
import { subMonths, isValid, parseISO } from 'date-fns';

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

  const handleCustomDateChange = (e) => {
    const date = e.target.value;
    if (date && isValid(parseISO(date))) {
      onDateChange(new Date(date).toISOString(), repoView);
    }
  };

  const getTechnologyStatus = (language) => {
    const entry = data.radar_entries?.find(
      entry => entry.title.toLowerCase() === language.toLowerCase()
    );
    return entry ? entry.timeline[0].ringId.toLowerCase() : null;
  };

  const handleLanguageClick = (language) => {
    const status = getTechnologyStatus(language);
    if (status) {
      onTechClick(language);
    }
  };

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

  const getCurrentLanguageStats = () => {
    if (!data) return null;

    if (repoView === 'archived') {
      return data.language_statistics_archived || {};
    } else if (repoView === 'total') {
      return data.language_statistics || {};
    }
    return data.language_statistics_unarchived || {};
  };

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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

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
      
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : !stats ? (
        <div className="loading-overlay">
          <p>No statistics available</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
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
                  />
                </div>
              </div>
            </div>

            <div className="sort-options">
              <button 
                className={sortConfig.key === 'language' ? 'active' : ''}
                  onClick={() => handleSort('language')}
                >
                  Name {sortConfig.key === 'language' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className={sortConfig.key === 'repo_count' ? 'active' : ''}
                  onClick={() => handleSort('repo_count')}
                >
                  Repos {sortConfig.key === 'repo_count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className={sortConfig.key === 'average_percentage' ? 'active' : ''}
                  onClick={() => handleSort('average_percentage')}
                >
                  Usage {sortConfig.key === 'average_percentage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className={sortConfig.key === 'average_lines' ? 'active' : ''}
                  onClick={() => handleSort('average_lines')}
                >
                  Lines {sortConfig.key === 'average_lines' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className={` ${showTechRadarOnly ? 'active' : ''}`}
                  onClick={() => setShowTechRadarOnly(!showTechRadarOnly)}
                >
                  Tech Radar Only
                </button>
              </div>

              <div className="language-grid">
                {sortedAndFilteredLanguages.map(([language, stats]) => {
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
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
}

export default Statistics; 