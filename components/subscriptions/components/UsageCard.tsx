import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, CheckCircle, Lock, ExternalLink } from 'lucide-react';
import type { FeatureType, UsageStats } from '../types';

interface UsageCardProps {
  feature: FeatureType;
  usage: UsageStats;
  showUpgrade?: boolean;
  compact?: boolean;
  className?: string;
}

const UsageCard: React.FC<UsageCardProps> = ({ 
  feature, 
  usage,
  showUpgrade = true, 
  compact = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const percentage = Math.round((usage.used / usage.limit) * 100);
  const canUse = usage.remaining > 0;

  const getFeatureLabel = () => {
    const labels = {
      job_applications: 'Job Applications',
      cv_uploads: 'CV Uploads',
      email_accounts: 'Email Accounts',
      ai_requests: 'AI Requests'
    };
    return labels[feature];
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIcon = () => {
    if (!canUse) return <Lock className="w-4 h-4 text-red-500" />;
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (percentage >= 70) return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (!canUse) return 'Limit reached';
    if (percentage >= 90) return 'Almost full';
    if (percentage >= 70) return 'Getting close';
    return 'Available';
  };

  const getStatusColor = () => {
    if (!canUse) return 'text-red-600';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 text-gray-600 dark:text-gray-300 ${className}`}>
        {getIcon()}
        <span className="text-sm">
          {usage.used} / {usage.limit}
        </span>
        <span className={`text-xs ${getStatusColor()}`}>
          {getStatusMessage()}
        </span>
        {!canUse && showUpgrade && (
          <button
            onClick={() => navigate('/subscriptions/plans')}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors flex items-center"
          >
            Upgrade
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{getFeatureLabel()}</h3>
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Used</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {usage.used} / {usage.limit}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Remaining</span>
          <span className={`font-medium ${canUse ? 'text-gray-900 dark:text-gray-100' : 'text-red-600 dark:text-red-400'}`}>
            {usage.remaining}
          </span>
        </div>

        {/* Progress percentage */}
        <div className="text-center">
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {percentage}% used
          </span>
        </div>
      </div>

      {!canUse && showUpgrade && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/40 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            You've reached your {getFeatureLabel().toLowerCase()} limit.
          </p>
          <button
            onClick={() => navigate('/subscriptions/plans')}
            className="w-full px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            Upgrade Plan
            <ExternalLink className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {percentage >= 70 && canUse && showUpgrade && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/40 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            You're approaching your limit for {getFeatureLabel().toLowerCase()}.
          </p>
          <button
            onClick={() => navigate('/subscriptions/plans')}
            className="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 underline flex items-center"
          >
            Consider upgrading
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UsageCard;
