import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Home,
  Loader2,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionLayout from '../layout/SubscriptionLayout';

interface PaymentStatus {
  status: 'success' | 'failed' | 'pending' | 'cancelled' | 'loading';
  message: string;
  reference?: string;
  amount?: number;
  currency?: string;
  plan_name?: string;
  subscription_id?: string;
}

const statusStyles: Record<PaymentStatus['status'], string> = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
  failed: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  pending: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
  cancelled: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  loading: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
};

const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPayment, refreshCurrentSubscription, refreshStats } = useSubscription();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'loading',
    message: 'Processing your payment...',
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    if (reference || trxref) {
      handlePaymentVerification().catch(console.error);
    } else {
      setPaymentStatus({
        status: 'failed',
        message: 'Invalid payment reference. Please try again.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, trxref]);

  const handlePaymentVerification = async () => {
    const paymentRef = reference || trxref;
    if (!paymentRef) {
      setPaymentStatus({
        status: 'failed',
        message: 'No payment reference provided.',
      });
      return;
    }

    try {
      setPaymentStatus({
        status: 'loading',
        message: 'Verifying your payment...',
      });

      const success = await verifyPayment(paymentRef);

      if (success) {
        setPaymentStatus({
          status: 'success',
          message: 'Payment successful! Your subscription is now active.',
          reference: paymentRef,
        });

        await Promise.all([refreshCurrentSubscription(), refreshStats()]);
        return;
      }

      setPaymentStatus({
        status: 'failed',
        message: 'Payment verification failed. Please contact support if this seems incorrect.',
        reference: paymentRef,
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus({
        status: 'failed',
        message: 'Unable to verify payment. Please try again or contact support.',
        reference: paymentRef,
      });
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await handlePaymentVerification();
    setIsRetrying(false);
  };

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-300" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500 dark:text-red-300" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500 dark:text-yellow-300" />;
      case 'cancelled':
        return <AlertCircle className="h-16 w-16 text-gray-500 dark:text-gray-300" />;
      case 'loading':
      default:
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500 dark:text-blue-300" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Pending';
      case 'cancelled':
        return 'Payment Cancelled';
      case 'loading':
      default:
        return 'Processing Payment';
    }
  };

  const renderActions = () => {
    const navigateTo = (path: string) => () => navigate(path, { replace: true });

    switch (paymentStatus.status) {
      case 'success':
        return (
          <>
            <button
              type="button"
              onClick={navigateTo('/subscriptions/dashboard')}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              View Subscription Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={navigateTo('/')}
              className="flex w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </button>
          </>
        );
      case 'failed':
        return (
          <>
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying || retryCount >= 3}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {retryCount >= 3 ? 'Max Retries Reached' : 'Retry Verification'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={navigateTo('/subscriptions/plans')}
              className="flex w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Try Different Plan
            </button>
            <button
              type="button"
              onClick={navigateTo('/')}
              className="flex w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </button>
          </>
        );
      case 'pending':
        return (
          <>
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status
                </>
              )}
            </button>
            <button
              type="button"
              onClick={navigateTo('/subscriptions/dashboard')}
              className="flex w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              View Dashboard
            </button>
          </>
        );
      case 'cancelled':
        return (
          <>
            <button
              type="button"
              onClick={navigateTo('/subscriptions/plans')}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Try Again
            </button>
            <button
              type="button"
              onClick={navigateTo('/')}
              className="flex w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </button>
          </>
        );
      case 'loading':
      default:
        return (
          <div className="text-center text-sm text-gray-500 dark:text-gray-300">
            Please wait while we process your payment...
          </div>
        );
    }
  };

  return (
    <SubscriptionLayout
      title="Payment Status"
      subtitle="We&apos;re processing the outcome of your recent subscription payment."
      showHeader={false}
      contentClassName="flex items-center justify-center py-12"
    >
      <div className="w-full max-w-lg">
        <div
          className={`rounded-2xl border-2 bg-white dark:bg-gray-900 p-8 text-center shadow-xl transition-colors ${statusStyles[paymentStatus.status]}`}
        >
          <div className="mb-6 flex justify-center">{getStatusIcon()}</div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {getStatusTitle()}
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{paymentStatus.message}</p>

          {paymentStatus.status === 'success' && paymentStatus.reference && (
            <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 p-4 text-left">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                Payment Details
              </h3>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Reference:</span>
                <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                  {paymentStatus.reference}
                </span>
              </div>
            </div>
          )}

          {paymentStatus.status === 'failed' && paymentStatus.reference && (
            <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-left">
              <h3 className="mb-2 font-semibold text-red-900 dark:text-red-200">Error Details</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Reference: {paymentStatus.reference}
              </p>
            </div>
          )}

          <div className="space-y-3">{renderActions()}</div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Need help? Contact our support team
            </p>
            <div className="space-x-4 text-xs">
              <a
                href="/support"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Support Center
              </a>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionLayout>
  );
};

export default PaymentCallbackPage;
