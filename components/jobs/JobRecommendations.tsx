import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [loading, setLoading] = useState(true);
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobMatches();
  }, []);

  const fetchJobMatches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('http://localhost:8000/api/job-matches/', {
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

      const response = await axios.post('http://localhost:8000/api/job-matches/find_matches/', {
        job_title: 'Software Engineer', // Default search - could be made configurable
        location: 'Remote'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchJobMatches(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error finding job matches:', err);
      setError(err.response?.data?.error || 'Failed to find job matches');
    } finally {
      setSearchingMatches(false);
    }
  };

  const updateMatchStatus = async (matchId: number, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await axios.patch(`http://localhost:8000/api/job-matches/${matchId}/`, {
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
            <p className="text-gray-600 text-sm">AI-powered matches based on your CV</p>
          </div>
        </div>
        
        <button
          onClick={findNewMatches}
          disabled={searchingMatches}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center space-x-2"
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Job Matches */}
      {jobMatches.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Job Matches Found</h4>
          <p className="text-gray-600 mb-4">Click "Find New Matches" to discover jobs that match your CV</p>
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
      )}
    </div>
  );
};

export default JobRecommendations;