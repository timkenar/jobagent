import React from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { Check, X, User, Mail, Phone, Shield } from 'lucide-react';

interface ProfileDataSummaryProps {
  showDetails?: boolean;
}

const ProfileDataSummary: React.FC<ProfileDataSummaryProps> = ({ showDetails = false }) => {
  const { user } = useAuth();

  if (!user) return null;

  const profileData = [
    {
      label: 'Full Name',
      value: user.full_name,
      icon: User,
      required: true,
      source: 'account'
    },
    {
      label: 'Email',
      value: user.email,
      icon: Mail,
      required: true,
      source: 'account',
      verified: user.is_email_verified
    },
    {
      label: 'Phone Number',
      value: user.phone_number,
      icon: Phone,
      required: false,
      source: 'account'
    }
  ];

  const completedFields = profileData.filter(field => field.value).length;
  const requiredFields = profileData.filter(field => field.required).length;
  const completedRequiredFields = profileData.filter(field => field.required && field.value).length;

  if (!showDetails) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Profile Data Available
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {completedRequiredFields}/{requiredFields} required fields from your account
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Account Data Used
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedFields} fields available
        </span>
      </div>

      <div className="space-y-3">
        {profileData.map((field) => {
          const Icon = field.icon;
          const hasValue = !!field.value;
          
          return (
            <div key={field.label} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                hasValue ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Icon className={`w-4 h-4 ${
                  hasValue ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    hasValue ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {field.label}
                  </span>
                  {field.required && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                  {field.verified && (
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">Verified</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {hasValue ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Available from your account
                    </span>
                  ) : (
                    <span>Not provided</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {hasValue ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Profile Completion
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {user.profile_completion_percentage}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${user.profile_completion_percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileDataSummary;