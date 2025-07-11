import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { useSubscription } from '../../src/contexts/SubscriptionContext';

interface UsageTrackerProps {
  feature: 'job_applications' | 'cv_uploads' | 'email_accounts' | 'ai_requests';
  showUpgrade?: boolean;
  compact?: boolean;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({ 
  feature, 
  showUpgrade = true, 
  compact = false 
}) => {
  const { stats, canUseFeature, getUsagePercentage } = useSubscription();

  if (!stats) {
    return null;
  }

  const usage = stats.usage_stats[feature];
  const percentage = getUsagePercentage(feature);
  const canUse = canUseFeature(feature);

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

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getIcon()}
        <span className="text-sm text-gray-600">
          {usage.used} / {usage.limit}
        </span>
        {!canUse && showUpgrade && (
          <button
            onClick={() => window.location.href = '/subscription/plans'}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Upgrade
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="font-medium text-gray-900">{getFeatureLabel()}</h3>
        </div>
        <span className="text-sm text-gray-500">{getStatusMessage()}</span>
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
          <span className="text-gray-900 font-medium">{usage.remaining}</span>
        </div>
      </div>

      {!canUse && showUpgrade && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            You've reached your {getFeatureLabel().toLowerCase()} limit.
          </p>
          <button
            onClick={() => window.location.href = '/subscription/plans'}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default UsageTracker;