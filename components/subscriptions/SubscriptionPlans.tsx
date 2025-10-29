import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSubscription } from './context/SubscriptionContext';
import PlanCard from './components/PlanCard';
import type { SubscriptionPlan } from './types';

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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">
          Loading subscription plans...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        <span className="ml-2 text-red-600 dark:text-red-300">{error}</span>
      </div>
    );
  }

  // Free plan data for display
  const freePlan: SubscriptionPlan = {
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
    is_active: true,
    price_display: 'Free',
    base_price_usd: 0,
    created_at: '',
    updated_at: ''
  };

  const displayPlans = showFreePlan ? [freePlan, ...plans] : plans;

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select the perfect plan for your job search needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {displayPlans.map((plan) => {
          const isCurrentPlan = stats?.current_plan?.id === plan.id;
          const discount = getBillingCycleDiscount(plan);
          
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan}
              isPopular={plan.is_popular}
              isSubscribing={subscribing && selectedPlan === plan.id}
              discount={discount}
              onSubscribe={handleSubscribe}
            />
          );
        })}
      </div>

      {/* Money-back guarantee */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          ✓ 30-day money-back guarantee &nbsp;•&nbsp; ✓ Cancel anytime &nbsp;•&nbsp; ✓ Secure payments via Paystack
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
