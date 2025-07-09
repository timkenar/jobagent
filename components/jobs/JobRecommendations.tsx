import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/api';
import { googleSearchService, JobSearchParams, ProcessedJobResult } from '../../src/services/googleSearchService';

interface JobMatch {
  id: number;
  job_title: string;
  company_name: string;
  job_description: string;
  job_url: string;
  location: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  match_reasons: string[];
  status: 'pending' | 'interested' | 'applied' | 'not_interested';
  created_at: string;
}

const JobRecommendations: React.FC = () => {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [googleJobs, setGoogleJobs] = useState<ProcessedJobResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [searchingGoogle, setSearchingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [cvStatus, setCvStatus] = useState<{hasActiveCV: boolean, cvInfo?: any}>({hasActiveCV: false});
  const [activeTab, setActiveTab] = useState<'backend' | 'google'>('backend');
  const [googleSearchParams, setGoogleSearchParams] = useState<JobSearchParams>({
    query: '',
    location: '',
    jobSites: ['linkedin', 'indeed', 'glassdoor', 'brightermonday'],
    maxResults: 10
  });

  useEffect(() => {
    fetchJobMatches();
    checkCVStatus();
  }, []);

  const checkCVStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/cvs/active/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCvStatus({
        hasActiveCV: true,
        cvInfo: response.data
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCvStatus({hasActiveCV: false});
      }
    }
  };

  const fetchJobMatches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/job-matches/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJobMatches(response.data.results || response.data);
    } catch (err: any) {
      console.error('Error fetching job matches:', err);
      setError('Failed to load job recommendations');
    } finally {
      setLoading(false);
    }
  };

  const findNewMatches = async () => {
    setSearchingMatches(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Call the backend API to find matches based on user's CV
      // No need to specify job_title or location - the backend will use CV data
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/job-matches/find_matches/`, {
        // Backend will automatically use CV data to determine job search parameters
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchJobMatches(); // Refresh the list
        // Show success message with search details
        if (response.data.search_query) {
          console.log(`Searched for: ${response.data.search_query}`);
        }
      }
    } catch (err: any) {
      console.error('Error finding job matches:', err);
      setError(err.response?.data?.error || err.response?.data?.details || 'Failed to find job matches');
    } finally {
      setSearchingMatches(false);
    }
  };

  const updateMatchStatus = async (matchId: number, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await axios.patch(`${API_CONFIG.BASE_URL}/api/job-matches/${matchId}/`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setJobMatches(matches => 
        matches.map(match => 
          match.id === matchId ? { ...match, status: status as any } : match
        )
      );
    } catch (err) {
      console.error('Error updating match status:', err);
    }
  };

  const searchGoogleJobs = async () => {
    if (!googleSearchParams.query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setSearchingGoogle(true);
    setError('');

    try {
      console.log('Searching Google for jobs with params:', googleSearchParams);
      
      const results = await googleSearchService.searchJobs(googleSearchParams);
      
      console.log('Google search results:', results);
      setGoogleJobs(results);
      
      if (results.length === 0) {
        setError('No jobs found for your search criteria. Try different keywords or expand your search.');
      }
    } catch (err: any) {
      console.error('Error searching Google jobs:', err);
      setError(err.message || 'Failed to search Google jobs. Please check your API configuration.');
    } finally {
      setSearchingGoogle(false);
    }
  };

  const initializeGoogleSearch = () => {
    if (cvStatus.hasActiveCV && cvStatus.cvInfo) {
      // Auto-populate search from CV data
      setGoogleSearchParams(prev => ({
        ...prev,
        query: cvStatus.cvInfo.job_category || cvStatus.cvInfo.skills?.join(' ') || '',
        location: cvStatus.cvInfo.location || 'Remote'
      }));
    }
  };

  // Initialize Google search when CV is available
  useEffect(() => {
    if (cvStatus.hasActiveCV && activeTab === 'google') {
      initializeGoogleSearch();
    }
  }, [cvStatus.hasActiveCV, activeTab]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interested': return 'bg-blue-100 text-blue-800';
      case 'applied': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Job Recommendations</h3>
            <p className="text-gray-600 text-sm">
              AI-powered job search using your CV data and Google search
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('backend')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backend'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Backend Matches
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'google'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Google Search
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'backend' && (
        <div className="mb-4">
          <button
            onClick={findNewMatches}
            disabled={searchingMatches || !cvStatus.hasActiveCV}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center space-x-2"
            title={!cvStatus.hasActiveCV ? 'Please upload a CV first' : 'Search for jobs based on your CV'}
          >
            {searchingMatches && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{searchingMatches ? 'Finding...' : 'Find New Matches'}</span>
          </button>
        </div>
      )}

      {activeTab === 'google' && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title / Keywords *
              </label>
              <input
                type="text"
                value={googleSearchParams.query}
                onChange={(e) => setGoogleSearchParams(prev => ({ ...prev, query: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Software Engineer, Data Scientist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={googleSearchParams.location}
                onChange={(e) => setGoogleSearchParams(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Remote, New York, Kenya"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Sites
            </label>
            <div className="flex flex-wrap gap-2">
              {['linkedin', 'indeed', 'glassdoor', 'monster', 'dice', 'brightermonday', 'fuzu'].map(site => (
                <label key={site} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={googleSearchParams.jobSites?.includes(site)}
                    onChange={(e) => {
                      const sites = googleSearchParams.jobSites || [];
                      if (e.target.checked) {
                        setGoogleSearchParams(prev => ({ ...prev, jobSites: [...sites, site] }));
                      } else {
                        setGoogleSearchParams(prev => ({ ...prev, jobSites: sites.filter(s => s !== site) }));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">{site}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={searchGoogleJobs}
            disabled={searchingGoogle || !googleSearchParams.query.trim()}
            className="bg-gradient-to-r from-red-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center space-x-2"
          >
            {searchingGoogle && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{searchingGoogle ? 'Searching Google...' : 'Search Google Jobs'}</span>
          </button>
        </div>
      )}

      {/* CV Status Warning */}
      {!cvStatus.hasActiveCV && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            No active CV found. Please upload your CV first to get personalized job recommendations.
          </div>
        </div>
      )}

      {/* CV Info */}
      {cvStatus.hasActiveCV && cvStatus.cvInfo && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              Using CV: <strong>{cvStatus.cvInfo.original_filename}</strong> 
              {cvStatus.cvInfo.job_category && (
                <span className="ml-2 text-sm">({cvStatus.cvInfo.job_category})</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Job Results */}
      {activeTab === 'backend' && (
        jobMatches.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Backend Job Matches Found</h4>
            <p className="text-gray-600 mb-4">
              Click "Find New Matches" to automatically search for jobs based on your CV.
              The system will use your skills, experience, and preferences to find relevant opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobMatches.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">{match.job_title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(match.match_score)}`}>
                        {match.match_score.toFixed(0)}% match
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                        {match.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">{match.company_name}</p>
                    {match.location && (
                      <p className="text-gray-500 text-sm mb-2">{match.location}</p>
                    )}
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{match.job_description}</p>
                  </div>
                </div>

                {/* Skills and Match Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {match.matched_skills.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Matched Skills</h5>
                      <div className="flex flex-wrap gap-1">
                        {match.matched_skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {match.matched_skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{match.matched_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {match.match_reasons.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Match Reasons</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {match.match_reasons.slice(0, 3).map((reason, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {match.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateMatchStatus(match.id, 'interested')}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          Interested
                        </button>
                        <button
                          onClick={() => updateMatchStatus(match.id, 'not_interested')}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                        >
                          Not Interested
                        </button>
                      </>
                    )}
                    {match.status === 'interested' && (
                      <button
                        onClick={() => updateMatchStatus(match.id, 'applied')}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                      >
                        Mark as Applied
                      </button>
                    )}
                  </div>
                  
                  <a
                    href={match.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                  >
                    View Job →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Google Jobs Results */}
      {activeTab === 'google' && (
        googleJobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Google Jobs Found</h4>
            <p className="text-gray-600 mb-4">
              Enter your search criteria above and click "Search Google Jobs" to find opportunities from across the web.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {googleJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">{job.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(job.matchScore)}`}>
                        {job.matchScore.toFixed(0)}% match
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        {job.source}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">{job.company}</p>
                    <p className="text-gray-500 text-sm mb-2">{job.location}</p>
                    {job.salary && (
                      <p className="text-green-600 text-sm font-medium mb-2">{job.salary}</p>
                    )}
                    {job.jobType && (
                      <p className="text-blue-600 text-sm mb-2 capitalize">{job.jobType}</p>
                    )}
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{job.description}</p>
                  </div>
                </div>

                {/* Skills and Extracted Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {job.extractedData.skills.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Technical Skills</h5>
                      <div className="flex flex-wrap gap-1">
                        {job.extractedData.skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {job.extractedData.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{job.extractedData.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {job.extractedData.requirements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Requirements</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {job.extractedData.requirements.slice(0, 3).map((req, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-3 h-3 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Open job URL
                        window.open(job.url, '_blank');
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => {
                        // Save job for later (could implement local storage or backend save)
                        console.log('Saving job:', job.id);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      Save Job
                    </button>
                  </div>
                  
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                  >
                    View Job →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default JobRecommendations;