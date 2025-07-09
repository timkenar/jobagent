// Service for automation API calls
import { API_ENDPOINTS, apiCall } from '../config/api';

class AutomationService {

  async searchJobs(data: {
    query: string;
    location?: string;
    platforms: string[];
    credentials?: Record<string, any>;
  }) {
    return apiCall(API_ENDPOINTS.AUTOMATION.SEARCH_JOBS, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async applyToJob(data: {
    job_data: {
      title: string;
      company: string;
      url: string;
      platform: string;
      location?: string;
    };
    credentials?: Record<string, any>;
  }) {
    return apiCall(API_ENDPOINTS.AUTOMATION.APPLY_TO_JOB, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async bulkApplyToJobs(data: {
    jobs: Array<{
      title: string;
      company: string;
      url: string;
      platform: string;
      location?: string;
    }>;
    credentials?: Record<string, any>;
    max_applications?: number;
  }) {
    return apiCall(API_ENDPOINTS.AUTOMATION.BULK_APPLY, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async automatedSearchAndApply(data: {
    query: string;
    location?: string;
    platforms: string[];
    credentials?: Record<string, any>;
    max_applications?: number;
  }) {
    return apiCall(API_ENDPOINTS.AUTOMATION.AUTOMATED_SEARCH_APPLY, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAutomationStatus() {
    return apiCall(API_ENDPOINTS.AUTOMATION.STATUS, {
      method: 'GET'
    });
  }

  async testPlatformConnection(data: {
    platform: string;
    credentials: {
      email: string;
      password: string;
    };
  }) {
    return apiCall(API_ENDPOINTS.AUTOMATION.TEST_PLATFORM, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async scheduleAutomatedSearch(data: {
    query: string;
    location?: string;
    platforms: string[];
    credentials?: Record<string, any>;
    max_applications?: number;
  }) {
    return apiCall(API_ENDPOINTS.AUTOMATION.SCHEDULE_AUTOMATED_SEARCH, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const automationService = new AutomationService();
export default automationService;