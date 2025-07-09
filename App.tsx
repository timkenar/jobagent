import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useJobSearch } from './src/hooks/useJobSearch';
import { useSessionManager } from './src/hooks/useSessionManager';
import { GmailProvider } from './src/contexts/GmailContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import {
  SignUpPage,
  EmailVerificationPage,
  EmailVerificationRequired,
  OAuthCallback
} from './components/auth';
import { Dashboard } from './components/dashboard';
import { LoadingSpinner, EnhancedChatbot } from './components/shared';
import Emails from './components/email/Email';

const App = () => {
  const {
    isBackendAvailable,
    isSignedIn,
    authToken,
    handleSignInSuccess,
    handleSignOut,
  } = useJobSearch();

  // Initialize session manager
  useSessionManager({ isSignedIn, authToken, handleSignOut });

  if (isBackendAvailable === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <LoadingSpinner message="Connecting to server..." size={12} />
          <p className="mt-4 text-gray-600">Please wait while we establish connection...</p>
        </div>
      </div>
    );
  }

  if (isBackendAvailable === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-4">Backend Unavailable</h1>
          <p className="text-red-600 mb-6">The application backend could not be reached. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system">
      <GmailProvider>
        <Router>
        <Routes>
        {/* Email verification route - accessible without being signed in */}
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        
        {/* OAuth callback route - accessible without being signed in */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        
        {/* Email verification required route */}
        <Route path="/verify-email-required" element={<EmailVerificationRequired />} />
        
        {/* Sign in route - redirect to main page if not signed in */}
        <Route path="/signin" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <>
              <Dashboard />
              <EnhancedChatbot />
            </>
          )
        } />
        
        {/* Main app routes */}
        <Route path="/" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <>
              <Dashboard />
              <EnhancedChatbot /> {/* Floating chatbot component */}
            </>
          )
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <>
              <Dashboard />
              <EnhancedChatbot />
            </>
          )
        } />
        {/* Gmail account section route */}
        {/* <Route path="/email" element={ 
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <>
            <Dashboard />
            <Emails />
            </>
          )
        } /> */}
          
          
          
        </Routes>
      </Router>
      </GmailProvider>
    </ThemeProvider>
  );
};

export default App;
