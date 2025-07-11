import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Home,
  Loader2,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

interface PaymentStatus {
  status: 'success' | 'failed' | 'pending' | 'cancelled' | 'loading';
  message: string;
  reference?: string;
  amount?: number;
  currency?: string;
  plan_name?: string;
  subscription_id?: string;
}

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { verifyPayment, refreshCurrentSubscription, refreshStats } = useSubscription();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'loading',
    message: 'Processing your payment...'
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Extract parameters from URL
  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');
  const status = searchParams.get('status');

  useEffect(() => {
    if (reference || trxref) {
      handlePaymentVerification();
    } else {
      setPaymentStatus({
        status: 'failed',
        message: 'Invalid payment reference. Please try again.'
      });
    }
  }, [reference, trxref]);

  const handlePaymentVerification = async () => {
    try {
      const paymentRef = reference || trxref;
      if (!paymentRef) {
        throw new Error('No payment reference found');
      }

      setPaymentStatus({
        status: 'loading',
        message: 'Verifying your payment...'
      });

      const result = await verifyPayment(paymentRef);
      
      if (result.success) {
        setPaymentStatus({
          status: 'success',
          message: 'Payment successful! Your subscription is now active.',
          reference: result.reference,
          amount: result.amount,
          currency: result.currency,
          plan_name: result.plan_name,
          subscription_id: result.subscription_id
        });

        // Refresh subscription data
        await Promise.all([
          refreshCurrentSubscription(),
          refreshStats()
        ]);
      } else {
        setPaymentStatus({
          status: 'failed',
          message: result.message || 'Payment verification failed. Please contact support.',
          reference: result.reference
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus({
        status: 'failed',
        message: 'Unable to verify payment. Please try again or contact support.',
        reference: reference || trxref || undefined
      });
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Add delay before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await handlePaymentVerification();
    setIsRetrying(false);
  };

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="w-16 h-16 text-gray-500" />;
      case 'loading':
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200';
      case 'loading':
      default:
        return 'bg-blue-50 border-blue-200';
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

  const formatAmount = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`bg-white rounded-2xl shadow-xl border-2 p-8 text-center ${getStatusColor()}`}>
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {getStatusTitle()}
          </h1>

          {/* Status Message */}
          <p className="text-gray-600 mb-6">
            {paymentStatus.message}
          </p>

          {/* Payment Details */}
          {paymentStatus.status === 'success' && (
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                {paymentStatus.plan_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{paymentStatus.plan_name}</span>
                  </div>
                )}
                {paymentStatus.amount && paymentStatus.currency && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {formatAmount(paymentStatus.amount, paymentStatus.currency)}
                    </span>
                  </div>
                )}
                {paymentStatus.reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium text-xs">{paymentStatus.reference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Details */}
          {paymentStatus.status === 'failed' && paymentStatus.reference && (
            <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
              <p className="text-sm text-red-700">
                Reference: {paymentStatus.reference}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {paymentStatus.status === 'success' && (
              <>
                <button
                  onClick={() => window.location.href = '/subscriptions/dashboard'}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                >
                  View Subscription Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </>
            )}

            {paymentStatus.status === 'failed' && (
              <>
                <button
                  onClick={handleRetry}
                  disabled={isRetrying || retryCount >= 3}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {retryCount >= 3 ? 'Max Retries Reached' : 'Retry Verification'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.location.href = '/subscriptions/plans'}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Try Different Plan
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </>
            )}

            {paymentStatus.status === 'pending' && (
              <>
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Check Status
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.location.href = '/subscriptions/dashboard'}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  View Dashboard
                </button>
              </>
            )}

            {paymentStatus.status === 'cancelled' && (
              <>
                <button
                  onClick={() => window.location.href = '/subscriptions/plans'}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </>
            )}

            {paymentStatus.status === 'loading' && (
              <div className="text-center text-gray-500 text-sm">
                Please wait while we process your payment...
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              Need help? Contact our support team
            </p>
            <div className="space-x-4 text-xs">
              <a href="/support" className="text-blue-600 hover:text-blue-800">
                Support Center
              </a>
              <span className="text-gray-300">|</span>
              <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;