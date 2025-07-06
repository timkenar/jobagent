import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

interface VerificationResult {
  success: boolean;
  message: string;
  verified?: boolean;
  already_verified?: boolean;
  expired?: boolean;
}

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (!token || !emailParam) {
      setVerificationState('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    setEmail(emailParam);
    verifyEmail(token, emailParam);
  }, [token, emailParam]);

  const verifyEmail = async (verificationToken: string, userEmail: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/auth/verify-email/?token=${verificationToken}&email=${userEmail}`);
      const result: VerificationResult = await response.json();

      if (result.success) {
        if (result.already_verified) {
          setVerificationState('success');
          setMessage('Your email is already verified. You can sign in to your account.');
        } else if (result.verified) {
          setVerificationState('success');
          setMessage('Email verified successfully! You can now sign in to your account.');
        }
      } else {
        if (result.expired) {
          setVerificationState('expired');
          setMessage('Your verification link has expired. Please request a new one.');
        } else {
          setVerificationState('error');
          setMessage(result.message || 'Verification failed. Please try again.');
        }
      }
    } catch (error) {
      setVerificationState('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const resendVerificationEmail = async () => {
    setIsResending(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/resend-verification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(result.message || 'Failed to send verification email.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleContinueToSignIn = () => {
    navigate('/signin');
  };

  const getIcon = () => {
    switch (verificationState) {
      case 'loading':
        return <LoadingSpinner size={16} />;
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'expired':
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (verificationState) {
      case 'success':
        return 'bg-green-50';
      case 'expired':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${getBackgroundColor()}`}>
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
        {getIcon()}
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {verificationState === 'loading' && 'Verifying Email...'}
          {verificationState === 'success' && 'Email Verified!'}
          {verificationState === 'expired' && 'Link Expired'}
          {verificationState === 'error' && 'Verification Failed'}
        </h1>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {verificationState === 'success' && (
          <button
            onClick={handleContinueToSignIn}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue to Sign In
          </button>
        )}
        
        {verificationState === 'expired' && (
          <div className="space-y-3">
            <button
              onClick={resendVerificationEmail}
              disabled={isResending}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Send New Verification Email'}
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
            >
              Back to Sign In
            </button>
          </div>
        )}
        
        {verificationState === 'error' && (
          <div className="space-y-3">
            {email && (
              <button
                onClick={resendVerificationEmail}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 'Send New Verification Email'}
              </button>
            )}
            <button
              onClick={() => navigate('/signin')}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;