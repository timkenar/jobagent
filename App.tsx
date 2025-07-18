import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useJobSearch } from './src/hooks/useJobSearch';
import { useSessionManager } from './src/hooks/useSessionManager';
import { GmailProvider } from './src/contexts/GmailContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { SubscriptionProvider } from './components/subscriptions/context/SubscriptionContext';
import {
  SignUpPage,
  EmailVerificationPage,
  EmailVerificationRequired,
  OAuthCallback
} from './components/auth';
import { Dashboard } from './components/dashboard';
import { LogoSpinner, EnhancedChatbot } from './components/shared';
import Emails from './components/email/Email';
import LandingPage from './components/LandingPage';
import PlansPage from './components/subscriptions/pages/PlansPage';
import DashboardPage from './components/subscriptions/pages/DashboardPage';
import BillingPage from './components/subscriptions/pages/BillingPage';
import SettingsPage from './components/subscriptions/pages/SettingsPage';
import PaymentCallbackPage from './components/subscriptions/pages/PaymentCallbackPage';
import PricingManagementPage from './components/subscriptions/pages/PricingManagementPage';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import GoogleVerificationLinks from './components/legal/GoogleVerificationLinks';

// Wrapper component to handle landing page navigation
const LandingPageWrapper = ({ onSignInSuccess }) => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/signup');
  };
  
  const handleSignIn = () => {
    navigate('/signin');
  };
  
  return <LandingPage onGetStarted={handleGetStarted} onSignIn={handleSignIn} />;
};

// Inner component that uses hooks requiring AuthProvider
const AppContent = () => {
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
          <LogoSpinner message="Connecting to server..." size={12} />
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
    <GmailProvider>
      <SubscriptionProvider>
          <Router>
          <Routes>
        {/* Email verification route - accessible without being signed in */}
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        
        {/* OAuth callback route - accessible without being signed in */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        
        {/* Email verification required route */}
        <Route path="/verify-email-required" element={<EmailVerificationRequired />} />
        
        {/* Landing page - shown when not signed in */}
        <Route path="/" element={
          !isSignedIn ? (
            <LandingPageWrapper onSignInSuccess={handleSignInSuccess} />
          ) : (
            <>
              <Dashboard />
              <EnhancedChatbot /> {/* Floating chatbot component */}
            </>
          )
        } />
        
        {/* Sign up route */}
        <Route path="/signup" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <>
              <Dashboard />
              <EnhancedChatbot />
            </>
          )
        } />
        
        {/* Sign in route */}
        <Route path="/signin" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} isSignIn={true} />
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
        
        {/* Subscription Routes - Protected */}
        <Route path="/subscriptions/plans" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <PlansPage />
          )
        } />
        
        <Route path="/subscriptions/dashboard" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <DashboardPage />
          )
        } />
        
        <Route path="/subscriptions/billing" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <BillingPage />
          )
        } />
        
        <Route path="/subscriptions/settings" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <SettingsPage />
          )
        } />
        
        <Route path="/subscriptions/callback" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <PaymentCallbackPage />
          )
        } />
        
        <Route path="/subscriptions/admin" element={
          !isSignedIn ? (
            <SignUpPage onSignInSuccess={handleSignInSuccess} />
          ) : (
            <PricingManagementPage />
          )
        } />
        
        {/* Legal Pages - Public Access */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/google-verification" element={<GoogleVerificationLinks />} />
         {/* Catch-all route */}
        <Route path="*" element={
          !isSignedIn ? (
            <LandingPageWrapper onSignInSuccess={handleSignInSuccess} /> 
          ) : (
            <>
              <Dashboard />
              <EnhancedChatbot />
            </>          )} /> 
        </Routes>
      </Router>
      </SubscriptionProvider>
    </GmailProvider>
  );
};

// Main App component with providers
const App = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
