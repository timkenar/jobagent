import React, { useState, useEffect } from 'react';
import { ResponsiveLayout } from '../layout';
import WorkflowSteps from './WorkflowSteps';
import DashboardOverview from './DashboardOverview';
import { UserProfile } from '../profile';
import { JobApplicationDashboard, ApplicationTracker } from '../jobs';
import { useJobSearch } from '../../src/hooks/useJobSearch';
import { useAuth } from '../../src/contexts/AuthContext';
import EnhancedChatbot from '../../components/shared/EnhancedChatbot';
import { EmailManagement } from '../email';
import { AutomationDashboard } from '../automation';
import ThemeToggle from '../shared/ThemeToggle';
import NotificationBell from './NotificationBell';
import JobSearchSection from '../jobs/JobSearchSection';


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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/preferences/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async (newSettings: any) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/preferences/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    saveSettings({ notifications: newNotifications, preferences });
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    saveSettings({ preferences: newPreferences, notifications });
  };

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
              onClick={() => handleNotificationChange('email', !notifications.email)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
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
              onClick={() => handleNotificationChange('push', !notifications.push)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.push ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
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
              onClick={() => handlePreferenceChange('autoApply', !preferences.autoApply)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoApply ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
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
              onChange={(e) => handlePreferenceChange('dailyLimit', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500"
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
  const { user, loading, getDisplayName, getEmail, getInitials } = useAuth();
  
  // Job search state
  const [jobSearchQuery, setJobSearchQuery] = useState<string>('');
  const [jobResults, setJobResults] = useState<any[]>([]);
  const [isLoadingJobSearch, setIsLoadingJobSearch] = useState<boolean>(false);
  const [selectedJobForEmail, setSelectedJobForEmail] = useState<any>(null);
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState<boolean>(false);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [isEmailSending, setIsEmailSending] = useState<boolean>(false);
  const [emailSentMessage, setEmailSentMessage] = useState<string | null>(null);
  
  const {
    isSignedIn,
    authToken,
    handleSignOut,
    isLoadingSearch,
  } = useJobSearch();

  if (!isSignedIn) {
    return null; // This will be handled by App.tsx
  }

  // Job search handlers
  const handleSearchJobs = async () => {
    setIsLoadingJobSearch(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query: jobSearchQuery }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobResults(data.jobs || []);
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setIsLoadingJobSearch(false);
    }
  };

  const handleGenerateEmail = async (job: any) => {
    setIsLoadingEmail(true);
    setSelectedJobForEmail(job);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ job }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedEmail(data);
      }
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleCloseModal = () => {
    setGeneratedEmail(null);
    setSelectedJobForEmail(null);
    setEmailCopied(false);
    setEmailSentMessage(null);
  };

  const handleCopyToClipboard = () => {
    if (generatedEmail) {
      navigator.clipboard.writeText(generatedEmail.emailContent);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handleSendEmail = async (recipientEmail: string, subject: string, body: string) => {
    setIsEmailSending(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientEmail, subject, body }),
      });
      
      if (response.ok) {
        setEmailSentMessage('Email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailSentMessage('Failed to send email.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview setActiveSection={setActiveSection} />;
      case 'workflow':
        return <WorkflowSteps />;
      case 'jobsearch':
        return <JobSearchSection 
          jobSearchQuery={jobSearchQuery}
          setJobSearchQuery={setJobSearchQuery}
          jobResults={jobResults}
          isLoadingSearch={isLoadingJobSearch}
          cvText={''}
          handleSearchJobs={handleSearchJobs}
          handleGenerateEmail={handleGenerateEmail}
          isLoadingEmail={isLoadingEmail}
          selectedJobForEmail={selectedJobForEmail}
          generatedEmail={generatedEmail}
          handleCloseModal={handleCloseModal}
          handleCopyToClipboard={handleCopyToClipboard}
          emailCopied={emailCopied}
          handleSendEmail={handleSendEmail}
          isEmailSending={isEmailSending}
          emailSentMessage={emailSentMessage}
        />;
      case 'applications':
        return <ApplicationTracker />;
      case 'automation':
        return <AutomationDashboard user={user ? { id: user.uid || 1, email: user.email || '' } : { id: 1, email: '' }} />;
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
        return 'Setup Workflow';
      case 'jobsearch':
        return 'AI Job Search';
      case 'applications':
        return 'Application Tracker';
      case 'automation':
        return 'Job Automation';
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
    <ResponsiveLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      onSignOut={handleSignOut}
      isSigningOut={isLoadingSearch}
    >
      <div className="min-h-screen">
        {/* Desktop Header - Only show on desktop */}
        <div className="hidden md:block">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getSectionTitle()}
              </h1>
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getEmail()}
                  </div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getInitials()}
                  </span>
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* Main Content */}
        <div className="px-4 md:px-6">
          {renderMainContent()}
        </div>
      </div>
      
      {/* Chatbot - Position adjusted for mobile */}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-50">
        <EnhancedChatbot />
      </div>
    </ResponsiveLayout>
  );
};

export default Dashboard;