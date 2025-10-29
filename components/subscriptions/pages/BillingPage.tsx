import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Download,
  AlertCircle,
  X,
  Loader2,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import type { Payment } from '../types';
import SubscriptionLayout from '../layout/SubscriptionLayout';

const statusClasses: Record<string, string> = {
  success: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/40',
  pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40',
  failed: 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/40',
  cancelled: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/70',
  default: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/70',
};

const iconByStatus: Record<string, JSX.Element> = {
  success: <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-300" />,
  pending: <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />,
  failed: <XCircle className="h-4 w-4 text-red-600 dark:text-red-300" />,
  cancelled: <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />,
  default: <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-300" />,
};

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { paymentHistory, loading, error, refreshPaymentHistory, formatCurrency } =
    useSubscription();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (paymentHistory) {
      setPayments(paymentHistory);
    }
  }, [paymentHistory]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshPaymentHistory();
    } catch (refreshError) {
      console.error('Refresh error:', refreshError);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase() || 'default';
    return statusClasses[normalized] || statusClasses.default;
  };

  const getStatusIcon = (status: string) => {
    const normalized = status?.toLowerCase() || 'default';
    return iconByStatus[normalized] || iconByStatus.default;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatAmount = (amount: number, currency: string = 'USD') =>
    formatCurrency(amount, currency);

  const downloadReceipt = (payment: Payment) => {
    console.log('Downloading receipt for payment:', payment.id);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-300">
              Loading billing history...
            </span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 p-6 text-center shadow-lg">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Error Loading Billing History
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
        {/* Payment summary */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm">
          <div className="mb-4 flex items-center">
            <Receipt className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Payment Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {payments.filter((p) => p.status === 'success').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Successful Payments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatAmount(
                  payments
                    .filter((p) => p.status === 'success')
                    .reduce((sum, payment) => sum + payment.amount, 0)
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {payments.filter((p) => p.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {payments.filter((p) => p.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed Payments</div>
            </div>
          </div>
        </section>

        {/* Payment history */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Payment History
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                No Payment History
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                You haven&apos;t made any payments yet.
              </p>
              <button
                type="button"
                onClick={() => navigate('/subscriptions/plans')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                View Plans
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="cursor-pointer p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-center gap-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatAmount(payment.amount, payment.currency)}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {payment.subscription && payment.subscription.plan
                            ? `${payment.subscription.plan.name} - ${payment.subscription.plan.billing_cycle}`
                            : 'Subscription Payment'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {payment.status === 'success' && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            downloadReceipt(payment);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                        <div>Reference: {payment.reference}</div>
                        {payment.paystack_reference && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Paystack: {payment.paystack_reference}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/subscriptions/dashboard')}
            className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate('/subscriptions/plans')}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            View Plans
          </button>
        </section>
      </div>
    );
  };

  return (
    <SubscriptionLayout
      title="Billing History"
      subtitle="Review your payments, invoices, and receipts."
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/subscriptions/dashboard')}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subscription
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {renderContent()}

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Payment Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">
                  {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    selectedPayment.status
                  )}`}
                >
                  {selectedPayment.status.charAt(0).toUpperCase() +
                    selectedPayment.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-semibold">{formatDate(selectedPayment.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono text-xs">{selectedPayment.reference}</span>
              </div>
              {selectedPayment.paystack_reference && (
                <div className="flex justify-between">
                  <span>Paystack Reference:</span>
                  <span className="font-mono text-xs">{selectedPayment.paystack_reference}</span>
                </div>
              )}
              {selectedPayment.subscription?.plan && (
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-semibold">
                    {selectedPayment.subscription.plan.name}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Close
              </button>
              {selectedPayment.status === 'success' && (
                <button
                  type="button"
                  onClick={() => downloadReceipt(selectedPayment)}
                  className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </SubscriptionLayout>
  );
};

export default BillingPage;
