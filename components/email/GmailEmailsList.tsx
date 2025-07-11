import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/api';

interface GmailEmail {
  id: string;
  subject: string;
  sender: string;
  date: string;
  snippet: string;
  body?: string;
}

interface GmailEmailsListProps {
  emailAccountId: number;
}

const GmailEmailsList: React.FC<GmailEmailsListProps> = ({ emailAccountId }) => {
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/email-accounts/${emailAccountId}/gmail-emails/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { max_results: 10 }
        }
      );

      if (response.data.emails) {
        setEmails(response.data.emails);
      } else {
        setError('No emails found');
      }
    } catch (err: any) {
      console.error('Error fetching emails:', err);
      if (err.response?.status === 401) {
        setError('Authentication expired. Please reconnect your Gmail account.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch emails');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailAccountId) {
      fetchEmails();
    }
  }, [emailAccountId]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const toggleExpand = (emailId: string) => {
    setExpanded(expanded === emailId ? null : emailId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading Gmail emails...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEmails}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Recent Gmail Emails</h4>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">{emails.length} emails</span>
            <button
              onClick={fetchEmails}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh emails"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No job-related emails found</p>
          <p className="text-gray-400 text-sm mt-1">Emails with job keywords will appear here</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {emails.map((email) => (
            <div 
              key={email.id} 
              className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-gray-900 truncate">
                        {email.subject || '(No Subject)'}
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      From: {email.sender}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {formatDate(email.date)}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {email.snippet}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => toggleExpand(email.id)}
                    className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg 
                      className={`w-4 h-4 transform transition-transform ${
                        expanded === email.id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {expanded === email.id && email.body && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-900 mb-2">Email Content:</h6>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {email.body}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Showing recent emails with job-related keywords (job, application, interview, recruiter, hiring, position)
        </p>
      </div>
    </div>
  );
};

export default GmailEmailsList;