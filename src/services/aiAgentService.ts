import { JobInfo, AIAgentConfig, ProfileFormData } from '../../components/dashboard/types';
import { API_CONFIG } from '../config/api';

export interface ApplicationResult {
  success: boolean;
  jobId: string;
  message: string;
  accountCreated?: boolean;
  applicationId?: string;
  screenshots?: string[];
  errors?: string[];
}

export interface AIAgentContext {
  userProfile: ProfileFormData;
  cvData: any;
  aiConfig: AIAgentConfig;
  jobSearchConfig: any;
}

class AIAgentService {
  private context: AIAgentContext | null = null;

  /**
   * Initialize AI agent with user context
   */
  async initialize(): Promise<void> {
    try {
      // Load user context from localStorage
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const cvData = JSON.parse(localStorage.getItem('cvData') || '{}');
      const aiConfig = JSON.parse(localStorage.getItem('aiAgentConfig') || '{}');
      const jobSearchConfig = JSON.parse(localStorage.getItem('jobSearchConfig') || '{}');

      this.context = {
        userProfile,
        cvData,
        aiConfig,
        jobSearchConfig
      };

      console.log('AI Agent initialized with context:', this.context);
    } catch (error) {
      console.error('Failed to initialize AI agent:', error);
      throw new Error('AI Agent initialization failed');
    }
  }

