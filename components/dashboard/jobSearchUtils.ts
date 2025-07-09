import axios from 'axios';
import { API_CONFIG } from '../../src/config/api';
import { JobInfo, AccountInfo } from './types';

export const generateMockJobs = (keywords: string): JobInfo[] => {
  const companies = ['TechCorp', 'StartupInc', 'BigTech', 'DevCompany', 'CodeCorp', 'WebSoft', 'DataTech'];
  const locations = ['Remote', 'San Francisco', 'New York', 'Austin', 'Seattle', 'Boston', 'Los Angeles'];
  const jobTitles = [
    'Senior React Developer',
    'Frontend Engineer', 
    'Full Stack Developer',
    'JavaScript Developer',
    'UI/UX Developer',
    'Software Engineer',
    'Web Developer'
  ];
  
  return Array.from({ length: 5 }, (_, index) => ({
    id: `mock-${index + 1}`,
    title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
    company: companies[Math.floor(Math.random() * companies.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    hasForm: Math.random() > 0.4,
    url: `https://example.com/jobs/${index + 1}`,
    salary: `$${60 + Math.floor(Math.random() * 80)}k - $${80 + Math.floor(Math.random() * 100)}k`,
    description: `Exciting opportunity for a ${jobTitles[Math.floor(Math.random() * jobTitles.length)]} with experience in ${keywords}`,
    tags: ['Remote', 'Full-time', keywords],
    jobType: 'Full-time',
    publicationDate: new Date().toISOString()
  }));
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
      return generateMockJobs(keywords);
    }
  } catch (error) {
    console.error('Error searching for jobs:', error);
    return generateMockJobs(keywords);
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
      title: 'Full Stack Developer',
      company: 'Unknown Company',
      location: 'Kenya',
      salary: 'Competitive',
      hasForm: true,
      description: 'Job details will be extracted from the URL',
      tags: [],
      jobType: 'Full-time',
      publicationDate: new Date().toISOString()
    };

    if (domain.includes('brightermonday.co.ke')) {
      jobInfo = {
        ...jobInfo,
        title: 'Full Stack Developer',
        company: 'BrighterMonday Employer',
        location: 'Nairobi, Kenya',
        salary: 'KSh 80,000 - 120,000',
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

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in ${user.job_category || 'software development'} and ${user.experience_years || 'several years'} of experience, I believe I would be a valuable addition to your team.

My skills in ${user.skills || 'various technologies'} align well with the requirements for this role. I am particularly excited about the opportunity to contribute to ${job.company}'s mission and work in ${job.location}.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
${user.full_name}`;
};