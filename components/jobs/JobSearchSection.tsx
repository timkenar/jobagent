import React, { useState, useRef, useEffect } from 'react';
import { JobPosting, GeneratedEmail } from '../../types';
import { SearchIcon, SparklesIcon, XIcon, PaperAirplaneIcon, ClipboardIcon } from '../shared/icons';
import { LoadingSpinner } from '../shared';
import gsap from 'gsap';
import axios from 'axios';

interface JobSearchSectionProps {
  jobSearchQuery: string;
  setJobSearchQuery: (query: string) => void;
  jobResults: JobPosting[];
  isLoadingSearch: boolean;
  cvText: string;
  handleSearchJobs: () => Promise<void>;
  handleSearchJobsWithCV?: () => Promise<void>; // New prop for CV-based search
  handleGenerateEmail: (job: JobPosting) => Promise<void>;
  isLoadingEmail: boolean;
  selectedJobForEmail: JobPosting | null;
  generatedEmail: GeneratedEmail | null; // New prop for generated email
  handleCloseModal: () => void; // New prop for closing email modal
  handleCopyToClipboard: () => void; // New prop for copy to clipboard
  emailCopied: boolean; // New prop for copy status
  handleSendEmail: (recipientEmail: string, subject: string, body: string) => Promise<void>; // New prop for sending email
  isEmailSending: boolean; // New prop for email sending status
  emailSentMessage: string | null; // New prop for email sent message
  hasUploadedCV?: boolean; // New prop for CV status
  cvInfo?: any; // New prop for CV information
}

