import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { GmailEmailsList } from '../email';
import { useGmail } from '../../src/contexts/GmailContext';
import { API_CONFIG } from '../../src/config/api';
import LogoSpinner from '../ui/logospinner';

interface EmailAccount {
  id: number;
  provider: string;
  email: string;
}

const EmailIntegrationSection: React.FC = () => {
  const gmail = useGmail();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [connectionProgress, setConnectionProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  const getCachedEmailAccounts = () => {
    try {
      const cachedData = localStorage.getItem('email_accounts_cache');
      const cacheTimestamp = localStorage.getItem('email_cache_timestamp');
      
      if (cachedData && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < CACHE_DURATION) {
        return JSON.parse(cachedData);
      }
      localStorage.removeItem('email_accounts_cache');
      localStorage.removeItem('email_cache_timestamp');
    } catch (error) {
      console.error('Error with email accounts cache:', error);
    }
    return null;
  };

  const setEmailAccountsCache = (accounts: any[]) => {
    try {
      localStorage.setItem('email_accounts_cache', JSON.stringify(accounts));
      localStorage.setItem('email_cache_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error setting email accounts cache:', error);
    }
  };

  // Initialize email accounts with caching
  useEffect(() => {
    initializeEmailAccounts();
  }, []);

  // Use Gmail context for account management
  useEffect(() => {
    if (gmail.error) {
      setError(gmail.error);
    }
  }, [gmail.error]);

  const initializeEmailAccounts = async () => {
    setLoading(true);
    const cachedAccounts = getCachedEmailAccounts();
    
    if (cachedAccounts && gmail.emailAccounts.length === 0) {
      setLoading(false);
      setTimeout(() => refreshEmailAccounts(true), 1000);
    } else {
      await refreshEmailAccounts();
    }
  };

  const refreshEmailAccounts = async (background = false) => {
    try {
      if (!background) setLoading(true);
      await gmail.refreshAccounts();
      
      if (gmail.emailAccounts.length > 0) {
        setEmailAccountsCache(gmail.emailAccounts);
      }
    } catch (error) {
      console.error('Error refreshing email accounts:', error);
      if (!background) setError('Failed to load email accounts');
    } finally {
      if (!background) setLoading(false);
    }
  };

  // Add window message listener for OAuth success from popup
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      console.log('Received message:', event.data);
      
      // Handle OAuth success from popup
      if (event.data?.type === 'gmail_oauth_success') {
        console.log('Gmail OAuth success received from popup');
        setConnectionProgress(80); // Processing authorization
        setSuccessMessage('🎉 Email connected successfully! You can now manage your job application emails.');
        
        gmail.refreshAccounts().then(() => {
          setEmailAccountsCache(gmail.emailAccounts);
          setConnectionProgress(100);
          setConnecting(false);
          
          // Persist connection status
          localStorage.setItem('email_connected', 'true');
          localStorage.setItem('email_connection_time', new Date().toISOString());
          localStorage.removeItem('gmail_oauth_in_progress');
        }).catch(() => {
          setError('Failed to refresh accounts after connection');
          setConnecting(false);
          localStorage.removeItem('gmail_oauth_in_progress');
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      
      // Handle OAuth errors from popup
      else if (event.data?.type === 'gmail_oauth_error') {
        console.error('OAuth error received from popup:', event.data.error);
        setError(`Gmail connection failed: ${event.data.error}`);
        setConnecting(false);
        setConnectionProgress(0);
        
        // Clear any connection progress
        localStorage.removeItem('gmail_oauth_in_progress');
      }
    }
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gmail]);

  // Update handleConnect to use postMessage instead of polling
  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    setError('');
    setSuccessMessage('');
    setConnecting(true);
    setConnectionProgress(0);
    
    // Mark OAuth in progress
    localStorage.setItem('gmail_oauth_in_progress', 'true');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please sign in to your account first before connecting email providers.');
        setConnecting(false);
        localStorage.removeItem('gmail_oauth_in_progress');
        return;
      }
      
      setConnectionProgress(20); // Getting OAuth URL
      const res = await axios.get(`${API_CONFIG.BASE_URL}/api/email-accounts/oauth-init/?provider=${provider}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.error) {
        setError(res.data.error);
        setConnecting(false);
        return;
      }
      
      setConnectionProgress(40); // Opening OAuth popup
      const oauthUrl = res.data.oauth_url;
      if (!oauthUrl || typeof oauthUrl !== 'string') {
        setError('Failed to generate OAuth URL. Please try again.');
        setConnecting(false);
        return;
      }
      // Open popup window for Gmail OAuth only
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        oauthUrl,
        `${provider}_oauth_popup`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
      );
      if (!popup) {
        setError('Popup was blocked. Please allow popups for this site and try again.');
        setConnecting(false);
        localStorage.removeItem('gmail_oauth_in_progress');
        return;
      }
      
      // Monitor popup closure
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          if (localStorage.getItem('gmail_oauth_in_progress')) {
            // User closed popup without completing OAuth
            setConnecting(false);
            setConnectionProgress(0);
            setError('Gmail connection was cancelled.');
            localStorage.removeItem('gmail_oauth_in_progress');
          }
        }
      }, 1000);
      
      setConnectionProgress(60); // Waiting for user authorization
      // No polling needed; postMessage will handle the code
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Authentication expired. Please sign in again.');
        localStorage.removeItem('authToken'); // Clear invalid token
      } else {
        setError(
          err.response?.data?.error || 
          err.response?.data?.message || 
          'Failed to initiate Gmail connection. Please check your connection and try again.'
        );
      }
      setConnecting(false);
      localStorage.removeItem('gmail_oauth_in_progress');
    }
  };

  const handleDisconnect = async (accountId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please sign in to disconnect your email account.');
        return;
      }

      const response = await axios.delete(`${API_CONFIG.BASE_URL}/api/email-accounts/${accountId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 204) {
        setSuccessMessage('✅ Email account disconnected successfully!');
        
        // Clear connection status from localStorage
        localStorage.removeItem('email_connected');
        localStorage.removeItem('email_connection_time');
        localStorage.removeItem('email_accounts_cache');
        localStorage.removeItem('email_cache_timestamp');
        
        // Refresh accounts to update UI
        await gmail.refreshAccounts();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to disconnect email account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={sectionRef} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Email Integration</h3>
          <p className="text-gray-600 text-sm">Connect your email to track job applications automatically</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-center space-x-3">
            <LogoSpinner size={32} />
            <div className="text-blue-700 dark:text-blue-300 font-medium">Loading email accounts...</div>
          </div>
          <div className="mt-3 bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                 style={{ width: '70%' }}></div>
          </div>
        </div>
      )}

      {/* Connection Progress */}
      {connecting && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              <span className="text-green-700 font-medium">Connecting email account...</span>
            </div>
            <span className="text-green-600 text-sm">{connectionProgress}%</span>
          </div>
          <div className="bg-green-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                 style={{ width: `${connectionProgress}%` }}></div>
          </div>
          <div className="mt-2 text-green-600 text-xs">
            {connectionProgress < 30 && "Initializing OAuth flow..."}
            {connectionProgress >= 30 && connectionProgress < 60 && "Opening authorization window..."}
            {connectionProgress >= 60 && connectionProgress < 80 && "Waiting for authorization..."}
            {connectionProgress >= 80 && connectionProgress < 100 && "Processing connection..."}
            {connectionProgress === 100 && "Connection successful!"}
          </div>
        </div>
      )}

      {/* Syncing State */}
      {syncing && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2">
            <div className="animate-bounce flex space-x-1">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animation-delay-200"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animation-delay-400"></div>
            </div>
            <span className="text-purple-700 font-medium">Syncing emails...</span>
          </div>
        </div>
      )}
      
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
      
      {/* Connection Prompt - More Prominent when no accounts connected */}
      {gmail.emailAccounts.length === 0 && !loading && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h4 className="text-base font-semibold text-blue-900">Connect Your Email</h4>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Start tracking your job applications automatically by connecting your email account.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleConnect('gmail')}
          className="group relative bg-white border-2 border-gray-200 hover:border-red-500 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-700 hover:text-red-600 font-semibold py-4 px-4 sm:px-6 rounded-xl shadow-sm hover:shadow-lg transition-all flex items-center space-x-3 transform hover:scale-[1.02]"
          disabled={loading}
        >
          <div className="w-10 h-10 sm:w-8 sm:h-8 bg-red-500 group-hover:bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-sm sm:text-base">{loading ? 'Connecting...' : 'Connect Gmail'}</div>
            <div className="text-xs text-gray-500 hidden sm:block">Google Workspace integration</div>
          </div>
          {gmail.emailAccounts.length === 0 && !loading && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          )}
        </button>
        
        <button
          onClick={() => handleConnect('outlook')}
          className="group relative bg-white border-2 border-gray-200 hover:border-blue-500 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-700 hover:text-blue-600 font-semibold py-4 px-4 sm:px-6 rounded-xl shadow-sm hover:shadow-lg transition-all flex items-center space-x-3 transform hover:scale-[1.02]"
          disabled={loading}
        >
          <div className="w-10 h-10 sm:w-8 sm:h-8 bg-blue-500 group-hover:bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.462 0H0v24h7.462V12.872H12V24h12V0H12v11.128H7.462V0z"/>
            </svg>
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-sm sm:text-base">{loading ? 'Connecting...' : 'Connect Outlook'}</div>
            <div className="text-xs text-gray-500 hidden sm:block">Microsoft 365 integration</div>
          </div>
        </button>
      </div>
      
      <div className="border-t border-gray-200 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900">Connected Accounts</h4>
          {gmail.emailAccounts.length > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full self-start sm:self-auto">
              {gmail.emailAccounts.length} Connected
            </span>
          )}
        </div>
        
        {loading && gmail.emailAccounts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <LogoSpinner size={24} />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading accounts...</span>
          </div>
        ) : gmail.emailAccounts.length === 0 ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm font-medium">No email accounts connected yet</p>
            <p className="text-gray-400 text-xs mt-1">Connect your email above to start tracking applications</p>
            <div className="mt-4">
              <svg className="w-6 h-6 text-gray-300 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {gmail.emailAccounts.map((acc) => (
              <div key={acc.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-100 transition-colors space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    acc.provider === 'gmail' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {acc.provider === 'gmail' ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.462 0H0v24h7.462V12.872H12V24h12V0H12v11.128H7.462V0z"/>
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{acc.email}</div>
                    <div className="text-xs sm:text-sm text-gray-500 capitalize">{acc.provider} Account</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-green-600 font-medium whitespace-nowrap">Connected</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 hover:border-red-300 rounded transition-colors"
                    disabled={loading}
                  >
                    Disconnect
                  </button>
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