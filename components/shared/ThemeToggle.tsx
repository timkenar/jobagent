import React, { useState } from 'react';
import { useTheme } from '../../src/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  // Theme icons
  const SunIcon = () => (
    <svg
      className={sizeClasses[size]}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  const MoonIcon = () => (
    <svg
      className={sizeClasses[size]}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  const SystemIcon = () => (
    <svg
      className={sizeClasses[size]}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const getThemeIcon = (themeType: 'light' | 'dark' | 'system') => {
    switch (themeType) {
      case 'light':
        return <SunIcon />;
      case 'dark':
        return <MoonIcon />;
      case 'system':
        return <SystemIcon />;
      default:
        return <SunIcon />;
    }
  };

  const getThemeLabel = (themeType: 'light' | 'dark' | 'system') => {
    switch (themeType) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  // Simple toggle button (light <-> dark)
  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          ${buttonSizeClasses[size]}
          rounded-lg
          text-gray-600 dark:text-gray-300
          hover:text-gray-900 dark:hover:text-white
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          ${className}
        `}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className="transition-transform duration-200 ease-in-out">
          {isDark ? <SunIcon /> : <MoonIcon />}
        </div>
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {isDark ? 'Light' : 'Dark'}
          </span>
        )}
      </button>
    );
  }

  // Switch toggle
  if (variant === 'switch') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getThemeLabel(theme)}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            ${isDark ? 'bg-blue-600' : 'bg-gray-200'}
          `}
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle dark mode"
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
              flex items-center justify-center
              ${isDark ? 'translate-x-6' : 'translate-x-1'}
            `}
          >
            <span className="text-gray-400 dark:text-gray-600">
              {isDark ? (
                <MoonIcon />
              ) : (
                <SunIcon />
              )}
            </span>
          </span>
        </button>
      </div>
    );
  }

  // Dropdown with all options
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            ${buttonSizeClasses[size]}
            rounded-lg
            text-gray-600 dark:text-gray-300
            hover:text-gray-900 dark:hover:text-white
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            flex items-center space-x-2
          `}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          {getThemeIcon(theme)}
          {showLabel && (
            <>
              <span className="text-sm font-medium">{getThemeLabel(theme)}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
        </button>

        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700">
              <div className="py-1" role="menu">
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => {
                      setTheme(themeOption);
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-2 text-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors duration-150
                      ${
                        theme === themeOption
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                    role="menuitem"
                  >
                    <span className="mr-3">{getThemeIcon(themeOption)}</span>
                    <span>{getThemeLabel(themeOption)}</span>
                    {theme === themeOption && (
                      <svg
                        className="ml-auto w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default ThemeToggle;