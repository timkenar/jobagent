import { JobPosting } from '../types'; // Assuming types.ts is in the same directory

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

const API_BASE_URL = 'http://localhost:8000/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: { id: string; email: string; fullName: string };
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
    // Expect the JobSearchApiResponse structure
    const response = await fetch(`${API_BASE_URL}/jobs/search/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });
    // Parse the full response object, then extract the 'results' array
    const data = await handleResponse<JobSearchApiResponse>(response);
    if (data.success) {
      return data.results; // Return only the array of job postings
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

export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
