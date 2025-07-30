import React, { useState, useEffect, useRef } from 'react';
import { signUpUser, signInUser, initializeGoogleSignIn } from '../../services/geminiService';
import { LoadingSpinner } from '../shared';
import { EmailVerificationRequired } from '../auth';
import gsap from 'gsap';

interface SignUpPageProps {
  onSignInSuccess: (token: string) => void;
  isSignIn?: boolean;
}

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
  email_verification_required?: boolean;
  email?: string;
}

type AuthMode = 'signup' | 'signin';

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignInSuccess, isSignIn = false }) => {
  const [authMode, setAuthMode] = useState<AuthMode>(isSignIn ? 'signin' : 'signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // GSAP refs for animation
  const logoRef = useRef<HTMLDivElement>(null);
  const googleRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate sections in sequence
    gsap.set([
      logoRef.current,
      googleRef.current,
      dividerRef.current,
      formRef.current,
      footerRef.current
    ], { opacity: 0, y: 40 });
    gsap.to(logoRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
    gsap.to(googleRef.current, { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'power3.out' });
    gsap.to(dividerRef.current, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power3.out' });
    gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.7, delay: 0.6, ease: 'power3.out' });
    gsap.to(footerRef.current, { opacity: 1, y: 0, duration: 0.7, delay: 0.8, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    // Initialize Google Sign-In button
    initializeGoogleSignIn(authMode === 'signup' ? 'signup_with' : 'signin_with')
      .catch((err) => {
        console.error('Failed to initialize Google Sign-In:', err);
        setError('Failed to load Google Sign-In. Please try again.');
      });

    // Listen for Google Sign-In success
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<AuthResponse>;
      setIsLoading(true);
      if (customEvent.detail?.success && customEvent.detail.token) {
        onSignInSuccess(customEvent.detail.token);
      } else {
        setError(customEvent.detail?.message || 'Google sign-in failed.');
      }
      setIsLoading(false);
    };
    document.addEventListener('googleSignIn', handler);
    return () => document.removeEventListener('googleSignIn', handler);
  }, [authMode, onSignInSuccess]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (authMode === 'signup' && !fullName.trim())) {
      setError('All fields are required.');
      return;
    }
    if (authMode === 'signup' && !agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to sign up.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      let response;
      if (authMode === 'signup') {
        response = await signUpUser(fullName, email, password);
      } else {
        response = await signInUser(email, password);
      }

      if (response.success) {
        if (response.email_verification_required) {
          // Show email verification page
          setUserEmail(email);
          setShowEmailVerification(true);
        } else if (response.token) {
          // Normal sign-in with token
          onSignInSuccess(response.token);
        } else {
          setError(response.message || 'An unexpected error occurred.');
        }
      } else {
        if (response.email_verification_required && response.email) {
          // Sign in failed due to unverified email
          setUserEmail(response.email);
          setShowEmailVerification(true);
          setError('');
        } else {
          setError(response.message || 'An unexpected error occurred.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prevMode) => (prevMode === 'signup' ? 'signin' : 'signup'));
    setError('');
    setFullName('');
    setEmail('');
    setPassword('');
    setAgreedToTerms(false);
    setShowEmailVerification(false);
    setUserEmail('');
  };

  const handleBackToSignup = () => {
    setShowEmailVerification(false);
    setUserEmail('');
    setError('');
  };

  // Show email verification page if needed
  if (showEmailVerification) {
    return (
      <EmailVerificationRequired 
        email={userEmail}
        onBackToSignup={handleBackToSignup}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-2 sm:p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 border border-gray-700 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-gray-700 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-gray-800 rounded-full"></div>
      </div>
      
      <div className="relative z-10 bg-gray-800/50 backdrop-blur-sm p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md transition-all duration-300 border border-gray-700">
        {/* Logo & Title Section */}
        <div ref={logoRef} className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <svg className="w-10 h-10 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 mt-1 text-center text-base sm:text-lg">
            {authMode === 'signup' ? 'Join AI Job Agent to accelerate your career' : 'Sign in to continue your job search'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg animate-pulse backdrop-blur-sm">
            <p>{error}</p>
          </div>
        )}

        {/* Social Sign-In Options */}
        <div ref={googleRef} className="mb-6 flex flex-col items-center space-y-3">
          <div id="g_id_signin" className="w-full" />
          
          {/* LinkedIn Sign-In Button */}
          <a
            href={`${process.env.REACT_APP_API_URL}/accounts/linkedin_oauth2/login/`}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-105 flex items-center justify-center text-base border border-gray-600"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </a>
        </div>

        {/* Divider */}
        <div ref={dividerRef} className="relative mb-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-gray-800/50 text-gray-400 font-medium">
              Or {authMode === 'signup' ? 'sign up' : 'sign in'} with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 text-white placeholder-gray-400"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 text-white placeholder-gray-400"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 text-white placeholder-gray-400"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          
          {/* Terms of Service and Privacy Policy Checkbox - Only for Sign Up */}
          {authMode === 'signup' && (
            <div className="flex items-start space-x-3">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-green-400 bg-gray-900 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                disabled={isLoading}
                required
              />
              <label htmlFor="agreedToTerms" className="text-sm text-gray-300">
                I agree to the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline font-medium"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline font-medium"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading || (authMode === 'signup' && !agreedToTerms)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center text-lg"
            >
              {isLoading ? <LoadingSpinner size={5} /> : authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleAuthMode}
            disabled={isLoading}
            className="font-medium text-green-400 hover:text-green-300 hover:underline disabled:opacity-60 transition-colors duration-200"
          >
            {authMode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
      {/* Footer with GSAP animation */}
      <div ref={footerRef} className="relative z-10 text-center mt-8 py-4 w-full">
        <p className="text-sm text-gray-500">AI Job Agent - Your Smart Career Companion</p>
      </div>
    </div>
  );
};

export default SignUpPage;