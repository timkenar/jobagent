import React from 'react';
import { PaperAirplaneIcon } from '../shared/icons';

interface MobileHeaderProps {
  activeSection: string;
  onMenuClick: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
  darkMode?: boolean;
  onThemeToggle?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeSection,
  onMenuClick,
  onNotificationClick,
  notificationCount = 0,
  darkMode = false,
  onThemeToggle
}) => {
  const getSectionTitle = (section: string): string => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      jobsearch: 'Job Search',
      workflow: 'Workflow',
      applications: 'Applications',
      automation: 'Automation',
      emails: 'Emails',
      profile: 'Profile',
      settings: 'Settings'
    };
    return titles[section] || 'JobAssist';
  };

  return (
    <header className={`
      sticky top-0 z-30 border-b transition-colors duration-200
      ${darkMode 
        ? 'bg-gray-900 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
      }
    `}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className={`
              p-2 rounded-lg transition-colors duration-200
              ${darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
              }
            `}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <PaperAirplaneIcon className="w-6 h-6 text-green-500" />
            <h1 className="text-lg font-semibold">
              {getSectionTitle(activeSection)}
            </h1>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          {onNotificationClick && (
            <button
              onClick={onNotificationClick}
              className={`
                relative p-2 rounded-lg transition-colors duration-200
                ${darkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
              aria-label="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 9V7a3 3 0 116 0v2M9 9a3 3 0 116 0M9 9c0 7-3 9-3 9h12s-3-2-3-9" />
              </svg>
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </div>
              )}
            </button>
          )}

          {/* Theme toggle */}
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${darkMode 
                  ? 'hover:bg-gray-800 text-yellow-400' 
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}

          {/* Search button */}
          <button
            className={`
              p-2 rounded-lg transition-colors duration-200
              ${darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
              }
            `}
            aria-label="Search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress indicator for workflow */}
      {activeSection === 'workflow' && (
        <div className={`border-t px-4 py-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between text-sm">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Setup Progress
            </span>
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {(() => {
                try {
                  const profileComplete = localStorage.getItem('userProfile') && JSON.parse(localStorage.getItem('userProfile') || '{}').full_name;
                  const cvUploaded = localStorage.getItem('cvData');
                  const aiComplete = localStorage.getItem('aiAgentConfig') && JSON.parse(localStorage.getItem('aiAgentConfig') || '{}').chatModel;
                  const jobComplete = localStorage.getItem('jobSearchConfig') && JSON.parse(localStorage.getItem('jobSearchConfig') || '{}').keywords;
                  
                  const completed = [profileComplete, cvUploaded, aiComplete, jobComplete].filter(Boolean).length;
                  return `${completed}/4`;
                } catch {
                  return '0/4';
                }
              })()}
            </span>
          </div>
          <div className={`w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 mt-1`}>
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
              style={{ 
                width: `${(() => {
                  try {
                    const profileComplete = localStorage.getItem('userProfile') && JSON.parse(localStorage.getItem('userProfile') || '{}').full_name;
                    const cvUploaded = localStorage.getItem('cvData');
                    const aiComplete = localStorage.getItem('aiAgentConfig') && JSON.parse(localStorage.getItem('aiAgentConfig') || '{}').chatModel;
                    const jobComplete = localStorage.getItem('jobSearchConfig') && JSON.parse(localStorage.getItem('jobSearchConfig') || '{}').keywords;
                    
                    const completed = [profileComplete, cvUploaded, aiComplete, jobComplete].filter(Boolean).length;
                    return (completed / 4) * 100;
                  } catch {
                    return 0;
                  }
                })()}%` 
              }} 
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;