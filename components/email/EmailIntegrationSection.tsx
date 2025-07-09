import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { GmailEmailsList } from '../email';
import { useGmail } from '../../src/contexts/GmailContext';

interface EmailAccount {
  id: number;
  provider: string;
  email: string;
}

const EmailIntegrationSection: React.FC = () => {
  const gmail = useGmail();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);

  // Use Gmail context for account management
  useEffect(() => {
    if (gmail.error) {
      setError(gmail.error);
    }
  }, [gmail.error]);

  // Add window message listener for OAuth success from popup
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      console.log('Received message:', event.data);
      
      // Handle OAuth success from popup
      if (event.data?.type === 'gmail_oauth_success') {
        console.log('Gmail OAuth success received from popup');
        setSuccessMessage('Gmail connected successfully! 🎉');
        gmail.refreshAccounts(); // Refresh the accounts list
        setLoading(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      
      // Handle OAuth errors from popup
      else if (event.data?.type === 'gmail_oauth_error') {
        console.error('OAuth error received from popup:', event.data.error);
        setError(`Gmail authentication failed: ${event.data.error}`);
        setLoading(false);
      }
    }
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gmail]);

  // Update handleConnect to use postMessage instead of polling
  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please sign in to connect your email accounts.');
        setLoading(false);
        return;
      }
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/email-accounts/oauth-init/?provider=${provider}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.error) {
        setError(res.data.error);
        setLoading(false);
        return;
      }
      const oauthUrl = res.data.oauth_url;
      if (!oauthUrl || typeof oauthUrl !== 'string') {
        setError('Failed to generate OAuth URL. Please try again.');
        setLoading(false);
        return;
      }
      // Open popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        oauthUrl,
        'oauthPopup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
      if (!popup) {
        setError('Popup was blocked. Please allow popups for this site and try again.');
        setLoading(false);
        return;
      }
      // No polling needed; postMessage will handle the code
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Authentication expired. Please sign in again.');
        localStorage.removeItem('authToken'); // Clear invalid token
      } else {
        setError(
          err.response?.data?.error || 
          err.response?.data?.message || 
          'Failed to initiate authentication. Please check your connection and try again.'
        );
      }
      setLoading(false);
    }
  };

  return (
    <div ref={sectionRef} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Email Integration</h3>
          <p className="text-gray-600 text-sm">Connect your email to track job applications automatically</p>
        </div>
      </div>
      
      {successMessage && (
        <div className="mb-4 p-3 border rounded-lg text-center bg-green-100 text-green-700 border-green-300">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 border rounded-lg text-center bg-red-100 text-red-700 border-red-300">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleConnect('gmail')}
          className="group relative bg-white border-2 border-gray-200 hover:border-red-500 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-700 hover:text-red-600 font-semibold py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-3"
          disabled={loading}
        >
          <div className="w-8 h-8 bg-red-500 group-hover:bg-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="text-left">
            <div className="font-semibold">{loading ? 'Connecting...' : 'Connect Gmail'}</div>
            <div className="text-xs text-gray-500">Google Workspace integration</div>
          </div>
        </button>
        
        <button
          onClick={() => handleConnect('outlook')}
          className="group relative bg-white border-2 border-gray-200 hover:border-blue-500 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-700 hover:text-blue-600 font-semibold py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-3"
          disabled={loading}
        >
          <div className="w-8 h-8 bg-blue-500 group-hover:bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.462 0H0v24h7.462V12.872H12V24h12V0H12v11.128H7.462V0z"/>
            </svg>
          </div>
          <div className="text-left">
            <div className="font-semibold">{loading ? 'Connecting...' : 'Connect Outlook'}</div>
            <div className="text-xs text-gray-500">Microsoft 365 integration</div>
          </div>
        </button>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Connected Accounts</h4>
          {gmail.emailAccounts.length > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {gmail.emailAccounts.length} Connected
            </span>
          )}
        </div>
        
        {loading && gmail.emailAccounts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-500">Loading accounts...</span>
          </div>
        ) : gmail.emailAccounts.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No email accounts connected yet</p>
            <p className="text-gray-400 text-xs mt-1">Connect your email to start tracking applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gmail.emailAccounts.map((acc) => (
              <div key={acc.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    acc.provider === 'gmail' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {acc.provider === 'gmail' ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.462 0H0v24h7.462V12.872H12V24h12V0H12v11.128H7.462V0z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{acc.email}</div>
                    <div className="text-sm text-gray-500 capitalize">{acc.provider} Account</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Gmail Emails List */}
      {/* {gmail.isGmailConnected && (
        <div className="mt-6">
          <GmailEmailsList emailAccountId={gmail.gmailAccount?.id || 0} />
        </div>
      )} */}
    </div>
  );
};

export default EmailIntegrationSection;