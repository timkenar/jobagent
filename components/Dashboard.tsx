import React, { useState } from 'react';
import Sidebar from './Sidebar';
import WorkflowSteps from './WorkflowSteps';
import UserProfile from './UserProfile';
import { useJobSearch } from '../src/hooks/useJobSearch';

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('workflow');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const {
    isSignedIn,
    authToken,
    handleSignOut,
  } = useJobSearch();

  if (!isSignedIn) {
    return null; // This will be handled by App.tsx
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'workflow':
        return <WorkflowSteps />;
      case 'profile':
        return <UserProfile />;
      default:
        return <WorkflowSteps />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onSignOut={handleSignOut}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === 'workflow' ? 'Job Search Workflow' : 'User Profile'}
              </h1>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {JSON.parse(localStorage.getItem('user') || '{}').full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  {JSON.parse(localStorage.getItem('user') || '{}').email || ''}
                </div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(JSON.parse(localStorage.getItem('user') || '{}').full_name || 'U')[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;