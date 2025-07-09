import React, { useState } from 'react';
import { JobSearchFormProps, JobSearchConfig, JobInfo, ApplicationProgress } from './types';
import { 
  searchJobs, 
  startAutomatedJobSearch, 
  fillJobFormWithSelenium,
  promptManualApplication,
  updateApplicationTracker,
  parseJobFromUrl,
  generateTemporaryPassword
} from './jobSearchUtils';
import { googleSearchService } from '../../src/services/googleSearchService';
import { aiAgentService } from '../../src/services/aiAgentService';
import { AccountCreation } from './AccountCreation';

const JobSearchForm: React.FC<JobSearchFormProps> = ({ onComplete, onCancel }) => {
  const [formData, setFormData] = useState<JobSearchConfig>({
    keywords: '',
    location: '',
    jobType: 'full-time',
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
    enableAutoApplication: false,
    seleniumEnabled: true,
    confirmationEmail: '',
    trackApplications: true,
    manualPromptMethod: 'email',
    maxApplicationsPerDay: '5',
    companyBlacklist: '',
    preferredJobSites: ['linkedin', 'indeed']
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<JobInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [applicationProgress, setApplicationProgress] = useState<ApplicationProgress>({});
  const [directJobUrl, setDirectJobUrl] = useState('');
  const [isApplyingDirect, setIsApplyingDirect] = useState(false);
  const [directJobInfo, setDirectJobInfo] = useState<JobInfo | null>(null);
  const [accountCreationLogs, setAccountCreationLogs] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      localStorage.setItem('jobSearchConfig', JSON.stringify(formData));
      
      if (formData.enableAutoApplication) {
        await startAutomatedJobSearch(formData);
      }
      
      onComplete(formData);
    } catch (error) {
      console.error('Error saving job search configuration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startJobSearch = async () => {
    setIsSearching(true);
    try {
      // Use multiple job search sources
      const [remotiveJobs, googleJobs] = await Promise.allSettled([
        searchJobs(formData.keywords, formData.location),
        googleSearchService.searchJobs({
          query: formData.keywords,
          location: formData.location,
          jobSites: formData.preferredJobSites,
          experienceLevel: formData.experienceLevel,
          jobType: formData.jobType,
          maxResults: 10
        })
      ]);

      let allJobs: JobInfo[] = [];
      
      // Process Remotive results
      if (remotiveJobs.status === 'fulfilled') {
        allJobs = [...allJobs, ...remotiveJobs.value];
      }
      
      // Process Google search results and convert to JobInfo format
      if (googleJobs.status === 'fulfilled') {
        const convertedGoogleJobs: JobInfo[] = googleJobs.value.map(googleJob => ({
          id: googleJob.id,
          title: googleJob.title,
          company: googleJob.company,
          location: googleJob.location,
          hasForm: Math.random() > 0.5, // Random for now - would be determined by actual form detection
          url: googleJob.url,
          salary: googleJob.salary || 'Not specified',
          description: googleJob.description,
          tags: googleJob.extractedData.skills,
          jobType: googleJob.jobType || 'full-time',
          publicationDate: new Date().toISOString(),
          platform: googleJob.source
        }));
        allJobs = [...allJobs, ...convertedGoogleJobs];
      }
      
      // Remove duplicates based on URL
      const uniqueJobs = allJobs.filter((job, index, self) => 
        index === self.findIndex(j => j.url === job.url)
      );
      
      setSearchResults(uniqueJobs);
      console.log('Found jobs:', uniqueJobs);
    } catch (error) {
      console.error('Error searching for jobs:', error);
      // Fallback to basic search if advanced search fails
      try {
        const fallbackJobs = await searchJobs(formData.keywords, formData.location);
        setSearchResults(fallbackJobs);
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const processJobApplication = async (job: JobInfo) => {
    setApplicationProgress(prev => ({ ...prev, [job.id]: 'processing' }));
    
    try {
      // Use AI agent for intelligent application processing
      const result = await aiAgentService.applyToJob(job);
      
      if (result.success) {
        setApplicationProgress(prev => ({ ...prev, [job.id]: 'applied' }));
        setAccountCreationLogs(prev => [
          ...prev,
          `✅ Successfully applied to ${job.title} at ${job.company}`,
          `📧 Application ID: ${result.applicationId}`,
          ...(result.accountCreated ? ['🔐 Account created automatically'] : [])
        ]);
      } else {
        // Fallback to manual application if AI fails
        if (job.hasForm) {
          await fillJobFormWithSelenium(job);
          setApplicationProgress(prev => ({ ...prev, [job.id]: 'applied' }));
          await updateApplicationTracker(job, 'applied_automatically');
        } else {
          await promptManualApplication(job, formData.manualPromptMethod);
          setApplicationProgress(prev => ({ ...prev, [job.id]: 'manual_required' }));
          await updateApplicationTracker(job, 'manual_prompt_sent');
        }
      }
    } catch (error) {
      console.error(`Error processing application for ${job.title}:`, error);
      setApplicationProgress(prev => ({ ...prev, [job.id]: 'error' }));
      setAccountCreationLogs(prev => [
        ...prev,
        `❌ Failed to apply to ${job.title}: ${error instanceof Error ? error.message : 'Unknown error'}`
      ]);
    }
  };

  const applyToDirectJob = async () => {
    if (!directJobUrl.trim()) {
      alert('Please enter a valid job URL');
      return;
    }

    setIsApplyingDirect(true);
    setAccountCreationLogs([]);
    
    try {
      setAccountCreationLogs(['🔍 Parsing job information from URL...']);
      
      const jobInfo = await parseJobFromUrl(directJobUrl);
      setDirectJobInfo(jobInfo);
      
      setAccountCreationLogs(prev => [
        ...prev,
        `📋 Job parsed: ${jobInfo.title} at ${jobInfo.company}`,
        '🤖 Initializing AI agent...'
      ]);
      
      // Initialize AI agent
      await aiAgentService.initialize();
      
      setAccountCreationLogs(prev => [
        ...prev,
        '🚀 Starting automated application process...'
      ]);
      
      // Use AI agent for direct application
      const result = await aiAgentService.applyToJob(jobInfo);
      
      if (result.success) {
        setAccountCreationLogs(prev => [
          ...prev,
          `✅ Successfully applied to ${jobInfo.title}!`,
          `📧 Application ID: ${result.applicationId}`,
          ...(result.accountCreated ? ['🔐 Account created automatically'] : []),
          '📊 Application has been tracked in your dashboard'
        ]);
        
        // Update the direct job application progress
        setApplicationProgress(prev => ({ ...prev, [jobInfo.id]: 'applied' }));
      } else {
        setAccountCreationLogs(prev => [
          ...prev,
          `❌ Automated application failed: ${result.message}`,
          '🔄 You may need to apply manually'
        ]);
        
        setApplicationProgress(prev => ({ ...prev, [jobInfo.id]: 'manual_required' }));
      }
      
    } catch (error) {
      console.error('Direct application failed:', error);
      setAccountCreationLogs(prev => [
        ...prev,
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      ]);
      
      if (directJobInfo) {
        setApplicationProgress(prev => ({ ...prev, [directJobInfo.id]: 'error' }));
      }
    } finally {
      setIsApplyingDirect(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-5xl mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your AI-Powered Job Search</h3>
        <p className="text-gray-600">Configure your automated job search and application process</p>
      </div>
      
      {/* Direct Job Application Section */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h4 className="text-md font-semibold text-gray-900 mb-3">🎯 Apply to Specific Job</h4>
        <p className="text-sm text-gray-600 mb-4">
          Paste a job URL and let the AI agent automatically create an account and apply for you
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Job URL *
            </label>
            <input
              type="url"
              value={directJobUrl}
              onChange={(e) => setDirectJobUrl(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="https://www.brightermonday.co.ke/listings/full-stack-developer-20m52q"
            />
          </div>
          
          {directJobInfo && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-900">{directJobInfo.title}</h5>
              <p className="text-sm text-gray-600">{directJobInfo.company} • {directJobInfo.location}</p>
              <p className="text-sm text-gray-500">{directJobInfo.salary}</p>
              <p className="text-xs text-blue-600 mt-1">Platform: {directJobInfo.platform}</p>
            </div>
          )}
          
          <AccountCreation logs={accountCreationLogs} />
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={applyToDirectJob}
              disabled={isApplyingDirect || !directJobUrl.trim()}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isApplyingDirect ? 'Applying...' : '🤖 Auto Apply Now'}
            </button>
            {directJobUrl && (
              <button
                type="button"
                onClick={() => {
                  setDirectJobUrl('');
                  setDirectJobInfo(null);
                  setAccountCreationLogs([]);
                }}
                className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 my-6"></div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Criteria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Keywords *</label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="e.g., React, Frontend Developer"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="e.g., Remote, New York, San Francisco"
            />
          </div>
        </div>

        {/* Automation Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Automation Settings</label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.enableAutoApplication}
                onChange={(e) => setFormData({ ...formData, enableAutoApplication: e.target.checked })}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Enable Automatic Job Applications</span>
            </label>
            
            {formData.enableAutoApplication && (
              <div className="ml-7 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.seleniumEnabled}
                    onChange={(e) => setFormData({ ...formData, seleniumEnabled: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-700">Use Selenium for form filling</span>
                </label>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max applications per day</label>
                  <input
                    type="number"
                    value={formData.maxApplicationsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxApplicationsPerDay: e.target.value })}
                    className="w-20 p-2 border border-gray-300 rounded text-sm"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Search Results */}
        {searchResults.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Found Jobs ({searchResults.length})</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {searchResults.map(job => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{job.title}</h5>
                      <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                      <p className="text-sm text-gray-500">{job.salary}</p>
                      {job.platform && (
                        <p className="text-xs text-blue-600 mt-1">Source: {job.platform}</p>
                      )}
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        job.hasForm ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {job.hasForm ? '🤖 AI Apply' : '✋ Manual'}
                      </span>
                      {applicationProgress[job.id] && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          applicationProgress[job.id] === 'applied' ? 'bg-blue-100 text-blue-700' :
                          applicationProgress[job.id] === 'manual_required' ? 'bg-orange-100 text-orange-700' :
                          applicationProgress[job.id] === 'processing' ? 'bg-gray-100 text-gray-700 animate-pulse' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {applicationProgress[job.id] === 'applied' ? '✅ Applied' :
                           applicationProgress[job.id] === 'manual_required' ? '👤 Manual' :
                           applicationProgress[job.id] === 'processing' ? '⏳ Processing' :
                           '❌ Error'}
                        </span>
                      )}
                      <div className="flex space-x-2">
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          View Job
                        </a>
                        {!formData.enableAutoApplication && (
                          <button
                            onClick={() => processJobApplication(job)}
                            disabled={applicationProgress[job.id] === 'processing'}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {applicationProgress[job.id] === 'processing' ? 'Applying...' : '🤖 AI Apply'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-6 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          {!formData.enableAutoApplication && (
            <button
              type="button"
              onClick={startJobSearch}
              disabled={isSearching || !formData.keywords}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {isSearching ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                'Search Jobs'
              )}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.keywords}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Starting...
              </div>
            ) : (
              formData.enableAutoApplication ? 'Start Auto Search' : 'Save Configuration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobSearchForm;