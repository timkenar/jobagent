import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon } from './icons';
import { signUpUser, signInUser, initializeGoogleSignIn } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

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

      if (response.success && response.token) {
        onSignInSuccess(response.token);
      } else {
        setError(response.message || 'An unexpected error occurred.');
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
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <PaperAirplaneIcon className="w-16 h-16 text-sky-600 mb-3" />
          <h1 className="text-3xl font-bold text-slate-800">
            {authMode === 'signup' ? 'Create Your Account' : 'Sign In'}
          </h1>
          <p className="text-slate-600 mt-1">
            {authMode === 'signup' ? 'Join to streamline your job hunt!' : 'Welcome back!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
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
                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                placeholder="Ada Lovelace"
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
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
              className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
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
              className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out disabled:opacity-60 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size={5} /> : authMode === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div id="g_id_signin" className="w-full"></div>
          </div>
        </div>
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
      <footer className="text-center mt-8 py-4">
        <p className="text-sm text-slate-500">AI Job Search Email Assistant</p>
      </footer>
    </div>
  );
};

export default SignUpPage;