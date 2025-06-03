import { useState, useEffect, useCallback } from 'react';
import { JobPosting, GeneratedEmail } from '../../types'; // Assuming types.ts is in the same directory
import { searchOnlineJobs, generateTailoredEmail, signOutUser, checkBackendStatus } from '../../services/geminiService'; // Assuming geminiService.ts is in services directory
import { DEFAULT_EMAIL_TEMPLATE } from '../constants/emailTemplate'; // Assuming emailTemplate.ts is in constants directory

// Debounce utility
const debounce = <T extends (...args: any[]) => Promise<void>>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => Promise<void>) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    return new Promise<void>((resolve) => {
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
};

// Rate limiter per user
const lastRequestTime = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests

interface JobSearchState {
  cvText: string;
  emailTemplate: string;
  jobSearchQuery: string;
  jobResults: JobPosting[];
  selectedJobForEmail: JobPosting | null;
  generatedEmail: GeneratedEmail | null;
  isLoadingSearch: boolean;
  isLoadingEmail: boolean;
  error: string | null;
  emailCopied: boolean;
  isBackendAvailable: boolean | null;
  authToken: string | null;
  isSignedIn: boolean;
  isEmailSending: boolean; // New state for email sending
  emailSentMessage: string | null; // New state for email sent message
}

interface JobSearchActions {
  setCvText: (text: string) => void;
  setEmailTemplate: (template: string) => void;
  setJobSearchQuery: (query: string) => void;
  handleSearchJobs: () => Promise<void>;
  handleGenerateEmail: (job: JobPosting) => Promise<void>;
  handleCopyToClipboard: () => void;
  handleSignInSuccess: (token: string) => void;
  handleSignOut: () => Promise<void>;
  handleCloseModal: () => void;
  handleSendEmail: (recipientEmail: string, subject: string, body: string) => Promise<void>; // New action for sending email
}

export const useJobSearch = (): JobSearchState & JobSearchActions => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [cvText, setCvText] = useState<string>(localStorage.getItem('cvText') || '');
  const [emailTemplate, setEmailTemplate] = useState<string>(
    localStorage.getItem('emailTemplate') || DEFAULT_EMAIL_TEMPLATE
  );
  const [jobSearchQuery, setJobSearchQuery] = useState<string>('');
  const [jobResults, setJobResults] = useState<JobPosting[]>([]);
  const [selectedJobForEmail, setSelectedJobForEmail] = useState<JobPosting | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [isEmailSending, setIsEmailSending] = useState<boolean>(false); // Initialize new state
  const [emailSentMessage, setEmailSentMessage] = useState<string | null>(null); // Initialize new state

  useEffect(() => {
    checkBackendStatus().then(setIsBackendAvailable);
  }, []);

  useEffect(() => {
    if (cvText) localStorage.setItem('cvText', cvText);
    else localStorage.removeItem('cvText');
  }, [cvText]);

  useEffect(() => {
    if (emailTemplate) localStorage.setItem('emailTemplate', emailTemplate);
    else localStorage.removeItem('emailTemplate');
  }, [emailTemplate]);

  const handleSignInSuccess = (token: string) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setIsSignedIn(true);
    setError(null);
  };

  const handleSignOut = async () => {
    if (authToken) {
      try {
        await signOutUser(authToken);
      } catch (e) {
        console.warn('Sign out API call failed, signing out client-side only.', e);
      }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
    setIsSignedIn(false);
    setJobSearchQuery('');
    setJobResults([]);
    setSelectedJobForEmail(null);
    setGeneratedEmail(null);
    setError(null);
    setEmailSentMessage(null); // Clear email sent message on sign out
  };

  const handleSearchJobs = useCallback(
    debounce(async () => {
      if (!jobSearchQuery.trim()) {
        setError('Please enter a job search query.');
        return;
      }
      if (!cvText.trim()) {
        setError('Please enter your CV details.');
        return;
      }
      if (!authToken) {
        setError('You must be signed in to search for jobs.');
        return;
      }

      // Rate limiting
      const userId = authToken.slice(0, 10); // Partial token as user ID
      const now = Date.now();
      const lastTime = lastRequestTime.get(userId) || 0;
      if (now - lastTime < MIN_REQUEST_INTERVAL) {
        setError('Please wait a few seconds before searching again.');
        return;
      }
      lastRequestTime.set(userId, now);

      // Check cache
      const cacheKey = `jobResults:${jobSearchQuery}`;
      const cachedResults = localStorage.getItem(cacheKey);
      if (cachedResults) {
        setJobResults(JSON.parse(cachedResults));
        return;
      }

      setIsLoadingSearch(true);
      setError(null);
      setJobResults([]);
      try {
        const limitedQuery = jobSearchQuery.slice(0, 100); // Limit query
        const results = await searchOnlineJobs(limitedQuery, authToken);
        setJobResults(results);
        localStorage.setItem(cacheKey, JSON.stringify(results));
        if (results.length === 0) {
          setError('No jobs found for your query. Try broadening your search or check your query for typos.');
        }
      } catch (e) {
        setError(
          e.message.includes('429')
            ? 'Quota exceeded for job search. Please wait a few minutes and try again, or consider upgrading to a paid plan at https://ai.google.dev/pricing.'
            : e.message || 'An unknown error occurred during job search.'
        );
      } finally {
        setIsLoadingSearch(false);
      }
    }, 1000),
    [jobSearchQuery, cvText, authToken]
  );

  const handleGenerateEmail = useCallback(
    async (job: JobPosting) => {
      if (!cvText.trim() || !emailTemplate.trim()) {
        setError('CV and Email Template cannot be empty.');
        return;
      }
      if (!authToken) {
        setError('You must be signed in to generate emails.');
        return;
      }

      // Rate limiting
      const userId = authToken.slice(0, 10);
      const now = Date.now();
      const lastTime = lastRequestTime.get(userId) || 0;
      if (now - lastTime < MIN_REQUEST_INTERVAL) {
        setError('Please wait a few seconds before generating another email.');
        return;
      }
      lastRequestTime.set(userId, now);

      setSelectedJobForEmail(job);
      setIsLoadingEmail(true);
      setError(null);
      setGeneratedEmail(null);
      setEmailSentMessage(null); // Clear email sent message on new generation
      try {
        const limitedCvText = cvText.slice(0, 500); // Further reduced
        const limitedEmailTemplate = emailTemplate.slice(0, 500);
        const emailContent = await generateTailoredEmail(job, limitedCvText, limitedEmailTemplate, authToken);
        setGeneratedEmail({ jobTitle: job.title, emailContent });
      } catch (e) {
        setError(
          e.message.includes('429')
            ? 'Quota exceeded for email generation. Please wait a few minutes and try again, or consider upgrading to a paid plan at https://ai.google.dev/pricing.'
            : e.message || 'An unknown error occurred while generating the email.'
        );
      } finally {
        setIsLoadingEmail(false);
      }
    },
    [cvText, emailTemplate, authToken]
  );

  const handleCopyToClipboard = () => {
    if (generatedEmail) {
      navigator.clipboard
        .writeText(generatedEmail.emailContent)
        .then(() => {
          setEmailCopied(true);
          setTimeout(() => setEmailCopied(false), 2000);
        })
        .catch((err) => console.error('Failed to copy email: ', err));
    }
  };

  const handleCloseModal = () => {
    setGeneratedEmail(null);
    setSelectedJobForEmail(null);
    setEmailSentMessage(null); // Clear email sent message on modal close
  };

  // New function to handle sending email (mocked for now)
  const handleSendEmail = useCallback(
    async (recipientEmail: string, subject: string, body: string) => {
      setIsEmailSending(true);
      setEmailSentMessage(null);
      setError(null);

      // Simulate API call for sending email
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

      try {
        // In a real application, you would make an API call to your backend here
        // e.g., await sendEmailApiCall(recipientEmail, subject, body, authToken);

        // For now, just simulate success
        console.log('Simulating email send:');
        console.log('To:', recipientEmail);
        console.log('Subject:', subject);
        console.log('Body:', body);

        setEmailSentMessage('Email sent successfully!');
      } catch (e) {
        setError(`Failed to send email: ${e.message || 'An unknown error occurred.'}`);
        setEmailSentMessage(null);
      } finally {
        setIsEmailSending(false);
        // Automatically clear success message after a few seconds
        setTimeout(() => setEmailSentMessage(null), 5000);
      }
    },
    [] // No dependencies as it's a mock for now
  );

  return {
    cvText,
    emailTemplate,
    jobSearchQuery,
    jobResults,
    selectedJobForEmail,
    generatedEmail,
    isLoadingSearch,
    isLoadingEmail,
    error,
    emailCopied,
    isBackendAvailable,
    authToken,
    isSignedIn,
    isEmailSending, // Expose new state
    emailSentMessage, // Expose new state
    setCvText,
    setEmailTemplate,
    setJobSearchQuery,
    handleSearchJobs,
    handleGenerateEmail,
    handleCopyToClipboard,
    handleSignInSuccess,
    handleSignOut,
    handleCloseModal,
    handleSendEmail, // Expose new action
  };
};
