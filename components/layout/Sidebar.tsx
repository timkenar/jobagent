import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '../shared/icons';
import ThemeToggle from '../shared/ThemeToggle';
import { useAuth } from '../../src/contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
  isMobile?: boolean;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  collapsed,
  setCollapsed,
  onSignOut,
  isSigningOut = false,
  isMobile = false,
  sidebarOpen = false,
  setSidebarOpen
}) => {
  const { getDisplayName, getInitials } = useAuth();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profilePopupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target as Node)) {
        setShowProfilePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3-6 4 12 3-6h4" />
        </svg>
      ),
      description: 'Overview & stats'
    },
    {
      id: 'jobsearch',
      label: 'AI Job Search',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: 'Google + CV powered search'
    },
     {
      id: 'emails',
      label: 'Emails',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4 4m4-4l-4-4" />
        </svg>
      ),
      description: 'Confirmations & follow-ups'
    },
    {
      id: 'workflow',
      label: 'Setup Workflow',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Complete profile & CV setup'
    },
    {
      id: 'selfapply',
      label: 'Self Apply',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8m0 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      ),
      description: 'Browse & apply to jobs'
    },
    {
      id: 'applications',
      label: 'Application Tracker',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Track progress'
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l-3-3m0 0l3-3m-3 3h11a4 4 0 010 8H7" />
        </svg>
      ),
      description: 'Manage plans & billing'
    },
    {
      id: 'automation',
      label: 'Job Automation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      description: 'Automated job applications'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v2m6.364 1.636l-1.414 1.414M20 12h-2M17.364 17.364l-1.414-1.414M12 20v-2M6.636 17.364l1.414-1.414M4 12h2M6.636 6.636l1.414 1.414" />
        </svg>
      ),
      description: 'Preferences & notifications'
    }
  ];

  const handleMenuItemClick = (itemId: string) => {
    setActiveSection(itemId);
    if (isMobile && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        />
      )}
      
      <div className={`
        ${isMobile 
          ? `fixed top-0 left-0 h-full transform transition-transform duration-300 ease-in-out z-50 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'fixed left-0 top-0 h-full'
        } 
        bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 flex flex-col
        ${collapsed && !isMobile ? 'w-16' : 'w-64'}
      `}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-500 to-green-600 flex-shrink-0 px-4">
        <div className="flex items-center space-x-3">
          <PaperAirplaneIcon className="w-8 h-8 text-white" />
          {(!collapsed || isMobile) && (
            <div className="text-white">
              <div className="font-bold text-lg">JobAssist</div>
              <div className="text-xs opacity-80">AI-Powered</div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white hover:text-gray-200 p-1 rounded transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${
                  collapsed ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
              className="text-white hover:text-gray-200 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto mt-6 px-3">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className={`flex-shrink-0 ${
                activeSection === item.id ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
              }`}>
                {item.icon}
              </div>
              {(!collapsed || isMobile) && (
                <div className="ml-3 text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={`text-xs ${
                    activeSection === item.id ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              )}
              {/* Tooltip for collapsed mode */}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-300">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
        {/* Profile Button */}
        <div className="relative" ref={profilePopupRef}>
          <button
            onClick={() => setShowProfilePopup(!showProfilePopup)}
            className="w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white mb-2"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials()}
                </span>
              </div>
            </div>
            {(!collapsed || isMobile) && (
              <div className="ml-3 text-left flex-1">
                <div className="text-sm font-medium">
                  {getDisplayName()}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  View profile options
                </div>
              </div>
            )}
            {(!collapsed || isMobile) && (
              <div className="flex-shrink-0">
                <svg className={`w-4 h-4 transition-transform duration-200 ${
                  showProfilePopup ? 'rotate-180' : ''
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
            {/* Tooltip for collapsed mode */}
            {collapsed && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {getDisplayName()}
              </div>
            )}
          </button>

          {/* Profile Popup */}
          {showProfilePopup && (
            <div className={`absolute bottom-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50 ${
              collapsed && !isMobile 
                ? 'left-full ml-2 w-64' 
                : 'left-0 right-0'
            }`}>
              <button
                onClick={() => {
                  setActiveSection('profile');
                  setShowProfilePopup(false);
                  if (isMobile && setSidebarOpen) {
                    setSidebarOpen(false);
                  }
                }}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <div className="text-sm font-medium">Go to Profile</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">Manage your information</div>
                </div>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => {
                  if (isSigningOut) return;
                  const confirmed = window.confirm('Are you sure you want to sign out?');
                  if (confirmed) {
                    onSignOut();
                  }
                  setShowProfilePopup(false);
                }}
                disabled={isSigningOut}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                  isSigningOut
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {isSigningOut ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {isSigningOut ? 'Please wait...' : 'Exit application'}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {(!collapsed || isMobile) && (
          <div className="mt-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              JobAssist v1.0
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default Sidebar;
