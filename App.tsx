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
import { LogoSpinner, EnhancedChatbot, Header, Footer, CookieConsent } from './components/shared';
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
import PricingSection from './components/pricing';
import FeaturesPage from './components/features';
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

  // Frontend loads independently - no backend health check blocking

  return (
    <GmailProvider>
      <SubscriptionProvider>
          <Router>
          <div className="min-h-screen flex flex-col">
            {!isSignedIn && (
              <Header 
                isSignedIn={isSignedIn} 
                onSignOut={handleSignOut}
              />
            )}
            <main className="flex-1">
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

        {/* Pricing - Public Access */}
        <Route path="/pricing" element={<PricingSection />} />
        
        {/* Features - Public Access */}
        <Route path="/features" element={<FeaturesPage />} />

        {/* Dashboard route */}
        
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
            </main>
            {!isSignedIn && <Footer />}
            <CookieConsent />
          </div>
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
