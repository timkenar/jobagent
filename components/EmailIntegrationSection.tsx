import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface EmailAccount {
  id: number;
  provider: string;
  email: string;
}

const EmailIntegrationSection: React.FC = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch connected accounts
  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/email-accounts/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAccounts(res.data);
    } catch (err: any) {
      setError('Failed to fetch connected accounts.');
      console.error('Fetch accounts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Add window message listener for OAuth code
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'gmail_oauth_code' && event.data.code) {
        // Send code to backend for token exchange
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in.');
          return;
        }
        setLoading(true);
        axios.post('/api/email-accounts/gmail-oauth-callback/', {
          code: event.data.code,
          redirect_uri: `${window.location.protocol}//${window.location.host}/api/email-accounts/gmail-oauth-callback/`,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((callbackRes) => {
          if (callbackRes.data.success) {
            fetchAccounts();
            setError('Gmail connected successfully!');
            setTimeout(() => setError(''), 3000);
          } else {
            setError(callbackRes.data.error || 'Failed to complete Gmail authentication.');
          }
        })
        .catch((callbackError) => {
          setError(callbackError.response?.data?.error || 'Failed to complete authentication. Please try again.');
        })
        .finally(() => setLoading(false));
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update handleConnect to use postMessage instead of polling
  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      const res = await axios.get(`/api/email-accounts/oauth-init/?provider=${provider}`, {
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
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to initiate authentication. Please check your connection and try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div ref={sectionRef} className="bg-white/90 rounded-3xl shadow-2xl border border-slate-100 p-6 max-w-xl mx-auto my-8 transition-all">
      <h2 className="text-2xl font-extrabold text-slate-800 mb-4 text-center">Email Integration</h2>
      <p className="text-slate-600 mb-6 text-center">Connect your email to track job applications automatically.</p>
      
      {error && (
        <div className={`mb-4 p-3 border rounded-lg text-center ${
          error.includes('successfully') 
            ? 'bg-green-100 text-green-700 border-green-300' 
            : 'bg-red-100 text-red-700 border-red-300'
        }`}>
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <button
          onClick={() => handleConnect('gmail')}
          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors flex-1"
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Gmail'}
        </button>
        <button
          onClick={() => handleConnect('outlook')}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors flex-1"
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Outlook'}
        </button>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Connected Accounts</h3>
        {loading && accounts.length === 0 ? (
          <p className="text-slate-500">Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="text-slate-500">No accounts connected yet.</p>
        ) : (
          <ul className="space-y-2">
            {(Array.isArray(accounts) ? accounts : []).map((acc) => (
              <li key={acc.id} className="bg-slate-50 rounded-lg px-4 py-2 border border-slate-200 flex items-center gap-2">
                <span className="font-medium text-slate-700">{acc.email}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  acc.provider === 'gmail' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {acc.provider}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmailIntegrationSection;