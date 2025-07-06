import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from './icons';
import { signUpUser, signInUser, initializeGoogleSignIn } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import EmailVerificationRequired from './EmailVerificationRequired';
import gsap from 'gsap';

interface SignUpPageProps {
  onSignInSuccess: (token: string) => void;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: { id: string; email: string; fullName: string };
}

type AuthMode = 'signup' | 'signin';

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignInSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-white to-sky-200 p-2 sm:p-4">
      <div className="bg-white/90 p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md transition-all duration-300 border border-slate-100 backdrop-blur-md">
        {/* Logo & Title Section */}
        <div ref={logoRef} className="flex flex-col items-center mb-6">
          <PaperAirplaneIcon className="w-16 h-16 text-sky-600 mb-3 drop-shadow-lg" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            {authMode === 'signup' ? 'Create Your Account' : 'Sign In'}
          </h1>
          <p className="text-slate-600 mt-1 text-center text-base sm:text-lg">
            {authMode === 'signup' ? 'Sign up quickly with Google, or use your email below.' : 'Welcome back!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg animate-pulse">
            <p>{error}</p>
          </div>
        )}

        {/* Google Sign-In First */}
        <div ref={googleRef} className="mb-6 flex flex-col items-center">
          <div id="g_id_signin" className="w-full" />
        </div>

        {/* Divider */}
        <div ref={dividerRef} className="relative mb-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-slate-500 font-medium">
              Or {authMode === 'signup' ? 'sign up' : 'sign in'} with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1">
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
                className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors bg-slate-50"
                placeholder="Ada Lovelace"
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
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
              className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors bg-slate-50"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
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
              className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors bg-slate-50"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-colors duration-150 ease-in-out disabled:opacity-60 flex items-center justify-center text-lg"
            >
              {isLoading ? <LoadingSpinner size={5} /> : authMode === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleAuthMode}
            disabled={isLoading}
            className="font-medium text-sky-600 hover:text-sky-500 hover:underline disabled:opacity-60"
          >
            {authMode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
      {/* Footer with GSAP animation */}
      <div ref={footerRef} className="text-center mt-8 py-4 w-full">
        <p className="text-sm text-slate-500">AI Job Search Email Assistant</p>
      </div>
    </div>
  );
};

export default SignUpPage;