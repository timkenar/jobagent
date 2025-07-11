import React, { useState } from 'react';
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
  ArrowLeft,
  TrendingUp,
  Star
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import UsageCard from '../components/UsageCard';

const DashboardPage: React.FC = () => {
  const { 
    currentSubscription, 
    stats, 
    loading, 
    error, 
    cancelSubscription,
    reactivateSubscription,
    refreshCurrentSubscription,
    refreshStats 
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
    } catch (error) {
      console.error('Cancel subscription error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!currentSubscription) return;
    
    try {
      setActionLoading(true);
      await reactivateSubscription(currentSubscription.id);
    } catch (error) {
      console.error('Reactivate subscription error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setActionLoading(true);
      await Promise.all([refreshCurrentSubscription(), refreshStats()]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <span className="text-gray-600">Loading subscription details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Subscription</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
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
                <h1 className="text-2xl font-bold text-gray-900">Subscription Dashboard</h1>
                <p className="text-gray-600">Manage your subscription and track usage</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No Active Subscription */}
        {!stats?.has_active_subscription ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-blue-900 mb-2">No Active Subscription</h2>
            <p className="text-blue-700 mb-6">
              You're currently on the free plan. Upgrade to unlock more features and higher limits.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/subscriptions/plans'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Plans & Upgrade
              </button>
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
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
          </div>
        ) : (
          <>
            {/* Current Subscription Card */}
            {currentSubscription && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Award className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {currentSubscription.plan.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {currentSubscription.plan.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.status)}`}>
                      {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Subscription Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Started: {formatDate(currentSubscription.start_date)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {currentSubscription.status === 'active' ? 'Renews' : 'Expires'}: {formatDate(currentSubscription.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {currentSubscription.plan.price_display}/{currentSubscription.plan.billing_cycle}
                      </span>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {currentSubscription.days_remaining}
                    </div>
                    <div className="text-sm text-gray-600">Days Remaining</div>
                    {currentSubscription.days_remaining <= 7 && currentSubscription.status === 'active' && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        Expires soon
                      </div>
                    )}
                  </div>

                  {/* Auto Renewal */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      {currentSubscription.auto_renew ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Auto-renewal {currentSubscription.auto_renew ? 'enabled' : 'disabled'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {currentSubscription.status === 'active' ? (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  ) : currentSubscription.status === 'cancelled' ? (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Reactivate Subscription'}
                    </button>
                  ) : null}
                  
                  <button
                    onClick={() => window.location.href = '/subscriptions/plans'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Change Plan
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/subscriptions/billing'}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 mr-2 inline" />
                    Billing History
                  </button>
                </div>
              </div>
            )}

            {/* Usage Statistics */}
            {stats && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Usage Statistics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(stats.usage_stats).map(([feature, usage]) => (
                    <UsageCard
                      key={feature}
                      feature={feature as any}
                      usage={usage}
                      showUpgrade={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => window.location.href = '/subscriptions/plans'}
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-left"
          >
            <Star className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">View All Plans</h3>
            <p className="text-gray-600 text-sm">Compare features and pricing</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/subscriptions/billing'}
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-left"
          >
            <CreditCard className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Billing History</h3>
            <p className="text-gray-600 text-sm">View payments and invoices</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/subscriptions/settings'}
            className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-left"
          >
            <Settings className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 text-sm">Manage subscription preferences</p>
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Subscription
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Help us improve by sharing your feedback..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;