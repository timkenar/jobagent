import React, { useState } from 'react';
import { Check, Star, Loader2, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../src/contexts/SubscriptionContext';
import { SubscriptionPlan } from '../../src/services/subscriptionService';

interface SubscriptionPlansProps {
  onPlanSelect?: (planId: string) => void;
  showFreePlan?: boolean;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  onPlanSelect, 
  showFreePlan = true 
}) => {
  const { plans, stats, loading, error, subscribeToPlan } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      setSelectedPlan(planId);
      
      const authorizationUrl = await subscribeToPlan(planId);
      
      // Open Paystack payment in a new window
      window.open(authorizationUrl, '_blank', 'width=600,height=700');
      
      if (onPlanSelect) {
        onPlanSelect(planId);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const getFeatureList = (plan: SubscriptionPlan) => {
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

  const getBillingCycleDiscount = (plan: SubscriptionPlan) => {
    if (plan.billing_cycle === 'yearly') {
      // Find corresponding monthly plan
      const monthlyPlan = plans.find(p => 
        p.name.replace(' (Yearly)', '') === plan.name.replace(' (Yearly)', '') &&
        p.billing_cycle === 'monthly'
      );
      
      if (monthlyPlan) {
        const yearlyFromMonthly = monthlyPlan.price * 12;
        const savings = Math.round(((yearlyFromMonthly - plan.price) / yearlyFromMonthly) * 100);
        return savings > 0 ? savings : null;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading subscription plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-600" />
        <span className="ml-2 text-red-600">{error}</span>
      </div>
    );
  }

  // Free plan data for display
  const freePlan = {
    id: 'free',
    name: 'Free',
    description: 'Basic features to get started',
    price: 0,
    currency: 'NGN',
    billing_cycle: 'monthly' as const,
    max_job_applications: 10,
    max_cv_uploads: 1,
    max_email_accounts: 1,
    ai_requests_limit: 20,
    features: {
      job_applications: true,
      cv_uploads: true,
      email_accounts: true,
      ai_requests: true,
      priority_support: false,
      advanced_analytics: false,
      custom_templates: false,
    },
    is_popular: false,
    is_current: !stats?.has_active_subscription
  };

  const displayPlans = showFreePlan ? [freePlan, ...plans] : plans;

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your job search needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {displayPlans.map((plan) => {
          const discount = getBillingCycleDiscount(plan);
          const isCurrentPlan = stats?.current_plan?.id === plan.id;
          const isFreePlan = plan.id === 'free';
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.is_popular ? 'border-blue-500 scale-105' : 'border-gray-200'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {/* Popular badge */}
              {plan.is_popular && (
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-2">
                        /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>

                  {/* Discount badge */}
                  {discount && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                      Save {discount}%
                    </div>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-3 mb-6">
                  {getFeatureList(plan).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className={`w-5 h-5 mr-3 ${
                        feature.enabled !== false ? 'text-green-500' : 'text-gray-300'
                      }`} />
                      <span className={`text-sm ${
                        feature.enabled !== false ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <button
                  onClick={() => !isFreePlan && handleSubscribe(plan.id)}
                  disabled={subscribing || isCurrentPlan || isFreePlan}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : isFreePlan
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : plan.is_popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                      : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
                  } ${subscribing && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {subscribing && selectedPlan === plan.id ? (
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
        })}
      </div>

      {/* Money-back guarantee */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          ✓ 30-day money-back guarantee &nbsp;•&nbsp; ✓ Cancel anytime &nbsp;•&nbsp; ✓ Secure payments via Paystack
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;