const JobSearchSection: React.FC<JobSearchSectionProps> = ({
  jobSearchQuery,
  setJobSearchQuery,
  jobResults,
  isLoadingSearch,
  cvText,
  handleSearchJobs,
  handleSearchJobsWithCV,
  handleGenerateEmail,
  isLoadingEmail,
  selectedJobForEmail,
  generatedEmail,
  handleCloseModal,
  handleCopyToClipboard,
  emailCopied,
  handleSendEmail,
  isEmailSending,
  emailSentMessage,
  hasUploadedCV: propHasUploadedCV,
  cvInfo: propCvInfo,
}) => {
  const [queuedJobs, setQueuedJobs] = useState<JobPosting[]>([]);
  const [recipientEmail, setRecipientEmail] = useState<string>(''); // State for recipient email
  const [emailSubject, setEmailSubject] = useState<string>(''); // State for email subject
  const [hasUploadedCV, setHasUploadedCV] = useState<boolean>(propHasUploadedCV || false);
  const [cvData, setCvData] = useState<any>(propCvInfo || null);
  
  // Update local state when props change
  useEffect(() => {
    if (propHasUploadedCV !== undefined) {
      setHasUploadedCV(propHasUploadedCV);
    }
    if (propCvInfo !== undefined) {
      setCvData(propCvInfo);
    }
  }, [propHasUploadedCV, propCvInfo]);

  // GSAP refs for animation
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for uploaded CV
    checkForUploadedCV();
    
    // Animate main section, header, search bar, and results
    gsap.set([
      sectionRef.current,
      headerRef.current,
      searchBarRef.current,
      resultsRef.current
    ], { opacity: 0, y: 40 });
    gsap.to(sectionRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
    gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'power3.out' });
    gsap.to(searchBarRef.current, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power3.out' });
    gsap.to(resultsRef.current, { opacity: 1, y: 0, duration: 0.7, delay: 0.6, ease: 'power3.out' });
  }, [jobResults.length]);

  const checkForUploadedCV = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('http://localhost:8000/api/cvs/active/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setHasUploadedCV(true);
        setCvData(response.data);
      }
    } catch (err: any) {
      // No active CV found
      setHasUploadedCV(false);
    }
  };

  useEffect(() => {
    // Animate modal when it appears
    if (generatedEmail && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [generatedEmail]);

  // Effect to set initial recipient email and subject when a new email is generated
  React.useEffect(() => {
    if (generatedEmail && selectedJobForEmail) {
      // Attempt to extract company name for recipient email, or use a placeholder
      const companyNameSlug = selectedJobForEmail.companyName ? selectedJobForEmail.companyName.toLowerCase().replace(/\s/g, '') : 'company';
      setRecipientEmail(`hiring@${companyNameSlug}.com`); // Placeholder email
      setEmailSubject(`Application for ${selectedJobForEmail.title}`);
    }
  }, [generatedEmail, selectedJobForEmail]);

  const handleQueueEmail = (job: JobPosting) => {
    if (!queuedJobs.find((j) => j.id === job.id)) {
      setQueuedJobs([...queuedJobs, job]);
      // Delay the actual generation to simulate rate limiting or batching
      setTimeout(() => {
        handleGenerateEmail(job);
        setQueuedJobs((prev) => prev.filter((j) => j.id !== job.id));
      }, 5000); // Delay 5 seconds
    }
  };

  const handleActualSendEmail = () => {
    if (generatedEmail && recipientEmail && emailSubject) {
      handleSendEmail(recipientEmail, emailSubject, generatedEmail.emailContent);
    }
  };

  return (
    <section ref={sectionRef} className="mb-8 p-4 sm:p-6 bg-white/90 rounded-3xl shadow-2xl border border-slate-100 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 ref={headerRef} className="text-2xl sm:text-3xl font-extrabold text-slate-700 flex items-center gap-2 tracking-tight">
          <SearchIcon className="w-7 h-7 text-sky-600" />
          Search for Jobs
        </h2>
        {hasUploadedCV && cvData && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">CV uploaded</span>
            <span className="text-gray-500">({cvData.skills?.length || 0} skills)</span>
            {cvData.job_category && (
              <span className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded-full">
                {cvData.job_category}
              </span>
            )}
          </div>
        )}
        {!hasUploadedCV && !cvText.trim() && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-600 font-medium">Upload CV to enable AI job search</span>
          </div>
        )}
      </div>
      <div ref={searchBarRef} className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={jobSearchQuery}
            onChange={(e) => setJobSearchQuery(e.target.value.slice(0, 100))}
            placeholder={hasUploadedCV ? "Optional: Specify job title or leave empty for CV-based search" : "e.g., 'React developer remote'"}
            className="flex-grow p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors bg-slate-50 text-base"
            aria-label="Job search query"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSearchJobs}
              disabled={isLoadingSearch || (!cvText.trim() && !hasUploadedCV)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md flex items-center justify-center transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-base"
              aria-live="polite"
            >
              {isLoadingSearch ? <LoadingSpinner size={5} /> : <SearchIcon className="w-5 h-5 mr-2" />}
              Regular Search
            </button>
            {hasUploadedCV && handleSearchJobsWithCV && (
              <button
                onClick={handleSearchJobsWithCV}
                disabled={isLoadingSearch}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md flex items-center justify-center transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-base"
                aria-live="polite"
              >
                {isLoadingSearch ? <LoadingSpinner size={5} /> : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                AI Search
              </button>
            )}
          </div>
        </div>
        
        {hasUploadedCV && (
          <div className="text-xs text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-emerald-700">AI Search:</span>
              <span className="ml-1">Uses Google search + your CV to find personalized job matches with compatibility scores</span>
            </div>
          </div>
        )}
      </div>
      {isLoadingSearch && <LoadingSpinner message="Searching for jobs..." />}
      {queuedJobs.length > 0 && (
        <p className="text-sm text-slate-600 mb-4 animate-pulse">
          Queued email generation for {queuedJobs.length} job(s)...
        </p>
      )}
      <div ref={resultsRef}>
        {jobResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-3">Search Results ({jobResults.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobResults.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-50 p-4 rounded-xl shadow hover:shadow-lg transition-shadow flex flex-col justify-between border border-slate-200"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sky-700 text-lg flex-1">{job.title}</h4>
                      {job.matchScore && (
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          job.matchScore >= 80 ? 'bg-green-100 text-green-800' :
                          job.matchScore >= 60 ? 'bg-blue-100 text-blue-800' :
                          job.matchScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(job.matchScore)}% match
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {job.companyName && <p className="text-sm text-slate-600">{job.companyName}</p>}
                      {job.location && <p className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{job.location}</p>}
                    </div>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-3">{job.snippet}</p>
                    
                    {job.matchedSkills && job.matchedSkills.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-600 mb-1">Matched Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.matchedSkills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                          {job.matchedSkills.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              +{job.matchedSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {job.matchReasons && job.matchReasons.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-600 mb-1">Why this matches:</p>
                        <ul className="text-xs text-slate-500">
                          {job.matchReasons.slice(0, 2).map((reason, index) => (
                            <li key={index} className="flex items-center">
                              <svg className="w-3 h-3 text-emerald-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between space-x-2 mt-2">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-600 hover:text-sky-800 hover:underline"
                    >
                      View Job
                    </a>
                    <button
                      onClick={() => handleQueueEmail(job)}
                      disabled={isLoadingEmail && selectedJobForEmail?.id === job.id}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm flex items-center transition-colors disabled:opacity-60"
                      aria-live="polite"
                    >
                      {isLoadingEmail && selectedJobForEmail?.id === job.id ? (
                        <LoadingSpinner size={4} />
                      ) : (
                        <SparklesIcon className="w-4 h-4 mr-1" />
                      )}
                      {queuedJobs.find((j) => j.id === job.id) ? 'Queued' : 'Generate Email'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Generation Modal */}
      {generatedEmail && (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800">
                Generated Email for {generatedEmail.jobTitle}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Close email modal"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                <label htmlFor="recipient-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Recipient Email:
                </label>
                <input
                  type="email"
                  id="recipient-email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  placeholder="e.g., hiring@example.com"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email-subject" className="block text-sm font-medium text-slate-700 mb-1">
                  Subject:
                </label>
                <input
                  type="text"
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  placeholder="e.g., Application for Software Engineer"
                />
              </div>
              <textarea
                className="w-full h-80 p-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 resize-none focus:outline-none"
                value={generatedEmail.emailContent}
                readOnly
                aria-label="Generated email content"
              ></textarea>
              {emailSentMessage && (
                <p className="text-center text-emerald-600 font-medium mt-3">{emailSentMessage}</p>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={handleCopyToClipboard}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-150 ease-in-out ${
                  emailCopied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                aria-live="assertive"
              >
                <ClipboardIcon className="w-5 h-5 mr-2" />
                {emailCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleActualSendEmail}
                disabled={isEmailSending || !recipientEmail || !emailSubject}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center justify-center transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                aria-live="polite"
              >
                {isEmailSending ? <LoadingSpinner size={5} /> : <PaperAirplaneIcon className="w-5 h-5 mr-2" />}
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default JobSearchSection;
