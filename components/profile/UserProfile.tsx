import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CVUploadSection } from '../cv';
import { JobRecommendations } from '../jobs';
import { useSubscription } from '../subscriptions/context/SubscriptionContext';
import { User, convertToLegacyUser, getProfileCompletionItems } from '../../src/types/user';
import { useAuth } from '../../src/contexts/AuthContext';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { currentSubscription, stats: subscriptionStats } = useSubscription();
  const { user } = useAuth();
  const [profileCompletion, setProfileCompletion] = useState<ReturnType<typeof getProfileCompletionItems> | null>(null);
  const [stats, setStats] = useState({
    emailsConnected: 0,
    jobApplications: 0,
    emailsGenerated: 0
  });

  useEffect(() => {
    if (user && user.profile_completion_percentage !== undefined) {
      setProfileCompletion(getProfileCompletionItems(user));
    }
    
    // Load stats from localStorage or API
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {(user.full_name || (user as any).fullName)?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user.full_name || (user as any).fullName}</h2>
              <p className="text-blue-100">{user.email}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                  {currentSubscription?.status === 'active' ? 
                    `${currentSubscription.plan.name} User` : 
                    'Free User'
                  }
                </span>
                {user.signup_method && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {user.signup_method_display || user.signup_method}
                  </span>
                )}
                {user.is_email_verified !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    user.is_email_verified 
                      ? 'bg-green-500 bg-opacity-80' 
                      : 'bg-orange-500 bg-opacity-80'
                  }`}>
                    {user.is_email_verified ? '✓ Verified' : '⚠ Unverified'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Profile Completion Section */}
          {profileCompletion && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Completion</h3>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user.profile_completion_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${user.profile_completion_percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {profileCompletion.items.map((item) => (
                  <div key={item.name} className={`flex items-center space-x-2 ${
                    item.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="text-xs">
                      {item.completed ? '✓' : item.required ? '✗' : '○'}
                    </span>
                    <span>{item.name}</span>
                    {item.required && !item.completed && (
                      <span className="text-red-500 text-xs">(Required)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {subscriptionStats?.usage_stats?.email_accounts?.used || stats.emailsConnected}
              </div>
              <div className="text-sm text-gray-600">Emails Connected</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {subscriptionStats?.usage_stats?.job_applications?.used || stats.jobApplications}
              </div>
              <div className="text-sm text-gray-600">Applications Tracked</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {subscriptionStats?.usage_stats?.ai_requests?.used || stats.emailsGenerated}
              </div>
              <div className="text-sm text-gray-600">AI Requests Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10v6m0 0l-3-3m3 3l3-3" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Email Notifications</div>
                <div className="text-sm text-gray-500">Receive updates about job applications</div>
              </div>
            </div>
            <button className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors">
              Enabled
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Privacy Settings</div>
                <div className="text-sm text-gray-500">Manage your data and privacy</div>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Configure
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 0v1m0 6.25c-.621 0-1.125-.504-1.125-1.125s.504-1.125 1.125-1.125 1.125.504 1.125 1.125-.504 1.125-1.125 1.125zM8 9h8l-1 9H9L8 9z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Subscription</div>
                <div className="text-sm text-gray-500">
                  {currentSubscription?.status === 'active' ? 
                    `${currentSubscription.plan.name} - Active` : 
                    subscriptionStats?.has_active_subscription ? 
                      'Active' : 
                      'Free plan'
                  }
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/subscriptions/dashboard')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* CV Upload Section */}
      <CVUploadSection />

      {/* Job Recommendations */}
      <JobRecommendations />

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Connected Gmail account</div>
              <div className="text-xs text-gray-500">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Generated email for Software Engineer role</div>
              <div className="text-xs text-gray-500">5 hours ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Updated CV information</div>
              <div className="text-xs text-gray-500">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;