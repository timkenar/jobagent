import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../src/config/api'; // Add this import
import LogoSpinner from '../ui/logospinner';
import { 
  TrashIcon, 
  ArrowDownTrayIcon, 
  ArrowPathIcon, 
  PlusIcon,
  EyeIcon,
  StarIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ThemeToggle from '../shared/ThemeToggle';


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
  const [cvs, setCvs] = useState<CVData[]>([]);
  const [activeCV, setActiveCV] = useState<CVData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<CVData | null>(null);
  const [viewMode, setViewMode] = useState<'upload' | 'list'>('list');
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
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('cvSectionDarkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  const initializeCV = async () => {
    setLoading(true);
    
    // Try to load from cache first
    const cachedCV = getCachedCV();
    if (cachedCV) {
      setActiveCV(cachedCV);
      setLoading(false);
      
      // Fetch fresh data in background
      await fetchAllCVs(true);
    } else {
      // No cache, fetch fresh data
      await fetchAllCVs();
    }
  };

  // Fetch all CVs
  const fetchAllCVs = async (isBackgroundUpdate: boolean = false) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      if (!isBackgroundUpdate) {
        setLoading(true);
      }

      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/api/cvs/`;
      
      console.log('Fetching all CVs from URL:', url);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cvsData = response.data.results || response.data;
      setCvs(Array.isArray(cvsData) ? cvsData : []);
      
      // Find and set active CV
      const active = cvsData.find((cv: CVData) => cv.is_active);
      if (active) {
        setActiveCV(active);
        setCVCache(active);
      }
      
    } catch (err: any) {
      console.error('Error fetching CVs:', err);
      if (!isBackgroundUpdate) {
        setError('Failed to fetch CV data.');
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
      setCvs(prev => [cvData, ...prev]);
      setActiveCV(cvData);
      setCVCache(cvData); // Cache the new CV data
      setSuccessMessage('CV uploaded successfully! AI analysis is in progress...');
      setAnalyzing(cvData.id);
      setViewMode('list');

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
        setCvs(prev => prev.map(cv => cv.id === cvId ? cvData : cv));
        if (activeCV?.id === cvId) {
          setActiveCV(cvData);
          setCVCache(cvData);
        }
        setAnalyzing(null);
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
      setAnalyzing(null);
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

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('cvSectionDarkMode', JSON.stringify(newDarkMode));
  };

  // Set CV as active
  const setAsActiveCV = async (cv: CVData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required to set active CV.');
        return;
      }

      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/api/cvs/${cv.id}/set-active/`;
      
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setCvs(prev => prev.map(c => ({
        ...c,
        is_active: c.id === cv.id
      })));
      setActiveCV(cv);
      setCVCache(cv);
      setSuccessMessage(`"${cv.original_filename}" is now your active CV.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error setting active CV:', err);
      setError('Failed to set CV as active.');
    }
  };

  // Delete CV
  const confirmDeleteCV = (cv: CVData) => {
    setCvToDelete(cv);
    setDeleteModalOpen(true);
  };

  const deleteCV = async () => {
    if (!cvToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required to delete CV.');
        return;
      }

      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/api/cvs/${cvToDelete.id}/`;
      
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setCvs(prev => prev.filter(cv => cv.id !== cvToDelete.id));
      
      if (activeCV?.id === cvToDelete.id) {
        setActiveCV(null);
        setCVCache(null);
      }

      setSuccessMessage('CV deleted successfully.');
      setDeleteModalOpen(false);
      setCvToDelete(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting CV:', err);
      setError('Failed to delete CV.');
    }
  };

  // Download CV
  const downloadCV = (cv: CVData) => {
    window.open(cv.file_url, '_blank');
  };

  // Reanalyze CV
  const reanalyzeCV = async (cv: CVData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required to reanalyze CV.');
        return;
      }

      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/api/cvs/${cv.id}/reanalyze/`;
      
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAnalyzing(cv.id);
      setSuccessMessage('CV reanalysis started. Please wait...');
      
      setTimeout(() => {
        checkAnalysisStatus(cv.id);
      }, 3000);
    } catch (err: any) {
      console.error('Error reanalyzing CV:', err);
      setError('Failed to reanalyze CV.');
    }
  };



  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 transition-colors duration-300`}>
      {/* Header */}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CV Upload & Management</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Upload and manage your CVs for AI-powered job matching</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('upload')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'upload'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Upload
            </button>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          
          {/* Add CV Button */}
          {viewMode === 'list' && (
            <button
              onClick={() => setViewMode('upload')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition-opacity"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add CV
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-center space-x-3">
            <LogoSpinner size={32} />
            <div className="text-purple-700 dark:text-purple-300 font-medium">Loading your CV data...</div>
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
        <div className={`mb-4 p-3 rounded-lg border ${
          darkMode 
            ? 'bg-green-900/20 border-green-700 text-green-300' 
            : 'bg-green-100 border-green-300 text-green-700'
        }`}>
          {successMessage}
        </div>
      )}

      {error && (
        <div className={`mb-4 p-3 rounded-lg border ${
          darkMode 
            ? 'bg-red-900/20 border-red-700 text-red-300' 
            : 'bg-red-100 border-red-300 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'upload' ? (
        /* Upload Area */
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? darkMode 
                ? 'border-purple-400 bg-purple-900/20' 
                : 'border-purple-500 bg-purple-50'
              : darkMode
                ? 'border-gray-600 hover:border-purple-400 hover:bg-gray-800/50'
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

          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {uploading ? 'Uploading CV...' : 'Upload Your CV'}
          </h4>
          
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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

          <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      ) : (
        /* CV List View */
        <div className="space-y-4">
          {cvs.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <svg className={`mx-auto h-12 w-12 mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No CVs uploaded</h3>
              <p className="mb-4">Get started by uploading your first CV.</p>
              <button
                onClick={() => setViewMode('upload')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Upload CV
              </button>
            </div>
          ) : (
            cvs.map((cv) => (
              <div
                key={cv.id}
                className={`rounded-lg p-4 border transition-all ${
                  cv.is_active
                    ? darkMode
                      ? 'bg-purple-900/20 border-purple-700'
                      : 'bg-purple-50 border-purple-200'
                    : darkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <svg className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cv.original_filename}
                        </h4>
                        {cv.is_active && (
                          <StarIconSolid className="w-5 h-5 text-yellow-400" title="Active CV" />
                        )}
                        {analyzing === cv.id && (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-xs text-blue-600">Analyzing...</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center space-x-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>{cv.file_size_formatted || formatFileSize(0)}</span>
                        <span>{cv.file_type?.toUpperCase()}</span>
                        <span>Uploaded {formatDate(cv.uploaded_at)}</span>
                        {cv.analyzed_at && (
                          <span className="text-green-600">✓ Analyzed</span>
                        )}
                      </div>
                      
                      {cv.analyzed_at && cv.skills && cv.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {cv.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                darkMode 
                                  ? 'bg-blue-900/30 text-blue-300' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {cv.skills.length > 5 && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              darkMode 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              +{cv.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!cv.is_active && (
                      <button
                        onClick={() => setAsActiveCV(cv)}
                        className={`p-2 rounded transition-colors ${
                          darkMode 
                            ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700' 
                            : 'text-gray-400 hover:text-yellow-600 hover:bg-white'
                        }`}
                        title="Set as Active CV"
                      >
                        <StarIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => downloadCV(cv)}
                      className={`p-2 rounded transition-colors ${
                        darkMode 
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                          : 'text-gray-400 hover:text-blue-600 hover:bg-white'
                      }`}
                      title="Download CV"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => window.open(cv.file_url, '_blank')}
                      className={`p-2 rounded transition-colors ${
                        darkMode 
                          ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700' 
                          : 'text-gray-400 hover:text-green-600 hover:bg-white'
                      }`}
                      title="View CV"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    
                    {cv.analyzed_at && (
                      <button
                        onClick={() => reanalyzeCV(cv)}
                        disabled={analyzing === cv.id}
                        className={`p-2 rounded transition-colors disabled:opacity-50 ${
                          darkMode 
                            ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700' 
                            : 'text-gray-400 hover:text-purple-600 hover:bg-white'
                        }`}
                        title="Re-analyze CV"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => confirmDeleteCV(cv)}
                      className={`p-2 rounded transition-colors ${
                        darkMode 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                          : 'text-gray-400 hover:text-red-600 hover:bg-white'
                      }`}
                      title="Delete CV"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && cvToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Delete CV
                  </h3>
                  <div className="mt-2">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Are you sure you want to delete "{cvToDelete.original_filename}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={deleteCV}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setCvToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVUploadSection;