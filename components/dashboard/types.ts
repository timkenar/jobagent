export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  isRequired: boolean;
  icon: React.ReactNode;
}

export interface ProfileFormData {
  full_name: string;
  email: string;
  phone_number: string;
  skills: string;
  experience_years: string;
  job_category: string;
  preferred_locations: string;
}

export interface AIAgentConfig {
  chatModel: string;
  enableMemory: boolean;
  memoryContext: string;
  instructions: string;
  emailConnected?: boolean;
  connectedEmails?: Array<{
    id: string;
    email: string;
    provider: string;
  }>;
}

export interface JobSearchConfig {
  keywords: string;
  location: string;
  jobType: string;
  salaryMin: string;
  salaryMax: string;
  experienceLevel: string;
  enableAutoApplication: boolean;
  seleniumEnabled: boolean;
  confirmationEmail: string;
  trackApplications: boolean;
  manualPromptMethod: string;
  maxApplicationsPerDay: string;
  companyBlacklist: string;
  preferredJobSites: string[];
}

export interface JobInfo {
  id: string;
  title: string;
  company: string;
  location: string;
  hasForm: boolean;
  url: string;
  salary: string;
  description: string;
  tags: string[];
  jobType: string;
  publicationDate: string;
  platform?: string;
}

export interface ApplicationProgress {
  [key: string]: string;
}

export interface AccountInfo {
  platform: string;
  email: string;
  password: string;
  created: string;
  verified: boolean;
  profileCompleted: boolean;
}

export interface FormProps {
  onComplete: (data?: any) => void;
  onCancel: () => void;
}

export interface ProfileFormProps extends FormProps {
  userProfile: any;
}

export interface AIAgentFormProps extends FormProps {
  onComplete: (config: AIAgentConfig) => void;
}

export interface JobSearchFormProps extends FormProps {
  onComplete: (config: JobSearchConfig) => void;
}