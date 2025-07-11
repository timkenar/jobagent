import React from 'react';
import { Lock, Star, ArrowRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import type { FeatureType } from '../types';

interface FeatureGateProps {
  feature: FeatureType;
  amount?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUsage?: boolean;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  amount = 1,
  children,
  fallback,
  showUsage = true
}) => {
  const { canUseFeature, stats, getUsagePercentage } = useSubscription();

  const canAccess = canUseFeature(feature, amount);
  const usage = stats?.usage_stats[feature];
  const percentage = getUsagePercentage(feature);

  const getFeatureLabel = () => {
    const labels = {
      job_applications: 'Job Applications',
      cv_uploads: 'CV Uploads',
      email_accounts: 'Email Accounts',
      ai_requests: 'AI Requests'
    };
    return labels[feature];
  };

  if (canAccess) {
    return (
      <div className="relative">
        {children}
        {showUsage && usage && percentage >= 70 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-800">
                {usage.remaining} {getFeatureLabel().toLowerCase()} remaining
              </span>
              <button
                onClick={() => window.location.href = '/subscriptions/plans'}
                className="text-yellow-600 hover:text-yellow-800 text-xs underline"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {/* Overlay */}
      <div className="relative">
        <div className="filter blur-sm pointer-events-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center p-6 max-w-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upgrade Required
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              You've reached your limit for {getFeatureLabel().toLowerCase()}. 
              {usage && ` (${usage.used}/${usage.limit} used)`}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/subscriptions/plans'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Star className="w-4 h-4 mr-2" />
                View Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={() => window.location.href = '/subscriptions/dashboard'}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                View Usage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;