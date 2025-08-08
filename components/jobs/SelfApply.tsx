import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { MultiSelect } from '../ui/multi-select';
import LoadingSpinner from '../shared/LoadingSpinner';
import { API_ENDPOINTS, apiCall } from '../../src/config/api';

interface Job {
  title: string;
  organization: string;
  location: string;
  url: string;
}

interface UserProfile {
  field: string;
  experience_level: string;
  specializations: string[];
  top_skills: string[];
}

interface SearchIntelligence {
  total_jobs_analyzed: number;
  matching_strategy: string;
  profile_based_filtering: boolean;
}

interface JobSearchResponse {
  jobs: Job[];
  summary: string;
  user_preferences: string;
  user_profile?: UserProfile;
  search_intelligence?: SearchIntelligence;
  filters_applied: {
    job_type: string;
    location: string;
    limit: number;
  };
}

interface SelfApplyFilters {
  countries: string[];
  job_categories: string[];
  locations: string[];
  job_titles: string[];
  experience_levels: string[];
  employment_types: string[];
  limit: number;
  search_term: string;
}

const SelfApply: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [userPreferences, setUserPreferences] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchIntelligence, setSearchIntelligence] = useState<SearchIntelligence | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<SelfApplyFilters>({
    countries: [],
    job_categories: [],
    locations: [],
    job_titles: [],
    experience_levels: [],
    employment_types: [],
    limit: 10,
    search_term: ''
  });

  // Country options (focusing on humanitarian/development regions)
  const countryOptions = [
    // East Africa
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Uganda', label: 'Uganda' },
    { value: 'Tanzania', label: 'Tanzania' },
    { value: 'Rwanda', label: 'Rwanda' },
    { value: 'Burundi', label: 'Burundi' },
    // Horn of Africa
    { value: 'Ethiopia', label: 'Ethiopia' },
    { value: 'Somalia', label: 'Somalia' },
    { value: 'South Sudan', label: 'South Sudan' },
    { value: 'Sudan', label: 'Sudan' },
    { value: 'Eritrea', label: 'Eritrea' },
    { value: 'Djibouti', label: 'Djibouti' },
    // Central Africa
    { value: 'Chad', label: 'Chad' },
    { value: 'Central African Republic', label: 'Central African Republic' },
    { value: 'Cameroon', label: 'Cameroon' },
    { value: 'Democratic Republic of the Congo', label: 'DR Congo' },
    { value: 'Republic of the Congo', label: 'Congo' },
    // West Africa
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'Mali', label: 'Mali' },
    { value: 'Niger', label: 'Niger' },
    { value: 'Burkina Faso', label: 'Burkina Faso' },
    { value: 'Senegal', label: 'Senegal' },
    { value: 'Guinea', label: 'Guinea' },
    { value: 'Sierra Leone', label: 'Sierra Leone' },
    { value: 'Liberia', label: 'Liberia' },
    { value: 'Côte d\'Ivoire', label: 'Côte d\'Ivoire' },
    { value: 'Ghana', label: 'Ghana' },
    // Middle East
    { value: 'Syria', label: 'Syria' },
    { value: 'Jordan', label: 'Jordan' },
    { value: 'Lebanon', label: 'Lebanon' },
    { value: 'Iraq', label: 'Iraq' },
    { value: 'Yemen', label: 'Yemen' },
    { value: 'Palestine', label: 'Palestine' },
    // Asia
    { value: 'Afghanistan', label: 'Afghanistan' },
    { value: 'Myanmar', label: 'Myanmar' },
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'Pakistan', label: 'Pakistan' },
    // Other regions
    { value: 'Haiti', label: 'Haiti' },
    { value: 'Venezuela', label: 'Venezuela' },
    { value: 'Ukraine', label: 'Ukraine' },
  ];

  // Job category options
  const jobCategoryOptions = [
    { value: 'program management', label: 'Program Management' },
    { value: 'project management', label: 'Project Management' },
    { value: 'coordination', label: 'Coordination' },
    { value: 'monitoring and evaluation', label: 'Monitoring & Evaluation' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'finance', label: 'Finance & Administration' },
    { value: 'human resources', label: 'Human Resources' },
    { value: 'protection', label: 'Protection' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'water sanitation', label: 'WASH' },
    { value: 'emergency response', label: 'Emergency Response' },
    { value: 'communications', label: 'Communications' },
    { value: 'information management', label: 'Information Management' },
    { value: 'security', label: 'Security' },
    { value: 'advocacy', label: 'Advocacy' },
    { value: 'research', label: 'Research' },
  ];

  // Job title/role options
  const jobTitleOptions = [
    { value: 'manager', label: 'Manager' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'officer', label: 'Officer' },
    { value: 'specialist', label: 'Specialist' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'director', label: 'Director' },
    { value: 'head', label: 'Head of' },
    { value: 'advisor', label: 'Advisor' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'analyst', label: 'Analyst' },
    { value: 'technical', label: 'Technical' },
    { value: 'field', label: 'Field' },
    { value: 'senior', label: 'Senior' },
    { value: 'junior', label: 'Junior' },
  ];

  // Experience level options
  const experienceLevelOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'junior', label: 'Junior (2-4 years)' },
    { value: 'mid', label: 'Mid Level (4-7 years)' },
    { value: 'senior', label: 'Senior (7+ years)' },
    { value: 'executive', label: 'Executive/Director' },
  ];

  // Employment type options
  const employmentTypeOptions = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'consultant', label: 'Consultancy' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote Work' },
  ];

  // Location options (cities/regions within countries)
  const locationOptions = [
    { value: 'nairobi', label: 'Nairobi' },
    { value: 'kampala', label: 'Kampala' },
    { value: 'addis ababa', label: 'Addis Ababa' },
    { value: 'dar es salaam', label: 'Dar es Salaam' },
    { value: 'khartoum', label: 'Khartoum' },
    { value: 'juba', label: 'Juba' },
    { value: 'mogadishu', label: 'Mogadishu' },
    { value: 'bangui', label: 'Bangui' },
    { value: 'ndjamena', label: 'N\'Djamena' },
    { value: 'abuja', label: 'Abuja' },
    { value: 'lagos', label: 'Lagos' },
    { value: 'dakar', label: 'Dakar' },
    { value: 'bamako', label: 'Bamako' },
    { value: 'ouagadougou', label: 'Ouagadougou' },
    { value: 'amman', label: 'Amman' },
    { value: 'beirut', label: 'Beirut' },
    { value: 'damascus', label: 'Damascus' },
    { value: 'baghdad', label: 'Baghdad' },
    { value: 'kabul', label: 'Kabul' },
    { value: 'dhaka', label: 'Dhaka' },
    { value: 'yangon', label: 'Yangon' },
    { value: 'field', label: 'Field Location' },
    { value: 'multiple', label: 'Multiple Locations' },
  ];

  // Limit options
  const limitOptions = [
    { value: '5', label: '5 jobs' },
    { value: '10', label: '10 jobs' },
    { value: '20', label: '20 jobs' },
    { value: '50', label: '50 jobs' },
    { value: '100', label: '100 jobs' },
  ];

  // Load applied jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appliedJobs');
    if (saved) {
      setAppliedJobs(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save applied jobs to localStorage
  const saveAppliedJobs = (newAppliedJobs: Set<string>) => {
    localStorage.setItem('appliedJobs', JSON.stringify(Array.from(newAppliedJobs)));
  };

  // Search for jobs
  const searchJobs = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters for backend API
      // Use first selected country for backend filtering, or 'all' if none selected
      const selectedCountry = filters.countries.length > 0 ? filters.countries[0] : 'all';
      const params = new URLSearchParams({
        job_type: selectedCountry,
        location: selectedCountry,
        limit: filters.limit.toString(),
      });

      const response: JobSearchResponse = await apiCall(
        `${API_ENDPOINTS.JOBS.SCRAPER}?${params.toString()}`,
        {
          method: 'GET',
        }
      );

      let filteredJobs = response.jobs || [];
      
      // Apply frontend filtering for multiple selections
      filteredJobs = filteredJobs.filter(job => {
        const jobTitle = job.title.toLowerCase();
        const jobOrg = job.organization.toLowerCase();
        const jobLocation = job.location.toLowerCase();
        
        // Country filter - match any selected country
        if (filters.countries.length > 0) {
          const countryMatch = filters.countries.some(country => 
            jobLocation.includes(country.toLowerCase())
          );
          if (!countryMatch) return false;
        }
        
        // Job category filter - match any selected category
        if (filters.job_categories.length > 0) {
          const categoryMatch = filters.job_categories.some(category => 
            jobTitle.includes(category.toLowerCase()) || 
            jobOrg.includes(category.toLowerCase())
          );
          if (!categoryMatch) return false;
        }
        
        // Job title filter - match any selected title
        if (filters.job_titles.length > 0) {
          const titleMatch = filters.job_titles.some(title => 
            jobTitle.includes(title.toLowerCase())
          );
          if (!titleMatch) return false;
        }
        
        // Experience level filter - match any selected level
        if (filters.experience_levels.length > 0) {
          const experienceMatch = filters.experience_levels.some(level => {
            switch (level) {
              case 'entry':
                return jobTitle.includes('entry') || jobTitle.includes('junior') || 
                       jobTitle.includes('assistant') || jobTitle.includes('intern');
              case 'junior':
                return jobTitle.includes('junior') || jobTitle.includes('assistant') ||
                       jobTitle.includes('associate');
              case 'mid':
                return jobTitle.includes('officer') || jobTitle.includes('specialist') ||
                       jobTitle.includes('coordinator') || (!jobTitle.includes('senior') && 
                       !jobTitle.includes('head') && !jobTitle.includes('director'));
              case 'senior':
                return jobTitle.includes('senior') || jobTitle.includes('lead') ||
                       jobTitle.includes('principal') || jobTitle.includes('manager');
              case 'executive':
                return jobTitle.includes('director') || jobTitle.includes('head') ||
                       jobTitle.includes('chief') || jobTitle.includes('executive');
              default:
                return false;
            }
          });
          if (!experienceMatch) return false;
        }
        
        // Employment type filter - match any selected type
        if (filters.employment_types.length > 0) {
          const employmentMatch = filters.employment_types.some(type => {
            switch (type) {
              case 'remote':
                return jobTitle.includes('remote') || jobLocation.includes('remote');
              case 'contract':
                return jobTitle.includes('contract') || jobTitle.includes('temporary');
              case 'consultant':
                return jobTitle.includes('consultant') || jobTitle.includes('consultancy');
              case 'volunteer':
                return jobTitle.includes('volunteer') || jobTitle.includes('unpaid');
              case 'internship':
                return jobTitle.includes('intern') || jobTitle.includes('trainee');
              default:
                return true; // For full-time, part-time, etc.
            }
          });
          if (!employmentMatch) return false;
        }
        
        // Location filter - match any selected location
        if (filters.locations.length > 0) {
          const locationMatch = filters.locations.some(location => 
            jobLocation.includes(location.toLowerCase())
          );
          if (!locationMatch) return false;
        }
        
        // Search term filter
        if (filters.search_term.trim()) {
          const searchTerm = filters.search_term.toLowerCase().trim();
          const searchMatch = jobTitle.includes(searchTerm) ||
                            jobOrg.includes(searchTerm) ||
                            jobLocation.includes(searchTerm);
          if (!searchMatch) return false;
        }
        
        return true;
      });

      setJobs(filteredJobs);
      setSummary(response.summary || '');
      setUserPreferences(response.user_preferences || '');
      setUserProfile(response.user_profile || null);
      setSearchIntelligence(response.search_intelligence || null);
      
      if (filteredJobs.length === 0) {
        setError('No jobs found matching your criteria. Try adjusting your filters.');
      }
    } catch (err) {
      console.error('Error searching jobs:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to search for jobs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes for arrays
  const handleFilterChange = (key: keyof SelfApplyFilters, value: string[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle single value changes (limit, search_term)
  const handleSingleValueChange = (key: 'limit' | 'search_term', value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Mark job as applied
  const markAsApplied = (jobUrl: string) => {
    const newAppliedJobs = new Set(appliedJobs);
    newAppliedJobs.add(jobUrl);
    setAppliedJobs(newAppliedJobs);
    saveAppliedJobs(newAppliedJobs);
  };

  // Open job application link
  const openJobLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    markAsApplied(url);
  };

  // Initial search on component mount
  useEffect(() => {
    searchJobs();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Self Apply
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Browse and apply to humanitarian job opportunities from ReliefWeb
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {jobs.length} jobs found
        </Badge>
      </div>

      {/* Enhanced User Profile Info */}
      {(userProfile || userPreferences) && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  🤖 Agentic Job Search Profile
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  AI-powered job matching based on your CV and professional background
                </p>
              </div>
              {searchIntelligence && (
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-900 dark:text-indigo-200">
                    Smart Match
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Profile Details */}
            {userProfile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field & Experience */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8m0 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Field: {userProfile.field.charAt(0).toUpperCase() + userProfile.field.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Level: {userProfile.experience_level.charAt(0).toUpperCase() + userProfile.experience_level.slice(1)}
                    </span>
                  </div>
                </div>
                
                {/* Specializations */}
                <div className="space-y-2">
                  {userProfile.specializations.length > 0 && (
                    <>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">Specializations:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {userProfile.specializations.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900 dark:text-emerald-200">
                            {spec.charAt(0).toUpperCase() + spec.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Top Skills */}
            {userProfile && userProfile.top_skills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-200">Key Skills & Keywords:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {userProfile.top_skills.slice(0, 8).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900 dark:text-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search Intelligence Info */}
            {searchIntelligence && (
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-600">
                <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-300">
                  <span>🔍 Multi-strategy search analyzed {searchIntelligence.total_jobs_analyzed} opportunities</span>
                  <span>✨ Profile-based relevance ranking active</span>
                </div>
              </div>
            )}
            
            {/* Fallback to basic preferences */}
            {!userProfile && userPreferences && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-200">Search Keywords:</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {userPreferences.split(',').slice(0, 5).join(', ')}
                  {userPreferences.split(',').length > 5 && '...'}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Search Filters
        </h2>
        
        <div className="space-y-6">
          {/* Row 1: Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Countries Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Countries
              </label>
              <MultiSelect
                options={countryOptions}
                values={filters.countries}
                onChange={(values) => handleFilterChange('countries', values)}
                placeholder="Select countries..."
                searchPlaceholder="Search countries..."
                className="w-full"
              />
            </div>

            {/* Job Categories Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Job Categories
              </label>
              <MultiSelect
                options={jobCategoryOptions}
                values={filters.job_categories}
                onChange={(values) => handleFilterChange('job_categories', values)}
                placeholder="Select job categories..."
                searchPlaceholder="Search categories..."
                className="w-full"
              />
            </div>

            {/* Job Titles Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8m0 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Job Titles
              </label>
              <MultiSelect
                options={jobTitleOptions}
                values={filters.job_titles}
                onChange={(values) => handleFilterChange('job_titles', values)}
                placeholder="Select job titles..."
                searchPlaceholder="Search titles..."
                className="w-full"
              />
            </div>
          </div>

          {/* Row 2: Secondary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Locations Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
                Cities/Regions
              </label>
              <MultiSelect
                options={locationOptions}
                values={filters.locations}
                onChange={(values) => handleFilterChange('locations', values)}
                placeholder="Select cities..."
                searchPlaceholder="Search cities..."
                className="w-full"
              />
            </div>

            {/* Experience Levels Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Experience Levels
              </label>
              <MultiSelect
                options={experienceLevelOptions}
                values={filters.experience_levels}
                onChange={(values) => handleFilterChange('experience_levels', values)}
                placeholder="Select experience levels..."
                searchPlaceholder="Search levels..."
                className="w-full"
              />
            </div>

            {/* Employment Types Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Employment Types
              </label>
              <MultiSelect
                options={employmentTypeOptions}
                values={filters.employment_types}
                onChange={(values) => handleFilterChange('employment_types', values)}
                placeholder="Select employment types..."
                searchPlaceholder="Search types..."
                className="w-full"
              />
            </div>

            {/* Results Limit Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Results Limit
              </label>
              <Select
                value={filters.limit.toString()}
                onChange={(e) => handleSingleValueChange('limit', parseInt(e.target.value))}
                className="w-full"
              >
                {limitOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Row 3: Search Term */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Keywords (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., Program Manager, UNICEF, Emergency Response..."
                value={filters.search_term}
                onChange={(e) => handleSingleValueChange('search_term', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={searchJobs}
            disabled={loading}
            className="flex-1 sm:flex-none sm:w-auto"
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Searching Jobs...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Jobs
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => {
              setFilters({
                countries: [],
                job_categories: [],
                locations: [],
                job_titles: [],
                experience_levels: [],
                employment_types: [],
                limit: 10,
                search_term: ''
              });
            }}
            variant="outline"
            disabled={loading}
            className="flex-1 sm:flex-none sm:w-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Active Filters Display */}
      {(filters.countries.length > 0 || 
        filters.job_categories.length > 0 || 
        filters.locations.length > 0 || 
        filters.job_titles.length > 0 || 
        filters.experience_levels.length > 0 || 
        filters.employment_types.length > 0 || 
        filters.search_term.trim() !== '') && (
        <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 mr-3">
              Active Filters:
            </h3>
            {filters.countries.length > 0 && (
              <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 dark:bg-purple-800 dark:text-purple-200">
                Countries: {filters.countries.length === 1 
                  ? countryOptions.find(opt => opt.value === filters.countries[0])?.label
                  : `${filters.countries.length} selected`}
              </Badge>
            )}
            {filters.job_categories.length > 0 && (
              <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 dark:bg-purple-800 dark:text-purple-200">
                Categories: {filters.job_categories.length === 1 
                  ? jobCategoryOptions.find(opt => opt.value === filters.job_categories[0])?.label
                  : `${filters.job_categories.length} selected`}
              </Badge>
            )}
            {filters.job_titles.length > 0 && (
              <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 dark:bg-purple-800 dark:text-purple-200">
                Titles: {filters.job_titles.length === 1 
                  ? jobTitleOptions.find(opt => opt.value === filters.job_titles[0])?.label
                  : `${filters.job_titles.length} selected`}
              </Badge>
            )}
            {filters.locations.length > 0 && (
              <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 dark:bg-purple-800 dark:text-purple-200">
                Cities: {filters.locations.length === 1 
                  ? locationOptions.find(opt => opt.value === filters.locations[0])?.label
                  : `${filters.locations.length} selected`}
              </Badge>
            )}
            {filters.experience_levels.length > 0 && (
              <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 dark:bg-purple-800 dark:text-purple-200">
                Experience: {filters.experience_levels.length === 1 
                  ? experienceLevelOptions.find(opt => opt.value === filters.experience_levels[0])?.label
                  : `${filters.experience_levels.length} levels`}
              </Badge>
            )}
            {filters.employment_types.length > 0 && (
              <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 dark:bg-purple-800 dark:text-purple-200">
                Types: {filters.employment_types.length === 1 
                  ? employmentTypeOptions.find(opt => opt.value === filters.employment_types[0])?.label
                  : `${filters.employment_types.length} selected`}
              </Badge>
            )}
            {filters.search_term.trim() !== '' && (
              <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 dark:bg-purple-800 dark:text-purple-200">
                Search: "{filters.search_term}"
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Summary */}
      {summary && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                Search Results Summary
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
                Search Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner className="w-8 h-8" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Searching for jobs...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => {
            const isApplied = appliedJobs.has(job.url);
            
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="space-y-4">
                  {/* Job Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {job.organization}
                    </p>
                  </div>

                  {/* Location and Job Type Detection */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                    
                    {/* Show detected job characteristics */}
                    <div className="flex flex-wrap gap-1">
                      {/* Remote indicator */}
                      {(job.title.toLowerCase().includes('remote') || job.location.toLowerCase().includes('remote')) && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900 dark:text-blue-200">
                          Remote
                        </Badge>
                      )}
                      
                      {/* Contract indicator */}
                      {(job.title.toLowerCase().includes('contract') || job.title.toLowerCase().includes('consultant')) && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900 dark:text-orange-200">
                          Contract
                        </Badge>
                      )}
                      
                      {/* Senior level indicator */}
                      {(job.title.toLowerCase().includes('senior') || job.title.toLowerCase().includes('director') || job.title.toLowerCase().includes('head')) && (
                        <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900 dark:text-purple-200">
                          Senior
                        </Badge>
                      )}
                      
                      {/* Emergency indicator */}
                      {(job.title.toLowerCase().includes('emergency') || job.title.toLowerCase().includes('crisis')) && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50 dark:bg-red-900 dark:text-red-200">
                          Emergency
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Application Status */}
                  {isApplied && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      Applied
                    </Badge>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3 pt-2">
                    <Button
                      onClick={() => openJobLink(job.url)}
                      className="flex-1"
                      variant={isApplied ? "outline" : "default"}
                    >
                      {isApplied ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          View Application
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M10 6V4a2 2 0 112 2v2m-2 0h4" />
                          </svg>
                          Apply Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Jobs Found */}
      {!loading && jobs.length === 0 && !error && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No jobs found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Try adjusting your search filters or search terms.
              </p>
            </div>
            <Button onClick={searchJobs} variant="outline">
              Search Again
            </Button>
          </div>
        </Card>
      )}

      {/* Applied Jobs Counter */}
      {appliedJobs.size > 0 && (
        <Card className="p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Applications Tracked
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You've applied to {appliedJobs.size} job(s) through this platform
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAppliedJobs(new Set());
                saveAppliedJobs(new Set());
              }}
            >
              Clear History
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SelfApply;