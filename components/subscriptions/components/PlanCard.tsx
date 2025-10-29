import React from 'react';
import { Check, Star, Loader2, Globe } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import type { SubscriptionPlan } from '../types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  isSubscribing?: boolean;
  discount?: number | null;
  onSubscribe: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan = false,
  isPopular = false,
  isSubscribing = false,
  discount = null,
  onSubscribe
}) => {
  const { formatCurrency, userCurrency, locationData } = useSubscription();
  const getFeatureList = () => {
    const features = [
      { key: 'job_applications', label: `${plan.max_job_applications} Job Applications` },
      { key: 'cv_uploads', label: `${plan.max_cv_uploads} CV Upload${plan.max_cv_uploads !== 1 ? 's' : ''}` },
      { key: 'email_accounts', label: `${plan.max_email_accounts} Email Account${plan.max_email_accounts !== 1 ? 's' : ''}` },
      { key: 'ai_requests', label: `${plan.ai_requests_limit} AI Requests` },
    ];

    const additionalFeatures = Object.entries(plan.features || {}).map(([key, enabled]) => ({
      key,
      label: formatFeatureName(key),
      enabled
    }));

    return [...features, ...additionalFeatures];
  };

  const formatFeatureName = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isFreePlan = plan.price === 0;

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-900/80 shadow-lg ${
        isPopular ? 'border-blue-500 scale-105' : 'border-gray-200 dark:border-gray-700'
      } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Most Popular
          </div>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Plan header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {plan.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plan.description}</p>
          
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {isFreePlan ? 'Free' : formatCurrency(plan.price, plan.currency)}
            </span>
            {!isFreePlan && (
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
              </span>
            )}
          </div>

          {/* Currency info */}
          {!isFreePlan && locationData && (
            <div className="flex items-center justify-center mb-2 text-xs text-gray-500 dark:text-gray-400">
              <Globe className="w-3 h-3 mr-1" />
              <span>Prices in {userCurrency} for {locationData.country}</span>
            </div>
          )}

          {/* Original USD price for reference */}
          {!isFreePlan && plan.base_price_usd && plan.currency !== 'USD' && (
            <div className="text-center mb-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                (${plan.base_price_usd} USD)
              </span>
            </div>
          )}

          {/* Discount badge */}
          {discount && discount > 0 && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200 mb-4">
              Save {discount}%
            </div>
          )}
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-6">
          {getFeatureList().map((feature, index) => (
            <div key={index} className="flex items-center">
              <Check className={`w-5 h-5 mr-3 ${
                feature.enabled !== false ? 'text-green-500 dark:text-green-300' : 'text-gray-300 dark:text-gray-600'
              }`} />
              <span className={`text-sm ${
                feature.enabled !== false ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={() => !isFreePlan && !isCurrentPlan && onSubscribe(plan.id)}
          disabled={isSubscribing || isCurrentPlan || isFreePlan}
          className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            isCurrentPlan
              ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-200 cursor-default'
              : isFreePlan
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-default'
              : isPopular
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:active:bg-gray-300'
          } ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubscribing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </div>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : isFreePlan ? (
            'Current Plan'
          ) : (
            'Subscribe Now'
          )}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
