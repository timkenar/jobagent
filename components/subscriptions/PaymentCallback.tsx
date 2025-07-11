import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useSubscription } from '../../src/contexts/SubscriptionContext';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment } = useSubscription();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    // Paystack returns both reference and trxref, use whichever is available
    const paymentReference = reference || trxref;

    if (paymentReference) {
      verifyPaymentTransaction(paymentReference);
    } else {
      setStatus('error');
      setMessage('No payment reference found in the URL');
    }
  }, [searchParams, verifyPayment]);

  const verifyPaymentTransaction = async (reference: string) => {
    try {
      setStatus('verifying');
      setMessage('Verifying your payment...');
      
      const success = await verifyPayment(reference);
      
      if (success) {
        setStatus('success');
        setMessage('Payment successful! Your subscription has been activated.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/subscription/dashboard');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage('Payment verification failed. Please contact support if you believe this is an error.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your payment. Please try again.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'error':
        return <AlertTriangle className="w-16 h-16 text-orange-600" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'error':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Payment';
      case 'success':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      case 'error':
        return 'Verification Error';
      default:
        return 'Processing';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Title */}
          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {getStatusTitle()}
          </h1>

          {/* Status Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{paymentDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{paymentDetails.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{paymentDetails.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={() => navigate('/subscription/dashboard')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            )}

            {status === 'failed' && (
              <button
                onClick={() => navigate('/subscription/plans')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            )}

            {status === 'error' && (
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Retry Verification
                </button>
                <button
                  onClick={() => navigate('/subscription/plans')}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Back to Plans
                </button>
              </div>
            )}

            {/* Always show home button */}
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Go Home
            </button>
          </div>

          {/* Support Contact */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@jobassist.com" className="text-blue-600 hover:text-blue-800">
                support@jobassist.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;