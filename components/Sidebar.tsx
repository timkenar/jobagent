import React from 'react';
import { PaperAirplaneIcon } from './icons';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  collapsed, 
  setCollapsed,
  onSignOut 
}) => {
  const menuItems = [
    {
      id: 'workflow',
      label: 'Job Search Workflow',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      description: 'Complete job search process'
    },
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Manage your profile and settings'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-50 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center space-x-3">
          <PaperAirplaneIcon className="w-8 h-8 text-white" />
          {!collapsed && (
            <div className="text-white">
              <div className="font-bold text-lg">JobAssist</div>
              <div className="text-xs opacity-80">AI-Powered</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`flex-shrink-0 ${
                activeSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
              }`}>
                {item.icon}
              </div>
              {!collapsed && (
                <div className="ml-3 text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={`text-xs ${
                    activeSection === item.id ? 'text-white/80' : 'text-gray-400'
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
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
        <button
          onClick={onSignOut}
          className="w-full flex items-center px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          {!collapsed && (
            <div className="ml-3 text-left">
              <div className="text-sm font-medium">Sign Out</div>
              <div className="text-xs text-gray-400">Exit application</div>
            </div>
          )}
        </button>
        
        {!collapsed && (
          <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 text-center">
              JobAssist v1.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;