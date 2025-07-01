import React from 'react';
import ChatBotWidget from './components/chatbot'; // Import chatbot widget
import { useJobSearch } from './src/hooks/useJobSearch';
import SignUpPage from './components/SignUpPage';
import UserProfile from './components/UserProfile';
import UserDetailsSection from './components/UserDetailsSection';
import JobSearchSection from './components/JobSearchSection';
import GeneratedEmailModal from './components/GeneratedEmailModal';
import LoadingSpinner from './components/LoadingSpinner';
import { PaperAirplaneIcon, ArrowRightOnRectangleIcon } from './components/icons';
import EmailIntegrationSection from './components/EmailIntegrationSection';

const App = () => {
  const {
    isBackendAvailable,
    isSignedIn,
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
    setCvText,
    setEmailTemplate,
    setJobSearchQuery,
    handleSearchJobs,
    handleGenerateEmail,
    handleCopyToClipboard,
    handleSignInSuccess,
    handleSignOut,
    handleCloseModal,
  } = useJobSearch();

  if (isBackendAvailable === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner message="Connecting to server..." size={12} />
      </div>
    );
  }

  if (isBackendAvailable === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Backend Unavailable</h1>
          <p className="text-red-600">The application backend could not be reached. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <SignUpPage onSignInSuccess={handleSignInSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-200">
      {/* Email Integration Section: Connect Gmail/Outlook */}
      <EmailIntegrationSection />
      <div className="min-h-screen container mx-auto p-4 md:p-8">
        <header className="mb-10 flex justify-between items-start">
          <div className="inline-flex items-center space-x-3">
            <PaperAirplaneIcon className="w-12 h-12 text-sky-600" />
            <h1 className="text-4xl font-bold text-slate-800">AI Job Search Email Assistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            <UserProfile />
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 text-slate-600 hover:text-sky-600 transition-colors"
              aria-label="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="w-7 h-7" />
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow">
            <p className="font-semibold">Error:</p>
            <p>
              {error.includes('Quota exceeded') ? (
                <>
                  {error}{' '}
                  <a
                    href="https://ai.google.dev/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    Upgrade your plan for higher limits.
                  </a>
                </>
              ) : (
                error
              )}
            </p>
          </div>
        )}

        <UserDetailsSection
          cvText={cvText}
          emailTemplate={emailTemplate}
          setCvText={setCvText}
          setEmailTemplate={setEmailTemplate}
        />

        <JobSearchSection
          jobSearchQuery={jobSearchQuery}
          setJobSearchQuery={setJobSearchQuery}
          jobResults={jobResults}
          isLoadingSearch={isLoadingSearch}
          cvText={cvText}
          handleSearchJobs={handleSearchJobs}
          handleGenerateEmail={handleGenerateEmail}
          isLoadingEmail={isLoadingEmail}
          selectedJobForEmail={selectedJobForEmail}
        />

        <GeneratedEmailModal
          generatedEmail={generatedEmail}
          selectedJobForEmail={selectedJobForEmail}
          emailCopied={emailCopied}
          handleCopyToClipboard={handleCopyToClipboard}
          onClose={handleCloseModal}
        />

        <footer className="text-center mt-12 py-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Remember to review and personalize AI-generated content before sending.
          </p>
        </footer>
      </div>

      <ChatBotWidget /> {/* Floating chatbot component */}
    </div>
  );
};

export default App;
