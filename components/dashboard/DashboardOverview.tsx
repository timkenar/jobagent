import React, { useState, useEffect } from 'react';

interface DashboardStats {
  jobsApplied: number;
  repliesReceived: number;
  availableTokens: number;
  planType: string;
  successRate: number;
  pendingApplications: number;
  interviewsScheduled: number;
  totalSearches: number;
}

interface DashboardOverviewProps {
  setActiveSection?: (section: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveSection }) => {
  const [stats, setStats] = useState<DashboardStats>({
    jobsApplied: 0,
    repliesReceived: 0,
    availableTokens: 1000,
    planType: 'Free Plan',
    successRate: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    totalSearches: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats({
          jobsApplied: data.jobsApplied,
          repliesReceived: data.repliesReceived,
          availableTokens: data.availableTokens,
          planType: data.planType,
          successRate: data.successRate,
          pendingApplications: data.pendingApplications,
          interviewsScheduled: data.interviewsScheduled,
          totalSearches: data.totalSearches,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setLoading(false);
      }
    };

    loadStats();

    const handleNotification = () => {
        loadStats();
    };

    window.addEventListener('notification', handleNotification);

    return () => {
        window.removeEventListener('notification', handleNotification);
    };
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <svg className={`w-4 h-4 mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {trend.value}% from last week
            </div>
          )}
        </div>
        <div className={`${color} text-white p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickAction: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
  }> = ({ title, description, icon, onClick, color }) => (
    <button
      onClick={onClick}
      className={`${color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-left w-full`}
    >
      <div className="flex items-center mb-3">
        <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-white text-opacity-90 text-sm">{description}</p>
    </button>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 dark:bg-gray-600 h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-300 dark:bg-gray-600 h-24 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your job search overview.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            stats.planType === 'Premium Plan' 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {stats.planType}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Jobs Applied"
          value={stats.jobsApplied}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
            </svg>
          }
          color="bg-green-500"
        />
        
        <StatCard
          title="Replies Received"
          value={stats.repliesReceived}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          color="bg-green-500"
        />
        
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="bg-green-500"
        />
        
        <StatCard
          title="Available Tokens"
          value={stats.availableTokens.toLocaleString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-yellow-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No recent activity yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Start using the job search features to see your activity here</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAction
            title="Start Job Search"
            description="Begin a new automated job search workflow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            onClick={() => setActiveSection && setActiveSection('jobsearch')}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          
          <QuickAction
            title="Upload CV"
            description="Update your CV or resume for better matching"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
            onClick={() => setActiveSection && setActiveSection('profile')}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          
          <QuickAction
            title="Check Emails"
            description="Review replies and follow-up on applications"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            onClick={() => setActiveSection && setActiveSection('emails')}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          
          <QuickAction
            title="View Applications"
            description="Track status of all submitted applications"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            onClick={() => setActiveSection && setActiveSection('applications')}
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
          />
          
          <QuickAction
            title="Auto-Apply Settings"
            description="Configure automatic job application preferences"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            onClick={() => setActiveSection && setActiveSection('settings')}
            color="bg-gradient-to-r from-indigo-500 to-indigo-600"
          />
          
          <QuickAction
            title="AI Agent Setup"
            description="Configure your AI assistant preferences"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            onClick={() => setActiveSection && setActiveSection('automation')}
            color="bg-gradient-to-r from-pink-500 to-rose-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;