import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../shared';
import { API_CONFIG } from '../../src/config/api';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authorization...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract the authorization code and state from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        console.log('OAuth callback received:', { code: code ? 'present' : 'missing', error, state });

        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage(`Authorization failed: ${error}`);
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // Get the auth token from localStorage
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          setStatus('error');
          setMessage('Please sign in to connect your email account');
          return;
        }

        setMessage('Connecting your Gmail account...');

        // Send the authorization code to the backend
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/email-accounts/gmail-oauth-callback/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: window.location.origin + '/oauth-callback'
          })
        });

        const result = await response.json();
        console.log('OAuth callback response:', result);

        if (result.success) {
          setStatus('success');
          setMessage('Gmail account connected successfully!');
          
          // Close popup if this is a popup window
          if (window.opener) {
            console.log('Notifying parent window of success');
            window.opener.postMessage({
              type: 'gmail_oauth_success',
              email: result.email
            }, '*');
            window.close();
          } else {
            // If not a popup, redirect to dashboard after a delay
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to connect Gmail account');
        }

      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <LoadingSpinner size={16} />;
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
    switch (status) {
      case 'success':
        return 'bg-green-50';
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
          {status === 'processing' && 'Connecting Gmail...'}
          {status === 'success' && 'Gmail Connected!'}
          {status === 'error' && 'Connection Failed'}
        </h1>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => window.close()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Close Window
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
            >
              Back to Dashboard
            </button>
          </div>
        )}
        
        {status === 'success' && !window.opener && (
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;