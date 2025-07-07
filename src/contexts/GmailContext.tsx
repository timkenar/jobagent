import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface GmailEmail {
  id: string;
  subject: string;
  sender: string;
  date: string;
  snippet: string;
  body?: string;
  isRead?: boolean;
  labels?: string[];
}

interface EmailAccount {
  id: number;
  provider: string;
  email: string;
  created_at: string;
}

interface GmailContextType {
  // State
  emails: GmailEmail[];
  emailAccounts: EmailAccount[];
  gmailAccount: EmailAccount | null;
  isLoading: boolean;
  error: string | null;
  lastSearchQuery: string;
  
  // Actions
  fetchEmails: (query?: string, maxResults?: number) => Promise<GmailEmail[]>;
  searchEmails: (query: string, maxResults?: number) => Promise<GmailEmail[]>;
  refreshAccounts: () => Promise<void>;
  clearError: () => void;
  
  // Utility
  isGmailConnected: boolean;
  getEmailById: (id: string) => GmailEmail | undefined;
  getEmailsByQuery: (query: string) => GmailEmail[];
}

const GmailContext = createContext<GmailContextType | undefined>(undefined);

interface GmailProviderProps {
  children: ReactNode;
}

export const GmailProvider: React.FC<GmailProviderProps> = ({ children }) => {
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [gmailAccount, setGmailAccount] = useState<EmailAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  // Initialize on mount
  useEffect(() => {
    refreshAccounts();
  }, []);

  // Update Gmail account when accounts change
  useEffect(() => {
    const connectedGmail = emailAccounts.find(account => account.provider === 'gmail');
    setGmailAccount(connectedGmail || null);
    
    // Auto-fetch default emails when Gmail is connected
    if (connectedGmail && emails.length === 0) {
      fetchEmails().catch(err => {
        console.debug('Auto-fetch emails failed:', err.message);
        // Don't throw error for auto-fetch failures
      });
    }
  }, [emailAccounts]);

  const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  const refreshAccounts = async (): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/email-accounts/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmailAccounts(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching email accounts:', err);
      setError('Failed to fetch email accounts');
      if (err.response?.status === 401) {
        setError('Authentication expired. Please sign in again.');
      }
    }
  };

  const fetchEmails = async (query?: string, maxResults: number = 20): Promise<GmailEmail[]> => {
    if (!gmailAccount) {
      const errorMsg = 'No Gmail account connected';
      setError(errorMsg);
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Build query parameters
      const params = new URLSearchParams({
        max_results: maxResults.toString()
      });

      if (query) {
        params.append('query', query);
        setLastSearchQuery(query);
      }

      const response = await axios.get(
        `http://localhost:8000/api/email-accounts/${gmailAccount.id}/gmail-emails/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const fetchedEmails = response.data.emails || [];
      
      // Update state with new emails (merge with existing to avoid duplicates)
      setEmails(prevEmails => {
        const emailMap = new Map();
        
        // Add existing emails
        prevEmails.forEach(email => emailMap.set(email.id, email));
        
        // Add/update with new emails
        fetchedEmails.forEach((email: GmailEmail) => emailMap.set(email.id, email));
        
        return Array.from(emailMap.values()).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      return fetchedEmails;
    } catch (err: any) {
      console.error('Error fetching Gmail emails:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch emails';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const searchEmails = async (query: string, maxResults: number = 20): Promise<GmailEmail[]> => {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await fetchEmails(query, maxResults);
  };

  const clearError = (): void => {
    setError(null);
  };

  const getEmailById = (id: string): GmailEmail | undefined => {
    return emails.find(email => email.id === id);
  };

  const getEmailsByQuery = (query: string): GmailEmail[] => {
    if (!query.trim()) return emails;

    const lowerQuery = query.toLowerCase();
    return emails.filter(email => 
      email.subject.toLowerCase().includes(lowerQuery) ||
      email.sender.toLowerCase().includes(lowerQuery) ||
      email.snippet.toLowerCase().includes(lowerQuery) ||
      (email.body && email.body.toLowerCase().includes(lowerQuery))
    );
  };

  const contextValue: GmailContextType = {
    // State
    emails,
    emailAccounts,
    gmailAccount,
    isLoading,
    error,
    lastSearchQuery,
    
    // Actions
    fetchEmails,
    searchEmails,
    refreshAccounts,
    clearError,
    
    // Utility
    isGmailConnected: !!gmailAccount,
    getEmailById,
    getEmailsByQuery
  };

  return (
    <GmailContext.Provider value={contextValue}>
      {children}
    </GmailContext.Provider>
  );
};

// Custom hook for using Gmail context
export const useGmail = (): GmailContextType => {
  const context = useContext(GmailContext);
  if (context === undefined) {
    throw new Error('useGmail must be used within a GmailProvider');
  }
  return context;
};

// Helper hook for Gmail search with debouncing
export const useGmailSearch = (debounceMs: number = 500) => {
  const gmail = useGmail();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GmailEmail[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(gmail.emails);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await gmail.searchEmails(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to local search
        const localResults = gmail.getEmailsByQuery(searchQuery);
        setSearchResults(localResults);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, gmail, debounceMs]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch: () => {
      setSearchQuery('');
      setSearchResults(gmail.emails);
    }
  };
};

export default GmailContext;