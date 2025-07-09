import React, { useState } from 'react';
import { API_CONFIG } from '../../src/config/api';

interface EmailVerificationRequiredProps {
  email: string;
  onResendSuccess?: () => void;
  onBackToSignup?: () => void;
}

const EmailVerificationRequired: React.FC<EmailVerificationRequiredProps> = ({
  email,
  onResendSuccess,
  onBackToSignup
}) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const resendVerificationEmail = async () => {
    setIsResending(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/resend-verification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Verification email sent successfully! Please check your inbox.');
        setMessageType('success');
        onResendSuccess?.();
      } else {
        setMessage(result.message || 'Failed to send verification email. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
        {/* Email Icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
        
        <p className="text-gray-600 mb-2">
          We've sent a verification link to:
        </p>
        <p className="font-semibold text-gray-900 mb-6">{email}</p>
        
        <p className="text-gray-600 mb-6">
          Please click the verification link in your email to activate your account and start using JobAssist.
        </p>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={resendVerificationEmail}
            disabled={isResending}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isResending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </button>

          <button
            onClick={onBackToSignup}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
          >
            Back to Sign Up
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="text-xs text-gray-500 space-y-1 text-left">
            <li>• Check your spam/junk folder</li>
            <li>• Make sure you entered the correct email address</li>
            <li>• Wait a few minutes for the email to arrive</li>
            <li>• Click "Resend Verification Email" if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationRequired;