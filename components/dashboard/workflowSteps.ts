import { WorkflowStep } from './types';

export const createWorkflowSteps = (
  profileComplete: boolean,
  cvUploaded: boolean,
  aiAgentComplete: boolean,
  jobSearchComplete: boolean
): Omit<WorkflowStep, 'icon'>[] => {
  return [
    {
      id: 'profile-setup',
      title: 'Complete Your Profile',
      description: 'Fill in your personal information and contact details',
      status: profileComplete ? 'completed' : 'pending',
      isRequired: true
    },
    {
      id: 'cv-upload',
      title: 'Upload Your CV/Resume',
      description: 'Upload your CV for AI-powered job matching',
      status: cvUploaded ? 'completed' : 'pending',
      isRequired: true
    },
    {
      id: 'preferences',
      title: 'Set Job Preferences',
      description: 'Configure your job search preferences and criteria',
      status: 'pending',
      isRequired: false
    },
    {
      id: 'ai-agent-setup',
      title: 'Configure AI Agent',
      description: 'Set up your AI agent with chat model, memory, and email integration',
      status: aiAgentComplete ? 'completed' : 'pending',
      isRequired: false
    },
    {
      id: 'job-search',
      title: 'Start Job Search',
      description: 'Begin automated job search with form filling and application tracking',
      status: jobSearchComplete ? 'completed' : 'pending',
      isRequired: false
    }
  ];
};