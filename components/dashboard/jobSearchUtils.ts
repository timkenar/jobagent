import axios from 'axios';
import { API_CONFIG } from '../../src/config/api';
import { JobInfo, AccountInfo } from './types';

// Removed mock data generation - returns empty array instead
export const generateMockJobs = (keywords: string): JobInfo[] => {
  console.warn('Job search failed - returning empty results instead of mock data');
  return [];
};

export const searchJobs = async (keywords: string, location: string): Promise<JobInfo[]> => {
  try {
    const response = await fetch(`https://remotive.io/api/remote-jobs?search=${encodeURIComponent(keywords)}&limit=5`);
    
    if (response.ok) {
      const data = await response.json();
      return data.jobs?.map((job: any, index: number) => ({
        id: job.id || `job-${index}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        hasForm: Math.random() > 0.4,
        url: job.url,
        salary: job.salary || 'Salary not specified',
        description: job.description,
        tags: job.tags || [],
        jobType: job.job_type || 'Full-time',
        publicationDate: job.publication_date
      })) || [];
    } else {
      console.error('Job search API failed with status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error searching for jobs:', error);
    return [];
  }
};

export const startAutomatedJobSearch = async (formData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/api/automation/automated-search-apply/`,
      {
        query: formData.keywords,
        location: formData.location,
        platforms: formData.preferredJobSites || ['linkedin', 'indeed'],
        max_applications: parseInt(formData.maxApplicationsPerDay) || 5,
        credentials: {}
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Automation completed successfully:', response.data.results);
      return response.data.results;
    } else {
      throw new Error(response.data.error || 'Automation failed');
    }
  } catch (error) {
    console.error('Error during automated job search:', error);
    throw error;
  }
};

export const fillJobFormWithSelenium = async (job: JobInfo) => {
  console.log(`🤖 Starting Selenium automation for ${job.title} at ${job.company}`);
  
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/api/automation/apply-to-job/`,
      {
        job_data: {
          url: job.url,
          title: job.title,
          company: job.company,
          location: job.location,
          platform: job.platform || 'unknown',
          salary: job.salary
        },
        credentials: {}
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Selenium automation completed successfully:', response.data.message);
      return { 
        success: true, 
        applicationId: `app_${Date.now()}`, 
        payload: response.data.job_data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.error || 'Selenium automation failed');
    }
  } catch (error) {
    console.error('Error during Selenium automation:', error);
    throw error;
  }
};

export const promptManualApplication = async (job: JobInfo, manualPromptMethod: string) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (manualPromptMethod === 'email') {
    const emailContent = {
      to: user.email,
      subject: `Manual Application Required: ${job.title} at ${job.company}`,
      body: `
        Hi ${user.full_name},
        
        I found a job opportunity that requires manual application:
        
        Position: ${job.title}
        Company: ${job.company}
        Location: ${job.location}
        Salary: ${job.salary}
        URL: ${job.url}
        
        Please apply manually at your earliest convenience.
        
        Best regards,
        Your AI Job Search Assistant
      `
    };
    
    console.log('Sending manual application email:', emailContent);
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    const smsContent = {
      to: user.phone_number,
      message: `Job Alert: ${job.title} at ${job.company} requires manual application. Apply at: ${job.url}`
    };
    
    console.log('Sending manual application SMS:', smsContent);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

export const updateApplicationTracker = async (job: JobInfo, status: string) => {
  const applicationRecord = {
    id: job.id,
    jobTitle: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    applicationDate: new Date().toISOString(),
    status: status,
    url: job.url,
    appliedVia: job.hasForm ? 'automated_selenium' : 'manual_prompt',
    confirmationReceived: status === 'confirmed'
  };
  
  const existingApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
  const updatedApplications = [...existingApplications, applicationRecord];
  localStorage.setItem('jobApplications', JSON.stringify(updatedApplications));
  
  console.log('Application tracker updated:', applicationRecord);
};

export const parseJobFromUrl = async (url: string): Promise<JobInfo> => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    let jobInfo: JobInfo = {
      id: `direct-${Date.now()}`,
      url: url,
      title: 'Position Title Not Available',
      company: 'Company Name Not Available', 
      location: 'Location Not Available',
      salary: 'Salary Not Available',
      hasForm: true,
      description: 'Job details will be extracted from the URL',
      tags: [],
      jobType: 'Full-time',
      publicationDate: new Date().toISOString()
    };

    if (domain.includes('brightermonday.co.ke')) {
      jobInfo = {
        ...jobInfo,
        title: 'Position details will be extracted from URL',
        company: 'Company details will be extracted from URL',
        location: 'Location details will be extracted from URL',
        salary: 'Salary details will be extracted from URL',
        platform: 'BrighterMonday'
      };
    } else if (domain.includes('linkedin.com')) {
      jobInfo.platform = 'LinkedIn';
    } else if (domain.includes('indeed.com')) {
      jobInfo.platform = 'Indeed';
    } else {
      jobInfo.platform = 'Unknown';
    }

    return jobInfo;
  } catch (error) {
    throw new Error('Invalid job URL format');
  }
};

export const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const generateCoverLetter = (job: JobInfo): string => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. ${user.job_category ? `With my background in ${user.job_category}` : 'With my professional background'} ${user.experience_years ? `and ${user.experience_years} of experience` : ''}, I believe I would be a valuable addition to your team.

${user.skills ? `My skills in ${user.skills}` : 'My professional skills'} align well with the requirements for this role. I am particularly excited about the opportunity to contribute to ${job.company}'s mission${job.location ? ` and work in ${job.location}` : ''}.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
${user.full_name}`;
};