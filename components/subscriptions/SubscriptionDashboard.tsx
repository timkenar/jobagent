import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Settings, 
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Award,
  Clock
} from 'lucide-react';
import { useSubscription } from '../../src/contexts/SubscriptionContext';

const SubscriptionDashboard: React.FC = () => {
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

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading subscription details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">Error loading subscription</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats?.has_active_subscription) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-blue-800 font-medium">No Active Subscription</span>
        </div>
        <p className="text-blue-700 mb-4">
          You're currently on the free plan. Upgrade to unlock more features and higher limits.
        </p>
        <button
          onClick={() => window.location.href = '/subscription/plans'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={actionLoading}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Current Subscription Card */}
      {currentSubscription && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
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
              <div className="text-2xl font-bold text-gray-900">
                {currentSubscription.days_remaining}
              </div>
              <div className="text-sm text-gray-600">Days Remaining</div>
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
          <div className="flex space-x-4 mt-6">
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
              onClick={() => window.location.href = '/subscription/plans'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade Plan
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
            {Object.entries(stats.usage_stats).map(([key, usage]) => {
              const percentage = (usage.used / usage.limit) * 100;
              const featureNames = {
                job_applications: 'Job Applications',
                cv_uploads: 'CV Uploads',
                email_accounts: 'Email Accounts',
                ai_requests: 'AI Requests'
              };

              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {featureNames[key as keyof typeof featureNames]}
                    </span>
                    <span className="text-sm text-gray-500">
                      {usage.used} / {usage.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {usage.remaining} remaining
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

export default SubscriptionDashboard;