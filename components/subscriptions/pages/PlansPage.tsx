import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ArrowLeft, Globe, Calculator, X } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { pricingCalculator } from '../services/pricingCalculator';
import PlanCard from '../components/PlanCard';
import CurrencySelector from '../components/CurrencySelector';
import PricingCalculator from '../components/PricingCalculator';
import type { SubscriptionPlan } from '../types';

const PlansPage: React.FC = () => {
  const { plans, stats, loading, error, subscribeToPlan, userCurrency, locationData } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [localizedPlans, setLocalizedPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    // Update localized plans when currency or billing cycle changes
    const updateLocalizedPlans = async () => {
      if (plans.length > 0) {
        // Use pricing calculator to ensure consistent pricing
        await pricingCalculator.loadCustomTiers();
        const calculatedPlans = pricingCalculator.convertAllTiersToCurrency(userCurrency, billingCycle);
        setLocalizedPlans(calculatedPlans);
      }
    };

    updateLocalizedPlans();
  }, [plans, userCurrency, billingCycle]);

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      setSelectedPlan(planId);
      
      const authorizationUrl = await subscribeToPlan(planId);
      
      // Open Paystack payment in a new window
      window.open(authorizationUrl, '_blank', 'width=600,height=700');
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

  // Use localized plans or filter regular plans by billing cycle
  const filteredPlans = localizedPlans.length > 0 
    ? localizedPlans.filter(plan => plan.billing_cycle === billingCycle)
    : plans.filter(plan => plan.billing_cycle === billingCycle);

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
    is_active: true,
    price_display: 'Free',
    created_at: '',
    updated_at: ''
  };

  const displayPlans = [freePlan, ...filteredPlans];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <span className="text-gray-600">Loading subscription plans...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Plans</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
                <p className="text-gray-600">Select the perfect plan for your job search needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* Billing cycle toggle */}
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Save up to 25%
              </span>
            </button>
          </div>

          {/* Currency selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="w-4 h-4 mr-2" />
              <span>Currency: {userCurrency}</span>
              {locationData && (
                <span className="ml-1 text-gray-500">({locationData.country})</span>
              )}
            </div>
            <button
              onClick={() => setShowCurrencySelector(!showCurrencySelector)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change Currency
            </button>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Calculator className="w-4 h-4 mr-1" />
              Price Calculator
            </button>
          </div>
        </div>

        {/* Currency selector modal */}
        {showCurrencySelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Currency
              </h3>
              <CurrencySelector showLabel={false} />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowCurrencySelector(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Calculator Modal */}
        {showCalculator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pricing Calculator
                  </h3>
                  <button
                    onClick={() => setShowCalculator(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <PricingCalculator />
              </div>
            </div>
          </div>
        )}

        {/* Current subscription info */}
        {stats?.has_active_subscription && stats.current_plan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Current Plan</h3>
                <p className="text-blue-700 text-sm">
                  You're currently on the {stats.current_plan.name} plan
                  {stats.days_remaining && ` (${stats.days_remaining} days remaining)`}
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/subscriptions/dashboard'}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayPlans.map((plan) => {
            const discount = getBillingCycleDiscount(plan);
            const isCurrentPlan = stats?.current_plan?.id === plan.id;
            const isSubscribingToPlan = subscribing && selectedPlan === plan.id;
            
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrentPlan}
                isPopular={plan.is_popular}
                isSubscribing={isSubscribingToPlan}
                discount={discount}
                onSubscribe={handleSubscribe}
              />
            );
          })}
        </div>

        {/* Features comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Compare Plan Features
          </h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    {displayPlans.map((plan) => (
                      <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Job Applications</td>
                    {displayPlans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-900">
                        {plan.max_job_applications}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">CV Uploads</td>
                    {displayPlans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-900">
                        {plan.max_cv_uploads}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Email Accounts</td>
                    {displayPlans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-900">
                        {plan.max_email_accounts}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">AI Requests</td>
                    {displayPlans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-900">
                        {plan.ai_requests_limit}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Questions about our plans?
          </h3>
          <p className="text-gray-600 mb-6">
            ✓ 30-day money-back guarantee &nbsp;•&nbsp; ✓ Cancel anytime &nbsp;•&nbsp; ✓ Secure payments via Paystack
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/subscriptions/dashboard'}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Current Plan
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;