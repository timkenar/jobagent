import React from 'react';
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
      <div className={`flex items-center space-x-2 ${className}`}>
        {getIcon()}
        <span className="text-sm text-gray-600">
          {usage.used} / {usage.limit}
        </span>
        <span className={`text-xs ${getStatusColor()}`}>
          {getStatusMessage()}
        </span>
        {!canUse && showUpgrade && (
          <button
            onClick={() => window.location.href = '/subscriptions/plans'}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors flex items-center"
          >
            Upgrade
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="font-medium text-gray-900">{getFeatureLabel()}</h3>
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Used</span>
          <span className="font-medium">
            {usage.used} / {usage.limit}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Remaining</span>
          <span className={`font-medium ${canUse ? 'text-gray-900' : 'text-red-600'}`}>
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
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            You've reached your {getFeatureLabel().toLowerCase()} limit.
          </p>
          <button
            onClick={() => window.location.href = '/subscriptions/plans'}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Upgrade Plan
            <ExternalLink className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {percentage >= 70 && canUse && showUpgrade && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            You're approaching your limit for {getFeatureLabel().toLowerCase()}.
          </p>
          <button
            onClick={() => window.location.href = '/subscriptions/plans'}
            className="text-sm text-yellow-700 hover:text-yellow-900 underline flex items-center"
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