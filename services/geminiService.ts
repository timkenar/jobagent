import { JobPosting } from '../types'; // Assuming types.ts is in the same directory

// Add CV status check function
export const checkCVStatus = async (token: string | null): Promise<{
  hasActiveCV: boolean;
  cvInfo?: {
    id: number;
    original_filename: string;
    job_category: string;
    skills: string[];
    experience_years: number;
    seniority_level: string;
  };
}> => {
  if (!token) return { hasActiveCV: false };
  
  try {
    const response = await fetch(`${API_BASE_URL}/cvs/active/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const cvData = await response.json();
      return {
        hasActiveCV: true,
        cvInfo: cvData
      };
    } else {
      return { hasActiveCV: false };
    }
  } catch (error) {
    return { hasActiveCV: false };
  }
};

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
        };
      };
    };
  }
  interface ImportMeta {
    env: Record<string, string>;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;

interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: number;
    email: string;
    full_name: string;
    signup_method: 'email' | 'google';
    signup_method_display: string;
    profile_completion_percentage: number;
    is_email_verified: boolean;
    phone_number?: string;
    profile_picture?: string;
    registration_date: string;
  };
}

interface BackendError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// New interface to match the backend's job search response structure
interface JobSearchApiResponse {
  success: boolean;
  results: JobPosting[];
}

// Add CV-based job search function
export const searchJobsWithCV = async (token: string | null, jobTitle?: string, location?: string): Promise<JobPosting[]> => {
  if (!token) throw new Error('Authentication token is required.');
  try {
    // Use the CV-based job matching endpoint
    const response = await fetch(`${API_BASE_URL}/job-matches/find_matches/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        job_title: jobTitle || '', // Optional - backend will use CV data if not provided
        location: location || '' // Optional - backend will use CV preferred locations if not provided
      }),
    });
    
    const data = await handleResponse<{
      success: boolean;
      message: string;
      matches_created: number;
      search_query: string;
    }>(response);
    
    if (data.success) {
      // After creating matches, fetch the actual job matches
      const matchesResponse = await fetch(`${API_BASE_URL}/job-matches/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const matchesData = await handleResponse<{
        results: Array<{
          id: number;
          job_title: string;
          company_name: string;
          job_description: string;
          job_url: string;
          location: string;
          match_score: number;
          matched_skills: string[];
          missing_skills: string[];
          match_reasons: string[];
          status: string;
          created_at: string;
        }>;
      }>(matchesResponse);
      
      // Convert job matches to JobPosting format
      const jobPostings: JobPosting[] = matchesData.results
        .sort((a, b) => b.match_score - a.match_score) // Sort by match score
        .slice(0, 20) // Limit to top 20 matches
        .map(match => ({
          id: match.id.toString(),
          title: match.job_title,
          companyName: match.company_name,
          snippet: match.job_description,
          url: match.job_url,
          location: match.location,
          matchScore: match.match_score,
          matchedSkills: match.matched_skills,
          matchReasons: match.match_reasons
        }));
      
      return jobPostings;
    } else {
      throw new Error(data.message || 'Failed to search for jobs.');
    }
  } catch (error) {
    throw new Error(`Failed to search for jobs. ${error instanceof Error ? error.message : String(error)}`);
  }
};

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error: BackendError = data || { success: false, message: `HTTP error! status: ${response.status}` };
    throw new Error(error.message || 'An unknown backend error occurred.');
  }
  return data as T;
}


export const initializeLinkedInSignIn = async (): Promise<void> => {
  if (!LINKEDIN_CLIENT_ID) {
    throw new Error('LinkedIn Client ID is not configured');
  }
  
  // LinkedIn OAuth URL - force correct development URL
  const redirectUri = window.location.hostname === 'localhost'
    ? 'http://localhost:5174/oauth-callback'
    : `${window.location.origin}/oauth-callback`;
  const scope = 'openid profile email';
  const state = crypto.randomUUID(); // Generate random state for security
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: scope,
    state: state
  });
  
  // Store state in localStorage for verification
  localStorage.setItem('linkedin_oauth_state', state);
  
  const linkedinOAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  
  // Open LinkedIn OAuth in a popup or redirect
  window.location.href = linkedinOAuthUrl;
};

export const initializeGoogleSignIn = async (buttonText: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Attempting to initialize Google Sign-In');
    console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

    // Wait for Google SDK to load
    let attempts = 0;
    const maxAttempts = 50;
    const checkGoogleSDK = () => {
      attempts++;
      if (window.google?.accounts?.id) {
        initialize();
      } else if (attempts >= maxAttempts) {
        console.error('Google Sign-In SDK failed to load after 5 seconds');
        reject(new Error('Google Sign-In SDK failed to load'));
      } else {
        setTimeout(checkGoogleSDK, 100);
      }
    };

    const initialize = () => {
      try {
        if (!GOOGLE_CLIENT_ID) {
          console.error('Google Client ID is not defined in environment variables');
          reject(new Error('Google Sign-In configuration error: Missing Client ID'));
          return;
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.error) {
              console.error('Google Sign-In Error:', response.error);
              document.dispatchEvent(
                new CustomEvent('googleSignIn', {
                  detail: { success: false, message: `Google Sign-In: ${response.error}` },
                })
              );
              return;
            }
            console.log('Google Sign-In Response:', response);
            try {
              const res = await fetch(`${API_BASE_URL}/auth/google/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ access_token: response.credential }),
              });
              const data = await handleResponse<AuthResponse>(res);
              console.log('Backend Auth Response:', data);
              // Store token and user data in localStorage
              if (data.success && data.token && data.user) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
              }
              document.dispatchEvent(new CustomEvent('googleSignIn', { detail: data }));
            } catch (error) {
              console.error('Backend Google Auth Error:', error);
              document.dispatchEvent(
                new CustomEvent('googleSignIn', {
                  detail: { success: false, message: error instanceof Error ? error.message : 'Authentication failed' },
                })
              );
            }
          },
        });

        const signInDiv = document.getElementById('g_id_signin');
        if (signInDiv) {
          console.log('Rendering Google Sign-In button');
          window.google.accounts.id.renderButton(signInDiv, {
            theme: 'outline',
            size: 'large',
            text: buttonText,
            width: signInDiv.offsetWidth || 300,
          });
          console.log('Google Sign-In button rendered');
          resolve();
        } else {
          console.error('Google Sign-In button div not found');
          reject(new Error('Google Sign-In button not found'));
        }
      } catch (error) {
        console.error('Google Sign-In Initialization Error:', error);
        reject(error);
      }
    };

    checkGoogleSDK();
  });
};


