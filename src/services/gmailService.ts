import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface GmailSearchOptions {
  query?: string;
  maxResults?: number;
  includeBody?: boolean;
  fromDate?: string;
  toDate?: string;
  hasAttachment?: boolean;
  isUnread?: boolean;
}

export interface EmailAnalysis {
  isJobRelated: boolean;
  category: 'job_posting' | 'interview' | 'rejection' | 'offer' | 'networking' | 'other';
  sentiment: 'positive' | 'neutral' | 'negative';
  keyEntities: string[];
  actionItems: string[];
  urgency: 'high' | 'medium' | 'low';
  suggestedResponse?: string;
}

class GmailService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return { Authorization: `Bearer ${token}` };
  }

  // Build Gmail search query from options
  private buildSearchQuery(options: GmailSearchOptions): string {
    const queryParts: string[] = [];

    if (options.query) {
      queryParts.push(options.query);
    }

    if (options.fromDate) {
      queryParts.push(`after:${options.fromDate}`);
    }

    if (options.toDate) {
      queryParts.push(`before:${options.toDate}`);
    }

    if (options.hasAttachment) {
      queryParts.push('has:attachment');
    }

    if (options.isUnread) {
      queryParts.push('is:unread');
    }

    return queryParts.join(' ');
  }

  // Search emails with advanced options
  async searchEmails(accountId: number, options: GmailSearchOptions = {}) {
    const query = this.buildSearchQuery(options);
    const params = new URLSearchParams();
    
    if (query) params.append('query', query);
    if (options.maxResults) params.append('max_results', options.maxResults.toString());

    const response = await axios.get(
      `${API_BASE_URL}/email-accounts/${accountId}/gmail-emails/?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );

    return response.data.emails || [];
  }

  // Get job-related emails
  async getJobRelatedEmails(accountId: number, maxResults: number = 50) {
    return this.searchEmails(accountId, {
      query: 'subject:(job OR application OR interview OR recruiter OR hiring OR position OR career OR opportunity)',
      maxResults
    });
  }

  // Get recent emails from recruiters
  async getRecruiterEmails(accountId: number, days: number = 30, maxResults: number = 20) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    return this.searchEmails(accountId, {
      query: 'from:(recruiter OR recruiting OR talent OR hiring OR hr) OR subject:(recruiter OR recruiting OR opportunity)',
      fromDate: fromDate.toISOString().split('T')[0],
      maxResults
    });
  }

  // Get interview-related emails
  async getInterviewEmails(accountId: number, maxResults: number = 20) {
    return this.searchEmails(accountId, {
      query: 'subject:(interview OR "phone screen" OR "video call" OR "meet" OR "schedule") AND (job OR position OR role)',
      maxResults
    });
  }

  // Get rejection emails
  async getRejectionEmails(accountId: number, maxResults: number = 20) {
    return this.searchEmails(accountId, {
      query: 'subject:("not selected" OR "unfortunately" OR "decided to" OR "other candidates" OR "position has been filled") OR ("we regret" OR "thank you for your interest")',
      maxResults
    });
  }

  // Get offer emails
  async getOfferEmails(accountId: number, maxResults: number = 10) {
    return this.searchEmails(accountId, {
      query: 'subject:("offer" OR "congratulations" OR "pleased to offer" OR "job offer" OR "welcome to") AND NOT (interview OR application)',
      maxResults
    });
  }

  // Analyze email content using AI
  async analyzeEmail(emailContent: string): Promise<EmailAnalysis> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/gmail/analyze-email/`,
        { content: emailContent },
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      // Fallback to simple rule-based analysis
      return this.simpleEmailAnalysis(emailContent);
    }
  }

  // Simple rule-based email analysis as fallback
  private simpleEmailAnalysis(content: string): EmailAnalysis {
    const lowerContent = content.toLowerCase();
    
    // Check if job-related
    const jobKeywords = ['job', 'position', 'role', 'career', 'hiring', 'interview', 'recruiter', 'application'];
    const isJobRelated = jobKeywords.some(keyword => lowerContent.includes(keyword));

    // Determine category
    let category: EmailAnalysis['category'] = 'other';
    if (lowerContent.includes('interview') || lowerContent.includes('phone screen')) {
      category = 'interview';
    } else if (lowerContent.includes('offer') || lowerContent.includes('congratulations')) {
      category = 'offer';
    } else if (lowerContent.includes('unfortunately') || lowerContent.includes('not selected')) {
      category = 'rejection';
    } else if (lowerContent.includes('opportunity') || lowerContent.includes('position')) {
      category = 'job_posting';
    } else if (lowerContent.includes('network') || lowerContent.includes('connect')) {
      category = 'networking';
    }

    // Determine sentiment
    const positiveWords = ['congratulations', 'pleased', 'excited', 'opportunity', 'offer'];
    const negativeWords = ['unfortunately', 'regret', 'not selected', 'decided to go with'];
    
    let sentiment: EmailAnalysis['sentiment'] = 'neutral';
    if (positiveWords.some(word => lowerContent.includes(word))) {
      sentiment = 'positive';
    } else if (negativeWords.some(word => lowerContent.includes(word))) {
      sentiment = 'negative';
    }

    // Extract key entities (simple approach)
    const entities: string[] = [];
    const companyPattern = /at\s+([A-Z][a-zA-Z\s]+(?:Inc|LLC|Corp|Company)?)/g;
    const matches = content.match(companyPattern);
    if (matches) {
      entities.push(...matches.map(match => match.replace('at ', '').trim()));
    }

    // Generate action items
    const actionItems: string[] = [];
    if (category === 'interview') {
      actionItems.push('Prepare for interview');
      actionItems.push('Research company');
    } else if (category === 'job_posting') {
      actionItems.push('Review job requirements');
      actionItems.push('Prepare application');
    } else if (category === 'offer') {
      actionItems.push('Review offer details');
      actionItems.push('Consider negotiation');
    }

    // Determine urgency
    let urgency: EmailAnalysis['urgency'] = 'low';
    if (lowerContent.includes('urgent') || lowerContent.includes('asap') || lowerContent.includes('deadline')) {
      urgency = 'high';
    } else if (lowerContent.includes('soon') || lowerContent.includes('quickly')) {
      urgency = 'medium';
    }

    return {
      isJobRelated,
      category,
      sentiment,
      keyEntities: entities,
      actionItems,
      urgency
    };
  }

  // Get email statistics
  async getEmailStats(accountId: number, days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const [jobEmails, recruiters, interviews, rejections, offers] = await Promise.all([
      this.getJobRelatedEmails(accountId, 100),
      this.getRecruiterEmails(accountId, days, 50),
      this.getInterviewEmails(accountId, 50),
      this.getRejectionEmails(accountId, 50),
      this.getOfferEmails(accountId, 10)
    ]);

    return {
      totalJobEmails: jobEmails.length,
      recruiterEmails: recruiters.length,
      interviewEmails: interviews.length,
      rejectionEmails: rejections.length,
      offerEmails: offers.length,
      period: `${days} days`
    };
  }

  // Search emails by company
  async searchByCompany(accountId: number, companyName: string, maxResults: number = 20) {
    return this.searchEmails(accountId, {
      query: `from:${companyName} OR subject:${companyName}`,
      maxResults
    });
  }

  // Get unread job emails
  async getUnreadJobEmails(accountId: number, maxResults: number = 20) {
    return this.searchEmails(accountId, {
      query: 'is:unread AND (subject:(job OR application OR interview OR recruiter) OR from:(recruiter OR recruiting))',
      maxResults
    });
  }
}

export const gmailService = new GmailService();
export default gmailService;