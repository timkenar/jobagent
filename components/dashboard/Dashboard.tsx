import React, { useState } from 'react';
import { Sidebar } from '../layout';
import WorkflowSteps from './WorkflowSteps';
import DashboardOverview from './DashboardOverview';
import { UserProfile } from '../profile';
import { JobApplicationDashboard, ApplicationTracker } from '../jobs';
import { useJobSearch } from '../../src/hooks/useJobSearch';
import EnhancedChatbot from '../../components/shared/EnhancedChatbot';
import { EmailManagement } from '../email';
import ThemeToggle from '../shared/ThemeToggle';


// Settings Component
const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  const [preferences, setPreferences] = useState({
    autoApply: false,
    dailyLimit: 5,
    jobTypes: ['full-time', 'contract']
  });

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose how you want to be notified</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates via email</p>
            </div>
            <button
              onClick={() => setNotifications({...notifications, email: !notifications.email})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.email ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive browser notifications</p>
            </div>
            <button
              onClick={() => setNotifications({...notifications, push: !notifications.push})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.push ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.push ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theme Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customize your appearance</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
            </div>
            <ThemeToggle variant="dropdown" showLabel={false} />
          </div>
        </div>
      </div>

      {/* Job Search Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Search Preferences</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customize your job search settings</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Auto-Apply</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automatically apply to matching jobs</p>
            </div>
            <button
              onClick={() => setPreferences({...preferences, autoApply: !preferences.autoApply})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoApply ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.autoApply ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">Daily Application Limit</label>
            <input
              type="number"
              value={preferences.dailyLimit}
              onChange={(e) => setPreferences({...preferences, dailyLimit: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              max="50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
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
      case 'dashboard':
        return <DashboardOverview />;
      case 'workflow':
        return <WorkflowSteps />;
      case 'applications':
        return <ApplicationTracker />;
      case 'emails':
        return <EmailManagement />;
      case 'profile':
        return <UserProfile />;
      case 'chatbot':
        return <EnhancedChatbot />;

      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'workflow':
        return 'Job Search Workflow';
      case 'applications':
        return 'Application Tracker';
      case 'emails':
        return 'Email Management';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
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
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getSectionTitle()}
              </h1>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {JSON.parse(localStorage.getItem('user') || '{}').full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
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