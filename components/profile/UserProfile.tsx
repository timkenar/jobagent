import React, { useState, useEffect } from 'react';
import { CVUploadSection } from '../cv';
import { JobRecommendations } from '../jobs';

interface User {
  id: string;
  email: string;
  fullName: string;
  profile_picture?: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    emailsConnected: 0,
    jobApplications: 0,
    emailsGenerated: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Load stats from localStorage or API
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

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
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-blue-100">{user.email}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                  Premium User
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.emailsConnected}</div>
              <div className="text-sm text-gray-600">Emails Connected</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.jobApplications}</div>
              <div className="text-sm text-gray-600">Applications Tracked</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.emailsGenerated}</div>
              <div className="text-sm text-gray-600">Emails Generated</div>
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
                <div className="text-sm text-gray-500">Premium plan - Active</div>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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