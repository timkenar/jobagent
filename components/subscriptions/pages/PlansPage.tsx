import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Globe, Calculator, X } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { pricingCalculator } from '../services/pricingCalculator';
import PlanCard from '../components/PlanCard';
import CurrencySelector from '../components/CurrencySelector';
import PricingCalculator from '../components/PricingCalculator';
import type { SubscriptionPlan } from '../types';
import SubscriptionLayout from '../layout/SubscriptionLayout';

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    plans,
    stats,
    loading,
    error,
    subscribeToPlan,
    userCurrency,
    locationData,
    refreshPlans,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [localizedPlans, setLocalizedPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const updateLocalizedPlans = async () => {
      if (!plans.length) return;

      try {
        await pricingCalculator.loadCustomTiers();
        const calculatedPlans = pricingCalculator.convertAllTiersToCurrency(
          userCurrency,
          billingCycle
        );
        setLocalizedPlans(calculatedPlans);
      } catch (err) {
        console.error('Failed to localize plans', err);
      }
    };

    updateLocalizedPlans().catch(console.error);
  }, [plans, userCurrency, billingCycle]);

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      setSelectedPlan(planId);

      const authorizationUrl = await subscribeToPlan(planId);
      window.open(authorizationUrl, '_blank', 'width=600,height=700');
    } catch (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
    } finally {
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const getBillingCycleDiscount = (plan: SubscriptionPlan) => {
    if (plan.billing_cycle !== 'yearly') {
      return null;
    }

    const monthlyPlan = plans.find(
      (p) =>
        p.billing_cycle === 'monthly' &&
        p.name.replace(' (Yearly)', '') === plan.name.replace(' (Yearly)', '')
    );

    if (!monthlyPlan) {
      return null;
    }

    const yearlyFromMonthly = monthlyPlan.price * 12;
    const savings = Math.round(((yearlyFromMonthly - plan.price) / yearlyFromMonthly) * 100);
    return savings > 0 ? savings : null;
  };

  const filteredPlans = localizedPlans.length
    ? localizedPlans.filter((plan) => plan.billing_cycle === billingCycle)
    : plans.filter((plan) => plan.billing_cycle === billingCycle);

  const freePlan: SubscriptionPlan = {
    id: 'free',
    name: 'Free',
    description: 'Basic features to get started',
    price: 0,
    currency: 'NGN',
    billing_cycle: 'monthly',
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
    updated_at: '',
  };

  const displayPlans = [freePlan, ...filteredPlans];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
          <span className="text-gray-600 dark:text-gray-300">
            Loading subscription plans...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 p-6 text-center shadow-lg">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Error Loading Plans
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                refreshPlans().catch(console.error);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto space-y-12 pb-16">
        {/* Controls */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800/80 p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`ml-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Yearly
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-300">
                  Save up to 25%
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Globe className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>Currency: {userCurrency}</span>
                {locationData && (
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    ({locationData.country})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowCurrencySelector(true)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Change Currency
              </button>
              <button
                type="button"
                onClick={() => setShowCalculator(true)}
                className="inline-flex items-center rounded-lg border border-blue-200 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Price Calculator
              </button>
            </div>
          </div>
        </section>

        {/* Current subscription info */}
        {stats?.has_active_subscription && stats.current_plan && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200">
                  Current Plan
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200/80">
                  You're currently on the {stats.current_plan.name} plan
                  {stats.days_remaining && ` (${stats.days_remaining} days remaining)`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/subscriptions/dashboard')}
                className="text-sm font-medium text-blue-600 dark:text-blue-300 hover:underline"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        )}

        {/* Plans grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </section>

        {/* Feature comparison */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            Compare Plan Features
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                      Feature
                    </th>
                    {displayPlans.map((plan) => (
                      <th
                        key={plan.id}
                        className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300"
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Job Applications
                    </td>
                    {displayPlans.map((plan) => (
                      <td
                        key={`${plan.id}-applications`}
                        className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100"
                      >
                        {plan.max_job_applications}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      CV Uploads
                    </td>
                    {displayPlans.map((plan) => (
                      <td
                        key={`${plan.id}-cv`}
                        className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100"
                      >
                        {plan.max_cv_uploads}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Email Accounts
                    </td>
                    {displayPlans.map((plan) => (
                      <td
                        key={`${plan.id}-email`}
                        className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100"
                      >
                        {plan.max_email_accounts}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      AI Requests
                    </td>
                    {displayPlans.map((plan) => (
                      <td
                        key={`${plan.id}-ai`}
                        className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100"
                      >
                        {plan.ai_requests_limit}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Questions about our plans?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            ✓ 30-day money-back guarantee &nbsp;•&nbsp; ✓ Cancel anytime &nbsp;•&nbsp; ✓ Secure payments via Paystack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/subscriptions/dashboard')}
              className="rounded-lg bg-gray-100 dark:bg-gray-800 px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              View Current Plan
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Contact Support
            </button>
          </div>
        </section>
      </div>
    );
  };

  return (
    <SubscriptionLayout
      title="Choose Your Plan"
      subtitle="Select the perfect plan for your job search needs."
    >
      {renderContent()}

      {/* Currency selector modal */}
      {showCurrencySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Select Currency
              </h3>
              <button
                type="button"
                onClick={() => setShowCurrencySelector(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CurrencySelector showLabel={false} />
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCurrencySelector(false)}
                className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing calculator modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Pricing Calculator
              </h3>
              <button
                type="button"
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <PricingCalculator />
            </div>
          </div>
        </div>
      )}
    </SubscriptionLayout>
  );
};

export default PlansPage;
