import React, { useState } from 'react';
import EmailIntegrationSection from './EmailIntegrationSection';
import UserDetailsSection from './UserDetailsSection';
import JobSearchSection from './JobSearchSection';
import GeneratedEmailModal from './GeneratedEmailModal';
import { useJobSearch } from '../src/hooks/useJobSearch';

const WorkflowSteps: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
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
    handleCloseModal,
  } = useJobSearch();

  const steps = [
    {
      id: 1,
      title: 'Connect Email',
      description: 'Connect your Gmail or Outlook account for automated job tracking',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      component: <EmailIntegrationSection />,
      isCompleted: () => completedSteps.includes(1)
    },
    {
      id: 2,
      title: 'Setup Profile',
      description: 'Add your CV details and customize your email template',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: (
        <UserDetailsSection
          cvText={cvText}
          emailTemplate={emailTemplate}
          setCvText={setCvText}
          setEmailTemplate={setEmailTemplate}
        />
      ),
      isCompleted: () => cvText.trim().length > 50 && emailTemplate.trim().length > 50
    },
    {
      id: 3,
      title: 'Search Jobs',
      description: 'Find relevant job postings and generate personalized emails',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      component: (
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
      ),
      isCompleted: () => jobResults.length > 0
    }
  ];

  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const getStepStatus = (step: any) => {
    if (step.isCompleted()) return 'completed';
    if (activeStep === step.id) return 'active';
    if (step.id < activeStep) return 'completed';
    return 'pending';
  };

  const getConnectorStatus = (stepIndex: number) => {
    const currentStep = steps[stepIndex];
    const nextStep = steps[stepIndex + 1];
    
    if (currentStep.isCompleted() && nextStep) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="min-h-full">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Workflow Progress */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Search Workflow</h2>
        <div className="flex items-center justify-between max-w-4xl">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    getStepStatus(step) === 'completed'
                      ? 'bg-green-500 border-green-500 text-white shadow-lg'
                      : getStepStatus(step) === 'active'
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {getStepStatus(step) === 'completed' ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                  
                  {/* Step Number Badge */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    getStepStatus(step) === 'completed'
                      ? 'bg-green-600 text-white'
                      : getStepStatus(step) === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                </button>
                
                <div className="mt-3 text-center max-w-24">
                  <div className={`text-sm font-medium ${
                    getStepStatus(step) === 'active' ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 px-4">
                  <div className={`h-0.5 transition-all duration-300 ${
                    getConnectorStatus(index) === 'completed'
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Active Step Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Step {activeStep}: {steps.find(s => s.id === activeStep)?.title}
              </h3>
              <p className="text-gray-600 mt-1">
                {steps.find(s => s.id === activeStep)?.description}
              </p>
            </div>
            
            {/* Step Navigation */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
                disabled={activeStep === steps.length}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {steps.find(s => s.id === activeStep)?.component}
        </div>
      </div>

      {/* Generated Email Modal */}
      <GeneratedEmailModal
        generatedEmail={generatedEmail}
        selectedJobForEmail={selectedJobForEmail}
        emailCopied={emailCopied}
        handleCopyToClipboard={handleCopyToClipboard}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default WorkflowSteps;