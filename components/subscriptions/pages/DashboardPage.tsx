import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Award,
  Clock,
  TrendingUp,
  Star,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import UsageCard from '../components/UsageCard';
import SubscriptionLayout from '../layout/SubscriptionLayout';

const statusStyles: Record<string, string> = {
  active: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/40',
  cancelled: 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/40',
  expired: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/70',
  pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40',
  suspended: 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40',
  default: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/70',
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSubscription,
    stats,
    loading,
    error,
    cancelSubscription,
    reactivateSubscription,
    refreshCurrentSubscription,
    refreshStats,
  } = useSubscription();

  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      setActionLoading(true);
      await cancelSubscription(currentSubscription.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (cancelError) {
      console.error('Cancel subscription error:', cancelError);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!currentSubscription) return;

    try {
      setActionLoading(true);
      await reactivateSubscription(currentSubscription.id);
    } catch (reactivateError) {
      console.error('Reactivate subscription error:', reactivateError);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setActionLoading(true);
      await Promise.all([refreshCurrentSubscription(), refreshStats()]);
    } catch (refreshError) {
      console.error('Refresh error:', refreshError);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() || 'default';
    return statusStyles[normalized] || statusStyles.default;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-gray-600 dark:text-gray-300">
            Loading subscription details...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 p-6 text-center shadow-lg">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Error Loading Subscription
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
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
        {!stats?.has_active_subscription ? (
          <section className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-8 text-center shadow-sm">
            <Star className="mx-auto mb-4 h-12 w-12 text-blue-600 dark:text-blue-300" />
            <h2 className="mb-2 text-2xl font-semibold text-blue-900 dark:text-blue-100">
              No Active Subscription
            </h2>
            <p className="mb-6 text-blue-700 dark:text-blue-100/80">
              You're currently on the free plan. Upgrade to unlock more features and higher limits.
            </p>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => navigate('/subscriptions/plans')}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 md:w-auto"
              >
                View Plans &amp; Upgrade
              </button>
              {stats && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(stats.usage_stats).map(([feature, usage]) => (
                    <UsageCard
                      key={feature}
                      feature={feature as any}
                      usage={usage}
                      compact
                      showUpgrade={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {currentSubscription && (
              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center">
                    <Award className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {currentSubscription.plan.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {currentSubscription.plan.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(
                      currentSubscription.status
                    )}`}
                  >
                    {currentSubscription.status.charAt(0).toUpperCase() +
                      currentSubscription.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      Started: {formatDate(currentSubscription.start_date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {currentSubscription.status === 'active' ? 'Renews' : 'Expires'}:{' '}
                      {formatDate(currentSubscription.end_date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <CreditCard className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {currentSubscription.plan.price_display}/{currentSubscription.plan.billing_cycle}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {currentSubscription.days_remaining}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Days Remaining</div>
                    {currentSubscription.days_remaining <= 7 &&
                      currentSubscription.status === 'active' && (
                        <div className="mt-2 inline-flex rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                          Expires soon
                        </div>
                      )}
                  </div>

                  <div className="text-center">
                    <div className="mb-2 flex items-center justify-center">
                      {currentSubscription.auto_renew ? (
                        <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-300" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 dark:text-red-300" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Auto-renewal {currentSubscription.auto_renew ? 'enabled' : 'disabled'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {currentSubscription.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      Cancel Subscription
                    </button>
                  ) : currentSubscription.status === 'cancelled' ? (
                    <button
                      type="button"
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                      {actionLoading ? 'Processing...' : 'Reactivate Subscription'}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => navigate('/subscriptions/plans')}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Change Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/subscriptions/billing')}
                    className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing History
                  </button>
                </div>
              </section>
            )}

            {stats && (
              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <TrendingUp className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Usage Statistics
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(stats.usage_stats).map(([feature, usage]) => (
                    <UsageCard key={feature} feature={feature as any} usage={usage} showUpgrade />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate('/subscriptions/plans')}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 text-left transition-colors hover:border-blue-300 dark:hover:border-blue-500"
          >
            <Star className="mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              View All Plans
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Compare features and pricing
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/subscriptions/billing')}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 text-left transition-colors hover:border-blue-300 dark:hover:border-blue-500"
          >
            <CreditCard className="mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Billing History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View payments and invoices
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/subscriptions/settings')}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 text-left transition-colors hover:border-blue-300 dark:hover:border-blue-500"
          >
            <Settings className="mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage subscription preferences
            </p>
          </button>
        </section>
      </div>
    );
  };

  return (
    <SubscriptionLayout
      title="Subscription Dashboard"
      subtitle="Manage your plan, usage, and billing details."
    >
      {renderContent()}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cancel Subscription
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to cancel your subscription? You&apos;ll lose access to premium
              features at the end of your current billing period.
            </p>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Help us improve by sharing your feedback..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 dark:bg-red-500 dark:hover:bg-red-600"
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SubscriptionLayout>
  );
};

export default DashboardPage;
