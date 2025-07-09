// Google Custom Search Engine Service for Job Search
export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  htmlTitle: string;
  htmlSnippet: string;
  cacheId?: string;
  pagemap?: {
    cse_thumbnail?: Array<{
      src: string;
      width: string;
      height: string;
    }>;
    metatags?: Array<{
      'og:title'?: string;
      'og:description'?: string;
      'og:type'?: string;
      'og:url'?: string;
      'og:site_name'?: string;
      'twitter:title'?: string;
      'twitter:description'?: string;
    }>;
  };
}

export interface GoogleSearchResponse {
  items: GoogleSearchResult[];
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
}

export interface JobSearchParams {
  query: string;
  location?: string;
  jobSites?: string[];
  experienceLevel?: string;
  jobType?: string;
  salaryRange?: string;
  datePosted?: string;
  maxResults?: number;
}

export interface ProcessedJobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  datePosted?: string;
  salary?: string;
  jobType?: string;
  matchScore: number;
  extractedData: {
    requirements: string[];
    benefits: string[];
    skills: string[];
  };
}

class GoogleSearchService {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '';
    
    if (!this.apiKey) {
      console.warn('Google Search API key not configured. Add VITE_GOOGLE_SEARCH_API_KEY to your .env file');
    }
    
    if (!this.searchEngineId) {
      console.warn('Google Search Engine ID not configured. Add VITE_GOOGLE_SEARCH_ENGINE_ID to your .env file');
    }
  }

  /**
   * Search for jobs using Google Custom Search Engine
   */
  async searchJobs(params: JobSearchParams): Promise<ProcessedJobResult[]> {
    if (!this.apiKey || !this.searchEngineId) {
      throw new Error('Google Search API credentials not configured');
    }

    try {
      // Build search query with job-specific modifiers
      const searchQuery = this.buildJobSearchQuery(params);
      
      // Perform the search
      const searchResponse = await this.performSearch(searchQuery, params.maxResults || 10);
      
      // Process and filter results
      const processedResults = this.processSearchResults(searchResponse, params);
      
      return processedResults;
    } catch (error) {
      console.error('Google job search error:', error);
      throw error;
    }
  }

  /**
   * Build optimized search query for job searching
   */
  private buildJobSearchQuery(params: JobSearchParams): string {
    let query = params.query;
    
    // Add job-specific keywords
    if (!query.toLowerCase().includes('job') && !query.toLowerCase().includes('position')) {
      query += ' job';
    }
    
    // Add location if specified
    if (params.location) {
      query += ` in ${params.location}`;
    }
    
    // Add experience level modifier
    if (params.experienceLevel) {
      query += ` ${params.experienceLevel}`;
    }
    
    // Add job type modifier
    if (params.jobType) {
      query += ` ${params.jobType}`;
    }
    
    // Add date filter
    if (params.datePosted) {
      const dateMap: Record<string, string> = {
        'today': 'posted today',
        'week': 'posted this week',
        'month': 'posted this month'
      };
      query += ` ${dateMap[params.datePosted] || ''}`;
    }
    
    // Add site-specific search if job sites are specified
    if (params.jobSites && params.jobSites.length > 0) {
      const siteQueries = params.jobSites.map(site => {
        const siteMap: Record<string, string> = {
          'linkedin': 'site:linkedin.com/jobs',
          'indeed': 'site:indeed.com',
          'glassdoor': 'site:glassdoor.com',
          'monster': 'site:monster.com',
          'careerbuilder': 'site:careerbuilder.com',
          'dice': 'site:dice.com',
          'stackoverflow': 'site:stackoverflow.com/jobs',
          'angellist': 'site:angel.co',
          'remote': 'site:remote.co OR site:remoteok.io',
          'freelancer': 'site:freelancer.com OR site:upwork.com',
          'brightermonday': 'site:brightermonday.co.ke',
          'fuzu': 'site:fuzu.com',
          'brighter': 'site:brighter.co.ke'
        };
        return siteMap[site.toLowerCase()] || `site:${site}`;
      });
      
      query += ` (${siteQueries.join(' OR ')})`;
    }
    
    return query;
  }

  /**
   * Perform Google Custom Search API call
   */
  private async performSearch(query: string, maxResults: number): Promise<GoogleSearchResponse> {
    const params = new URLSearchParams({
      key: this.apiKey,
      cx: this.searchEngineId,
      q: query,
      num: Math.min(maxResults, 10).toString(), // Google CSE max is 10 per request
      safe: 'active',
      lr: 'lang_en',
      gl: 'us', // Geographic location
      hl: 'en' // Interface language
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google Search API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return {
        items: [],
        searchInformation: {
          searchTime: 0,
          formattedSearchTime: '0.00',
          totalResults: '0',
          formattedTotalResults: '0'
        },
        queries: {
          request: []
        }
      };
    }

    return data;
  }

  /**
   * Process and filter search results to extract job information
   */
  private processSearchResults(searchResponse: GoogleSearchResponse, params: JobSearchParams): ProcessedJobResult[] {
    const results: ProcessedJobResult[] = [];
    
    for (const item of searchResponse.items) {
      try {
        const processedJob = this.extractJobData(item, params);
        if (processedJob) {
          results.push(processedJob);
        }
      } catch (error) {
        console.warn('Error processing search result:', error);
      }
    }
    
    // Sort by match score (descending)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Extract job data from search result
   */
  private extractJobData(item: GoogleSearchResult, params: JobSearchParams): ProcessedJobResult | null {
    // Skip non-job results
    if (!this.isJobResult(item)) {
      return null;
    }

    const title = this.extractJobTitle(item);
    const company = this.extractCompany(item);
    const location = this.extractLocation(item);
    const description = this.cleanDescription(item.snippet);
    const source = this.extractSource(item.displayLink);
    const salary = this.extractSalary(item.snippet);
    const jobType = this.extractJobType(item.snippet);
    const matchScore = this.calculateMatchScore(item, params);
    const extractedData = this.extractJobMetadata(item);

    return {
      id: `google_${btoa(item.link).replace(/[^a-zA-Z0-9]/g, '')}`,
      title,
      company,
      location,
      description,
      url: item.link,
      source,
      salary,
      jobType,
      matchScore,
      extractedData
    };
  }

  /**
   * Check if search result is a job posting
   */
  private isJobResult(item: GoogleSearchResult): boolean {
    const jobKeywords = [
      'job', 'position', 'career', 'employment', 'hiring', 'vacancy',
      'opening', 'opportunity', 'role', 'apply', 'recruitment'
    ];
    
    const textToCheck = `${item.title} ${item.snippet}`.toLowerCase();
    
    return jobKeywords.some(keyword => textToCheck.includes(keyword));
  }

  /**
   * Extract job title from search result
   */
  private extractJobTitle(item: GoogleSearchResult): string {
    let title = item.title;
    
    // Clean up common job board formatting
    title = title.replace(/\s*-\s*(Indeed|LinkedIn|Glassdoor|Monster|CareerBuilder|Dice|Stack Overflow|AngelList|Remote\.co|Freelancer|Upwork|BrighterMonday|Fuzu).*$/i, '');
    title = title.replace(/\s*\|\s*.*$/, ''); // Remove everything after |
    title = title.replace(/\s*at\s+.*$/, ''); // Remove "at Company" suffix
    title = title.replace(/\s*in\s+.*$/, ''); // Remove "in Location" suffix
    title = title.replace(/\s*\(\d+\)\s*$/, ''); // Remove count suffixes like (5)
    
    return title.trim();
  }

  /**
   * Extract company name from search result
   */
  private extractCompany(item: GoogleSearchResult): string {
    // Try to extract from title
    const titleMatch = item.title.match(/\s+at\s+(.+?)(?:\s*-|\s*\||\s*$)/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Try to extract from snippet
    const snippetMatch = item.snippet.match(/(?:at|by|with)\s+([A-Z][a-zA-Z\s&.,]+?)(?:\s*-|\s*\.|$)/);
    if (snippetMatch) {
      return snippetMatch[1].trim();
    }
    
    // Fallback to domain name
    return item.displayLink.replace(/^www\./, '').replace(/\.com$/, '').replace(/\.co\.ke$/, '');
  }

  /**
   * Extract location from search result
   */
  private extractLocation(item: GoogleSearchResult): string {
    // Common location patterns
    const locationPatterns = [
      /in\s+([A-Z][a-zA-Z\s,]+?)(?:\s*-|\s*\||\s*$)/i,
      /([A-Z][a-zA-Z\s,]+?)(?:\s*-|\s*\||\s*$)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = item.snippet.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'Remote';
  }

  /**
   * Extract salary information from snippet
   */
  private extractSalary(snippet: string): string | undefined {
    const salaryPatterns = [
      /\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*\/\s*(?:year|month|hour|yr|mo|hr))?/i,
      /KSh\s*[\d,]+(?:\s*-\s*KSh\s*[\d,]+)?(?:\s*\/\s*(?:year|month|hour|yr|mo|hr))?/i,
      /[\d,]+\s*-\s*[\d,]+\s*(?:USD|KES|per\s+(?:year|month|hour))/i
    ];
    
    for (const pattern of salaryPatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return undefined;
  }

  /**
   * Extract job type from snippet
   */
  private extractJobType(snippet: string): string | undefined {
    const jobTypePatterns = [
      /\b(full-time|part-time|contract|freelance|temporary|remote|hybrid|on-site)\b/i
    ];
    
    for (const pattern of jobTypePatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[1].toLowerCase();
      }
    }
    
    return undefined;
  }

  /**
   * Calculate match score based on search relevance
   */
  private calculateMatchScore(item: GoogleSearchResult, params: JobSearchParams): number {
    let score = 50; // Base score
    
    const titleLower = item.title.toLowerCase();
    const snippetLower = item.snippet.toLowerCase();
    const queryLower = params.query.toLowerCase();
    
    // Title relevance (30 points)
    if (titleLower.includes(queryLower)) {
      score += 30;
    } else {
      const queryWords = queryLower.split(' ');
      const titleWords = titleLower.split(' ');
      const matchedWords = queryWords.filter(word => titleWords.includes(word));
      score += (matchedWords.length / queryWords.length) * 30;
    }
    
    // Snippet relevance (20 points)
    if (snippetLower.includes(queryLower)) {
      score += 20;
    } else {
      const queryWords = queryLower.split(' ');
      const snippetWords = snippetLower.split(' ');
      const matchedWords = queryWords.filter(word => snippetWords.includes(word));
      score += (matchedWords.length / queryWords.length) * 20;
    }
    
    // Source quality bonus
    const highQualitySources = [
      'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
      'careerbuilder.com', 'dice.com', 'stackoverflow.com', 'angel.co',
      'brightermonday.co.ke', 'fuzu.com'
    ];
    
    if (highQualitySources.some(source => item.displayLink.includes(source))) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Extract job metadata (requirements, benefits, skills)
   */
  private extractJobMetadata(item: GoogleSearchResult): ProcessedJobResult['extractedData'] {
    const snippet = item.snippet.toLowerCase();
    
    // Extract requirements
    const requirements = this.extractRequirements(snippet);
    
    // Extract benefits
    const benefits = this.extractBenefits(snippet);
    
    // Extract skills
    const skills = this.extractSkills(snippet);
    
    return {
      requirements,
      benefits,
      skills
    };
  }

  /**
   * Extract job requirements from text
   */
  private extractRequirements(text: string): string[] {
    const requirementKeywords = [
      'experience', 'degree', 'certification', 'years', 'bachelor',
      'master', 'phd', 'required', 'must have', 'essential'
    ];
    
    const requirements: string[] = [];
    
    for (const keyword of requirementKeywords) {
      const regex = new RegExp(`\\b${keyword}[^.]*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        requirements.push(...matches.map(m => m.trim()));
      }
    }
    
    return requirements.slice(0, 3); // Limit to top 3
  }

  /**
   * Extract benefits from text
   */
  private extractBenefits(text: string): string[] {
    const benefitKeywords = [
      'benefits', 'insurance', 'health', 'dental', 'vision',
      'retirement', '401k', 'vacation', 'pto', 'bonus'
    ];
    
    const benefits: string[] = [];
    
    for (const keyword of benefitKeywords) {
      if (text.includes(keyword)) {
        benefits.push(keyword);
      }
    }
    
    return benefits.slice(0, 3); // Limit to top 3
  }

  /**
   * Extract technical skills from text
   */
  private extractSkills(text: string): string[] {
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue',
      'node.js', 'express', 'mongodb', 'postgresql', 'mysql',
      'aws', 'azure', 'docker', 'kubernetes', 'git', 'html',
      'css', 'typescript', 'php', 'laravel', 'django', 'flask',
      'sql', 'nosql', 'redis', 'elasticsearch', 'restapi',
      'graphql', 'microservices', 'agile', 'scrum', 'devops'
    ];
    
    const extractedSkills: string[] = [];
    
    for (const skill of commonSkills) {
      if (text.includes(skill)) {
        extractedSkills.push(skill);
      }
    }
    
    return extractedSkills.slice(0, 5); // Limit to top 5
  }

  /**
   * Extract source name from display link
   */
  private extractSource(displayLink: string): string {
    const sourceMap: Record<string, string> = {
      'linkedin.com': 'LinkedIn',
      'indeed.com': 'Indeed',
      'glassdoor.com': 'Glassdoor',
      'monster.com': 'Monster',
      'careerbuilder.com': 'CareerBuilder',
      'dice.com': 'Dice',
      'stackoverflow.com': 'Stack Overflow',
      'angel.co': 'AngelList',
      'remote.co': 'Remote.co',
      'remoteok.io': 'Remote OK',
      'freelancer.com': 'Freelancer',
      'upwork.com': 'Upwork',
      'brightermonday.co.ke': 'BrighterMonday',
      'fuzu.com': 'Fuzu'
    };
    
    const domain = displayLink.replace(/^www\./, '');
    return sourceMap[domain] || domain;
  }

  /**
   * Clean and format job description
   */
  private cleanDescription(snippet: string): string {
    return snippet
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .trim()
      .substring(0, 200) + '...';
  }
}

// Export singleton instance
export const googleSearchService = new GoogleSearchService();
export default googleSearchService;