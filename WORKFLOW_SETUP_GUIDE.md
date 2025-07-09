# Job Search Setup Workflow Guide

## Overview
The new Guided Workflow Steps component provides a step-by-step process to help users set up their job search profile and get the most out of the AI-powered job search features.

## Features Implemented

### 🎯 Step-by-Step Workflow
1. **Complete Your Profile** (Required)
2. **Upload Your CV/Resume** (Required) 
3. **Set Job Preferences** (Optional)
4. **Connect Email Account** (Optional)
5. **Start Job Search** (Optional)

### 📋 Step 1: Complete Your Profile

#### What it does:
- Prompts users to fill in essential profile information
- Provides a comprehensive form with validation
- Stores user data for personalized job matching

#### Form Fields:
- **Full Name** (Required)
- **Email** (Required)
- **Phone Number** (Optional)
- **Job Category** (e.g., Software Engineer, Data Scientist)
- **Years of Experience** (Dropdown with predefined ranges)
- **Skills** (Comma-separated list)
- **Preferred Locations** (e.g., Remote, New York, San Francisco)

#### Features:
- ✅ Form validation for required fields
- ✅ Real-time updates to localStorage
- ✅ Visual completion status
- ✅ Edit existing profile option
- ✅ Progress indication

### 📄 Step 2: Upload Your CV/Resume

#### What it does:
- Allows users to upload PDF, DOC, or DOCX files
- Integrates with backend CV analysis API
- Shows upload progress and completion status

#### Features:
- ✅ Drag & drop file upload
- ✅ File type validation (PDF, DOC, DOCX)
- ✅ File size validation (max 10MB)
- ✅ Upload progress indicator
- ✅ CV analysis results display
- ✅ Replace existing CV option
- ✅ Integration with backend API

#### API Integration:
```typescript
POST /api/cvs/
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData with 'file' field
```

### 🎨 User Interface Features

#### Progress Visualization:
- **Step indicators**: Numbered circles showing current step
- **Progress bar**: Visual connection between steps
- **Completion status**: Green checkmarks for completed steps
- **Required indicators**: Red dots for mandatory steps

#### Smart Navigation:
- **Previous/Next buttons**: Navigate between steps
- **Step clicking**: Jump directly to any step
- **Conditional advancement**: Can't proceed if required steps incomplete
- **Form validation**: Ensures data quality before proceeding

#### Visual Feedback:
- **Status cards**: Clear indication of completion status
- **Success messages**: Confirmation when steps are completed
- **Warning messages**: Alerts for incomplete required steps
- **Loading states**: Progress indicators during uploads/saves

## How to Use

### For Users:
1. **Access the workflow**: Click "Setup Workflow" in the sidebar
2. **Follow the steps**: Complete each step in order
3. **Fill profile**: Enter your personal and professional information
4. **Upload CV**: Choose and upload your resume file
5. **Monitor progress**: Track completion via the progress bar

### For Developers:

#### Component Structure:
```
GuidedWorkflowSteps.tsx
├── ProfileForm component
├── CVUploadForm component
├── Step navigation logic
├── Progress tracking
└── Integration with useJobSearch hook
```

#### Key Props and State:
```typescript
interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  isRequired: boolean;
  icon: React.ReactNode;
}
```

#### Integration Points:
- **useJobSearch hook**: CV status and profile data
- **Backend APIs**: CV upload and profile updates
- **LocalStorage**: Profile data persistence
- **Dashboard**: Sidebar navigation integration

## Technical Implementation

### State Management:
- **Local state**: Current step, form data, UI states
- **Global state**: CV status, user profile (via useJobSearch)
- **Persistence**: Profile data stored in localStorage
- **API integration**: Real-time updates with backend

### Validation Logic:
```typescript
// Profile completion check
const isProfileComplete = user.full_name && user.email;

// Step advancement check
const canProceedToNext = () => {
  const current = getCurrentStep();
  if (current.isRequired && current.status !== 'completed') {
    return false;
  }
  return currentStep < updatedSteps.length - 1;
};
```

### File Upload Handling:
```typescript
// File validation
const allowedTypes = [
  'application/pdf',
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Upload with progress
const response = await axios.post('/api/cvs/', formData, {
  onUploadProgress: (progressEvent) => {
    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setUploadProgress(progress);
  }
});
```

## Future Enhancements

### Planned Features:
1. **Job Preferences Step**: Configure search criteria, salary ranges, work type
2. **Email Integration Step**: Connect Gmail/Outlook for application tracking
3. **Skills Assessment**: Interactive skills evaluation and recommendations
4. **Portfolio Upload**: Support for additional documents and portfolios
5. **Social Profiles**: LinkedIn integration for enhanced profiles

### Technical Improvements:
1. **Form auto-save**: Preserve data as users type
2. **Offline support**: Continue workflow without internet
3. **Multi-language**: Support for multiple languages
4. **Accessibility**: Enhanced screen reader support
5. **Mobile optimization**: Responsive design improvements

## API Endpoints Used

### Profile Management:
- `GET /api/user/profile/` - Fetch user profile
- `PUT /api/user/profile/` - Update user profile

### CV Management:
- `POST /api/cvs/` - Upload new CV
- `GET /api/cvs/active/` - Get active CV info
- `DELETE /api/cvs/{id}/` - Remove CV

### Status Tracking:
- Profile completion tracked via localStorage
- CV status tracked via useJobSearch hook
- Progress persistence across sessions

## Benefits

### For Users:
- ✅ **Guided Experience**: Clear step-by-step process
- ✅ **Progress Tracking**: Visual indication of completion
- ✅ **Flexible Workflow**: Skip optional steps, return anytime
- ✅ **Data Validation**: Ensures quality information
- ✅ **Immediate Feedback**: Real-time status updates

### For the Application:
- ✅ **Higher Completion Rates**: Structured onboarding
- ✅ **Better Data Quality**: Validated user information
- ✅ **Improved Job Matching**: Complete profiles = better matches
- ✅ **User Engagement**: Interactive, engaging process
- ✅ **Reduced Support**: Self-explanatory workflow

This workflow ensures users have all necessary information uploaded and configured before they begin their AI-powered job search, leading to better results and user satisfaction.