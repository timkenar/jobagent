import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/api'; // Add this import

interface CVData {
  id: number;
  file_url: string;
  original_filename: string;
  file_size_formatted: string;
  file_type: string;
  skills: string[];
  experience_years: number | null;
  job_titles: string[];
  education: any[];
  languages: string[];
  certifications: string[];
  job_category: string;
  seniority_level: string;
  is_active: boolean;
  uploaded_at: string;
  analyzed_at: string | null;
}

const CVUploadSection: React.FC = () => {
  const [cv, setCV] = useState<CVData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cache keys
  const CV_CACHE_KEY = 'cv_data_cache';
  const CV_CACHE_TIMESTAMP_KEY = 'cv_cache_timestamp';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Helper function to get base URL
  const getBaseUrl = () => API_CONFIG.BASE_URL ;
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');
    return { Authorization: `Bearer ${token}` };
  };

  // Cache helper functions
  const getCachedCV = (): CVData | null => {
    try {
      const cachedData = localStorage.getItem(CV_CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CV_CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < CACHE_DURATION) {
          return JSON.parse(cachedData);
        } else {
          // Cache expired, clear it
          localStorage.removeItem(CV_CACHE_KEY);
          localStorage.removeItem(CV_CACHE_TIMESTAMP_KEY);
        }
      }
    } catch (error) {
      console.error('Error reading CV cache:', error);
    }
    return null;
  };

  const setCVCache = (cvData: CVData | null) => {
    try {
      if (cvData) {
        localStorage.setItem(CV_CACHE_KEY, JSON.stringify(cvData));
        localStorage.setItem(CV_CACHE_TIMESTAMP_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(CV_CACHE_KEY);
        localStorage.removeItem(CV_CACHE_TIMESTAMP_KEY);
      }
    } catch (error) {
      console.error('Error setting CV cache:', error);
    }
  };

  React.useEffect(() => {
    initializeCV();
  }, []);

  const initializeCV = async () => {
    setLoading(true);
    
    // Try to load from cache first
    const cachedCV = getCachedCV();
    if (cachedCV) {
      setCV(cachedCV);
      setLoading(false);
      
      // Fetch fresh data in background
      fetchActiveCV(true);
    } else {
      // No cache, fetch fresh data
      await fetchActiveCV();
    }
  };

  const fetchActiveCV = async (isBackgroundUpdate: boolean = false) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      if (!isBackgroundUpdate) {
        setLoading(true);
      }

      const baseUrl = API_CONFIG.BASE_URL ;
      const url = `${baseUrl}/api/cvs/active/`;
      
      console.log('Fetching active CV from URL:', url); // Debug log
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cvData = response.data;
      setCV(cvData);
      setCVCache(cvData); // Cache the fresh data
      
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error fetching CV:', err);
        if (!isBackgroundUpdate) {
          setError('Failed to fetch CV data.');
        }
      } else {
        // No CV found, clear cache
        setCVCache(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('file', file);

      const baseUrl = API_CONFIG.BASE_URL ;
      const url = `${baseUrl}/api/cvs/`;
      
      console.log('Uploading CV to URL:', url); // Debug log
      
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      const cvData = response.data;
      setCV(cvData);
      setCVCache(cvData); // Cache the new CV data
      setSuccessMessage('CV uploaded successfully! AI analysis is in progress...');
      setAnalyzing(true);

      // Poll for analysis completion
      setTimeout(() => {
        checkAnalysisStatus(response.data.id);
      }, 3000);

    } catch (err: any) {
      console.error('Error uploading CV:', err);
      setError(err.response?.data?.file?.[0] || 'Failed to upload CV. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const checkAnalysisStatus = async (cvId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !cvId) return;

      const baseUrl = API_CONFIG.BASE_URL ;
      const url = `${baseUrl}/api/cvs/${cvId}/`;
      
      console.log('Checking analysis status for URL:', url); // Debug log
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.analyzed_at) {
        const cvData = response.data;
        setCV(cvData);
        setCVCache(cvData); // Cache updated CV with analysis
        setAnalyzing(false);
        setAnalysisProgress(100);
        setSuccessMessage('CV analysis completed! ✨');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        // Continue polling and update progress
        setAnalysisProgress(prev => Math.min(prev + 10, 90)); // Increment progress
        setTimeout(() => checkAnalysisStatus(cvId), 3000);
      }
    } catch (err) {
      console.error('Error checking analysis status:', err);
      setAnalyzing(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const reanalyzeCV = async () => {
    if (!cv || !cv.id) return;

    setAnalyzing(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required to reanalyze CV.');
        setAnalyzing(false);
        return;
      }

      const baseUrl = API_CONFIG.BASE_URL ;
      const url = `${baseUrl}/api/cvs/${cv.id}/reanalyze/`;
      
      console.log('Reanalyzing CV with URL:', url); // Debug log
      
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMessage('CV reanalysis started. Please wait...');
      
      setTimeout(() => {
        checkAnalysisStatus(cv.id);
      }, 3000);
    } catch (err: any) {
      console.error('Error reanalyzing CV:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to reanalyze CV.';
      setError(errorMessage);
      setAnalyzing(false);
    }
  };

  const deleteCV = async () => {
    if (!cv || !cv.id || !confirm('Are you sure you want to delete this CV?')) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required to delete CV.');
        return;
      }

      const baseUrl = API_CONFIG.BASE_URL ;
      const url = `${baseUrl}/api/cvs/${cv.id}/`;
      
      console.log('Deleting CV with URL:', url); // Debug log
      
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCV(null);
      setCVCache(null); // Clear cache when CV is deleted
      setSuccessMessage('CV deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting CV:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete CV.';
      setError(errorMessage);
    }
  };

  // UPDATE operation - Update CV metadata
  const updateCVMetadata = async (updates: Partial<CVData>) => {
    if (!cv || !cv.id) return;

    try {
      const headers = getAuthHeaders();
      const url = `${getBaseUrl()}/api/cvs/${cv.id}/`;
      
      console.log('Updating CV metadata with URL:', url); // Debug log
      
      const response = await axios.patch(url, updates, { headers });
      
      setCV(response.data);
      setSuccessMessage('CV updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error updating CV:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update CV.';
      setError(errorMessage);
    }
  };

  // LIST operation - Get all user CVs
  const getAllCVs = async () => {
    try {
      const headers = getAuthHeaders();
      const url = `${getBaseUrl()}/api/cvs/`;
      
      console.log('Fetching all CVs from URL:', url); // Debug log
      
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (err: any) {
      console.error('Error fetching all CVs:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch CVs.';
      setError(errorMessage);
      return [];
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">CV Upload & Analysis</h3>
          <p className="text-gray-600 text-sm">Upload your CV for AI-powered job matching</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <div className="text-purple-700 font-medium">Loading your CV data...</div>
          </div>
          <div className="mt-3 bg-purple-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                 style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 font-medium">Uploading CV...</span>
            <span className="text-blue-600 text-sm">{uploadProgress}%</span>
          </div>
          <div className="bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                 style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Analysis Progress */}
      {analyzing && (
        <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animation-delay-200"></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animation-delay-400"></div>
              </div>
              <span className="text-emerald-700 font-medium">AI analyzing your CV...</span>
            </div>
            <span className="text-emerald-600 text-sm">{analysisProgress}%</span>
          </div>
          <div className="bg-emerald-200 rounded-full h-2">
            <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                 style={{ width: `${analysisProgress}%` }}></div>
          </div>
          <p className="text-emerald-600 text-xs mt-2">Extracting skills, experience, and job categories...</p>
        </div>
      )}

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!cv ? (
        /* Upload Area */
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {uploading ? 'Uploading CV...' : 'Upload Your CV'}
          </h4>
          
          <p className="text-gray-600 mb-4">
            Drag and drop your CV here, or click to browse
          </p>

          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center space-x-2 mx-auto"
          >
            {uploading && (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      ) : (
        /* CV Display */
        <div className="space-y-6">
          {/* CV File Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{cv.original_filename}</h4>
                  <p className="text-sm text-gray-500">
                    {cv.file_size_formatted} • {cv.file_type?.toUpperCase() || 'PDF'} • 
                    Uploaded {new Date(cv.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <a
                  href={cv.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Download CV"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </a>
                
                <button
                  onClick={reanalyzeCV}
                  disabled={analyzing}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                  title="Re-analyze CV"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <button
                  onClick={deleteCV}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete CV"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Status */}
          {analyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                  <p className="font-medium text-blue-900">AI Analysis in Progress</p>
                  <p className="text-sm text-blue-700">Extracting skills, experience, and generating insights...</p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {cv.analyzed_at && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">AI Analysis Results</h4>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{cv.skills.length}</div>
                  <div className="text-sm text-blue-600">Skills</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{cv.experience_years || 0}</div>
                  <div className="text-sm text-green-600">Years Exp.</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{cv.languages.length}</div>
                  <div className="text-sm text-purple-600">Languages</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{cv.job_titles.length}</div>
                  <div className="text-sm text-orange-600">Positions</div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Profile Summary</h5>
                  <div className="space-y-2 text-sm">
                    {cv.job_category && (
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <span className="ml-2 text-gray-600">{cv.job_category}</span>
                      </div>
                    )}
                    {cv.seniority_level && (
                      <div>
                        <span className="font-medium text-gray-700">Level:</span>
                        <span className="ml-2 text-gray-600 capitalize">{cv.seniority_level}</span>
                      </div>
                    )}
                    {/* To make changes in currency based on the counties */}
                    {(cv.salary_range_min || cv.salary_range_max) && (
                      <div>
                        <span className="font-medium text-gray-700">Expected Salary:</span>
                        <span className="ml-2 text-gray-600">
                          ${cv.salary_range_min?.toLocaleString() || '?'} - ${cv.salary_range_max?.toLocaleString() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Top Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {cv.skills.slice(0, 8).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {cv.skills.length > 8 && (
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                        +{cv.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload New Version */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={triggerFileInput}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload New Version</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CVUploadSection;