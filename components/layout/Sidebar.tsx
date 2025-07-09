import React from 'react';
import { PaperAirplaneIcon } from '../shared/icons';
import ThemeToggle from '../shared/ThemeToggle';

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
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Profile & CV upload'
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
      <div className="flex items-center justify-between h-16 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0 px-4">
        <div className="flex items-center space-x-3">
          <PaperAirplaneIcon className="w-8 h-8 text-white" />
          {(!collapsed || isMobile) && (
            <div className="text-white">
              <div className="font-bold text-lg">JobAssist</div>
              <div className="text-xs opacity-80">AI-Powered</div>
            </div>
          )}
        </div>
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

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto mt-6 px-3">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
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
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white dark:bg-gray-800">
        <button
          onClick={() => {
            if (isSigningOut) return;
            const confirmed = window.confirm('Are you sure you want to sign out?');
            if (confirmed) {
              onSignOut();
            }
          }}
          disabled={isSigningOut}
          className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
            isSigningOut
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          <div className="flex-shrink-0">
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
          {(!collapsed || isMobile) && (
            <div className="ml-3 text-left">
              <div className="text-sm font-medium">
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {isSigningOut ? 'Please wait...' : 'Exit application'}
              </div>
            </div>
          )}
        </button>

        {(!collapsed || isMobile) && (
          <div className="mt-4 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