export const signUpUser = async (fullName: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });
    return await handleResponse<AuthResponse>(response);
  } catch (error) {
    throw error;
  }
};

export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse<AuthResponse>(response);
  } catch (error) {
    throw error;
  }
};

export const signOutUser = async (token: string | null): Promise<void> => {
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.warn('Error during sign out:', error);
  }
};

export const searchOnlineJobs = async (query: string, token: string | null): Promise<JobPosting[]> => {
  if (!token) throw new Error('Authentication token is required.');
  try {
    // Use the new Google search-based job matching endpoint
    const response = await fetch(`${API_BASE_URL}/job-matches/find_matches/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        job_title: query, // Optional - backend will use CV data if not provided
        location: '' // Optional - backend will use CV preferred locations if not provided
      }),
    });
    
    const data = await handleResponse<{
      success: boolean;
      message: string;
      matches_created: number;
      search_query: string;
    }>(response);
    
    if (data.success) {
      // After creating matches, fetch the actual job matches
      const matchesResponse = await fetch(`${API_BASE_URL}/job-matches/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const matchesData = await handleResponse<{
        results: Array<{
          id: number;
          job_title: string;
          company_name: string;
          job_description: string;
          job_url: string;
          location: string;
          match_score: number;
          matched_skills: string[];
          missing_skills: string[];
          match_reasons: string[];
          status: string;
          created_at: string;
        }>;
      }>(matchesResponse);
      
      // Convert job matches to JobPosting format
      const jobPostings: JobPosting[] = matchesData.results
        .filter(match => match.status === 'pending') // Only show new matches
        .map(match => ({
          id: match.id.toString(),
          title: match.job_title,
          companyName: match.company_name,
          snippet: match.job_description,
          url: match.job_url,
          location: match.location,
          matchScore: match.match_score,
          matchedSkills: match.matched_skills,
          matchReasons: match.match_reasons
        }));
      
      return jobPostings;
    } else {
      throw new Error(data.message || 'Failed to search for jobs.');
    }
  } catch (error) {
    throw new Error(`Failed to search for jobs. ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateTailoredEmail = async (
  job: JobPosting,
  cvText: string,
  emailTemplate: string,
  token: string | null
): Promise<string> => {
  if (!token) throw new Error('Authentication token is required.');
  try {
    const response = await fetch(`${API_BASE_URL}/emails/generate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        jobDetails: job,
        cvText,
        emailTemplate,
      }),
    });
    const result = await handleResponse<{ emailContent: string }>(response);
    return result.emailContent;
  } catch (error) {
    throw new Error(`Failed to generate email. ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const handleLinkedInOAuthCallback = async (code: string, state: string): Promise<AuthResponse> => {
  try {
    // Verify state to prevent CSRF attacks
    const storedState = localStorage.getItem('linkedin_oauth_state');
    if (!storedState || storedState !== state) {
      throw new Error('Invalid OAuth state parameter');
    }
    
    // Clear stored state
    localStorage.removeItem('linkedin_oauth_state');
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: window.location.hostname === 'localhost'
          ? 'http://localhost:5174/oauth-callback'
          : `${window.location.origin}/oauth-callback`,
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for access token');
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      throw new Error('No access token received from LinkedIn');
    }
    
    // Use the access token to authenticate with our backend
    return await signInWithLinkedIn(accessToken);
  } catch (error) {
    throw error;
  }
};

export const signInWithLinkedIn = async (accessToken: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/linkedin/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    });
    return await handleResponse<AuthResponse>(response);
  } catch (error) {
    throw error;
  }
};

// Backend health check function - optional, no longer blocks frontend loading
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
