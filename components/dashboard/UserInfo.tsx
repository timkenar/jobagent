import React from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { getProfileCompletionItems } from '../../src/types/user';

interface UserInfoProps {
  showProfileCompletion?: boolean;
  compact?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({ 
  showProfileCompletion = false, 
  compact = false 
}) => {
  const { user, getDisplayName, getEmail, getInitials } = useAuth();

  if (!user) return null;

  const profileCompletion = user.profile_completion_percentage !== undefined 
    ? getProfileCompletionItems(user) 
    : null;

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {getDisplayName()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getEmail()}
          </div>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {getInitials()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="relative">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={getDisplayName()}
              className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {getInitials()}
              </span>
            </div>
          )}
          {user.is_email_verified !== undefined && (
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${
              user.is_email_verified ? 'bg-green-500' : 'bg-orange-500'
            }`}>
              <span className="text-white text-xs flex items-center justify-center w-full h-full">
                {user.is_email_verified ? '✓' : '!'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getDisplayName()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{getEmail()}</p>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {user.signup_method && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                {user.signup_method_display || user.signup_method}
              </span>
            )}
            
            {user.is_email_verified !== undefined && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.is_email_verified 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
              }`}>
                {user.is_email_verified ? 'Verified' : 'Unverified'}
              </span>
            )}
            
            {user.registration_date && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs">
                Member since {new Date(user.registration_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {showProfileCompletion && profileCompletion && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Completion
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {user.profile_completion_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${user.profile_completion_percentage}%` }}
            />
          </div>
          {user.profile_completion_percentage < 100 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Complete your profile to unlock all features
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserInfo;