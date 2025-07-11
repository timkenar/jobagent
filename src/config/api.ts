// API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Google Search API
  GOOGLE_SEARCH_API_KEY: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '',
  GOOGLE_SEARCH_ENGINE_ID: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '',
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login/',
    SIGNUP: '/api/auth/signup/',
    LOGOUT: '/api/auth/logout/',
    GOOGLE: '/api/auth/google/',
    VERIFY_EMAIL: '/api/auth/verify-email/',
    RESEND_VERIFICATION: '/api/auth/resend-verification/',
  },
  
  // Automation
  AUTOMATION: {
    SEARCH_JOBS: '/api/automation/search-jobs/',
    APPLY_TO_JOB: '/api/automation/apply-to-job/',
    BULK_APPLY: '/api/automation/bulk-apply/',
    AUTOMATED_SEARCH_APPLY: '/api/automation/automated-search-apply/',
    STATUS: '/api/automation/status/',
    TEST_PLATFORM: '/api/automation/test-platform/',
    SCHEDULE_AUTOMATED_SEARCH: '/api/automation/schedule-automated-search/',
  },
  
  // Jobs
  JOBS: {
    SEARCH: '/api/jobs/search/',
    APPLICATIONS: '/api/job-applications/',
    MATCHES: '/api/job-matches/',
  },
  
  // CV
  CV: {
    LIST: '/api/cvs/',
    DETAIL: '/api/cvs/{id}/',
  },
  
  // Email
  EMAIL: {
    ACCOUNTS: '/api/email-accounts/',
    GENERATE: '/api/emails/generate/',
  },
  
  // Settings
  SETTINGS: {
    LIST: '/api/settings/',
    AI_SERVICES: '/api/ai-services/',
  },
  
  // Chatbot
  CHATBOT: {
    ASK: '/api/chatbot/ask/',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications/',
    PREFERENCES: '/notifications/preferences/',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function for API calls with error handling
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = buildApiUrl(endpoint);
  const headers = getAuthHeaders();
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};