  /**
   * Apply to a job using AI automation
   */
  async applyToJob(job: JobInfo): Promise<ApplicationResult> {
    if (!this.context) {
      await this.initialize();
    }

    console.log(`🤖 AI Agent applying to: ${job.title} at ${job.company}`);

    try {
      // Step 1: Analyze job requirements
      const jobAnalysis = await this.analyzeJobRequirements(job);
      console.log('Job analysis:', jobAnalysis);

      // Step 2: Generate tailored cover letter
      const coverLetter = await this.generateCoverLetter(job, jobAnalysis);
      console.log('Generated cover letter:', coverLetter.substring(0, 200) + '...');

      // Step 3: Apply to the job
      const applicationResult = await this.submitApplication(job, coverLetter);
      
      // Step 4: Track application
      await this.trackApplication(job, applicationResult);

      return applicationResult;
    } catch (error) {
      console.error(`AI Agent failed to apply to ${job.title}:`, error);
      return {
        success: false,
        jobId: job.id,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Analyze job requirements using AI
   */
  private async analyzeJobRequirements(job: JobInfo): Promise<any> {
    try {
      // Simulate AI analysis - in real implementation, this would call an AI API
      const analysis = {
        requiredSkills: job.tags || [],
        experienceLevel: this.extractExperienceLevel(job.description),
        matchScore: this.calculateMatchScore(job),
        recommendations: this.generateRecommendations(job)
      };

      return analysis;
    } catch (error) {
      console.warn('Job analysis failed, using fallback:', error);
      return {
        requiredSkills: [],
        experienceLevel: 'mid',
        matchScore: 70,
        recommendations: []
      };
    }
  }

  /**
   * Generate AI-powered cover letter
   */
  private async generateCoverLetter(job: JobInfo, analysis: any): Promise<string> {
    const userProfile = this.context!.userProfile;
    
    // Template-based cover letter generation
    const coverLetter = `Dear ${job.company} Hiring Team,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my ${userProfile.experience_years} years of experience in ${userProfile.job_category}, I am confident that I would be a valuable addition to your team.

My technical skills include ${userProfile.skills}, which align well with the requirements mentioned in your job posting. I am particularly excited about the opportunity to contribute to ${job.company}'s mission and work ${job.location.includes('Remote') ? 'remotely' : 'in ' + job.location}.

${this.generatePersonalizedParagraph(job, analysis)}

I have attached my resume for your review and would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team's success.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
${userProfile.full_name}
${userProfile.email}
${userProfile.phone_number}`;

    return coverLetter;
  }

  /**
   * Submit application to job platform
   */
  private async submitApplication(job: JobInfo, coverLetter: string): Promise<ApplicationResult> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Prepare application data
    const applicationData = {
      job_data: {
        id: job.id,
        title: job.title,
        company: job.company,
        url: job.url,
        location: job.location,
        platform: job.platform || 'unknown'
      },
      user_profile: this.context!.userProfile,
      cover_letter: coverLetter,
      cv_data: this.context!.cvData,
      ai_config: this.context!.aiConfig
    };

    try {
      // Call backend API to handle the application
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/automation/ai-apply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          jobId: job.id,
          message: result.message || 'Application submitted successfully',
          accountCreated: result.account_created || false,
          applicationId: result.application_id,
          screenshots: result.screenshots || []
        };
      } else {
        throw new Error(result.error || 'Application submission failed');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      
      // Fallback to manual application prompt
      return {
        success: false,
        jobId: job.id,
        message: 'Automated application failed. Manual application required.',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Track application in local storage
   */
  private async trackApplication(job: JobInfo, result: ApplicationResult): Promise<void> {
    const applicationRecord = {
      id: result.applicationId || `app_${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      url: job.url,
      applicationDate: new Date().toISOString(),
      status: result.success ? 'applied' : 'failed',
      method: 'ai_automated',
      coverLetter: result.success,
      accountCreated: result.accountCreated || false,
      screenshots: result.screenshots || [],
      errors: result.errors || []
    };

    // Update application tracker
    const existingApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    const updatedApplications = [...existingApplications, applicationRecord];
    localStorage.setItem('jobApplications', JSON.stringify(updatedApplications));

    console.log('Application tracked:', applicationRecord);
  }

  /**
   * Extract experience level from job description
   */
  private extractExperienceLevel(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('senior') || lowerDesc.includes('lead') || lowerDesc.includes('principal')) {
      return 'senior';
    } else if (lowerDesc.includes('junior') || lowerDesc.includes('entry') || lowerDesc.includes('graduate')) {
      return 'junior';
    } else if (lowerDesc.includes('mid') || lowerDesc.includes('intermediate')) {
      return 'mid';
    }
    
    return 'mid';
  }

  /**
   * Calculate match score between user and job
   */
  private calculateMatchScore(job: JobInfo): number {
    if (!this.context) return 50;

    const userSkills = this.context.userProfile.skills?.toLowerCase().split(',') || [];
    const jobSkills = job.tags?.map(tag => tag.toLowerCase()) || [];
    
    let matchCount = 0;
    for (const userSkill of userSkills) {
      if (jobSkills.some(jobSkill => jobSkill.includes(userSkill.trim()))) {
        matchCount++;
      }
    }

    const matchPercentage = userSkills.length > 0 ? (matchCount / userSkills.length) * 100 : 50;
    return Math.min(matchPercentage, 100);
  }

  /**
   * Generate personalized paragraph for cover letter
   */
  private generatePersonalizedParagraph(job: JobInfo, analysis: any): string {
    const userProfile = this.context!.userProfile;
    
    const paragraphs = [
      `In my previous role as a ${userProfile.job_category}, I have successfully worked on projects involving ${job.tags?.slice(0, 3).join(', ')}, which directly relates to the requirements for this position.`,
      `I am particularly drawn to this opportunity because of ${job.company}'s reputation in the industry and the chance to work with cutting-edge technologies mentioned in your job posting.`,
      `My experience with ${userProfile.skills?.split(',').slice(0, 2).join(' and ')} has prepared me to tackle the challenges outlined in this role and contribute meaningfully from day one.`
    ];

    return paragraphs[Math.floor(Math.random() * paragraphs.length)];
  }

  /**
   * Generate recommendations for improving application
   */
  private generateRecommendations(job: JobInfo): string[] {
    const recommendations = [];
    
    if (job.tags?.length > 0) {
      recommendations.push(`Highlight experience with ${job.tags.slice(0, 2).join(' and ')}`);
    }
    
    if (job.location.includes('Remote')) {
      recommendations.push('Emphasize remote work experience and self-motivation');
    }
    
    recommendations.push('Customize cover letter to match company culture');
    recommendations.push('Include relevant project examples');
    
    return recommendations;
  }

  /**
   * Get AI agent status
   */
  getStatus(): { initialized: boolean; context: AIAgentContext | null } {
    return {
      initialized: this.context !== null,
      context: this.context
    };
  }
}

// Export singleton instance
export const aiAgentService = new AIAgentService();
export default aiAgentService;