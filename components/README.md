# Frontend Components Architecture

This document outlines the organized structure of the AI Job Search Email Assistant frontend components.

## 📁 Folder Structure

```
components/
├── auth/                   # Authentication & Authorization
├── dashboard/              # Main Dashboard & Workflow
├── email/                  # Email Integration & Management  
├── jobs/                   # Job Search & Applications
├── cv/                     # CV Upload & Management
├── profile/                # User Profile & Settings
├── shared/                 # Reusable/Common Components
├── layout/                 # Layout & Navigation
└── index.ts                # Main exports
```

## 🔐 Authentication (`/auth`)

Handles user authentication, email verification, and OAuth flows.

### Components:
- **`SignUpPage.tsx`** - User registration and sign-in form
- **`EmailVerificationPage.tsx`** - Email verification interface
- **`EmailVerificationRequired.tsx`** - Warning for unverified accounts
- **`OAuthCallback.tsx`** - OAuth callback handler
- **`OAuthDebug.tsx`** - OAuth debugging component

### Features:
- JWT token-based authentication
- Email verification workflow
- Google OAuth integration
- Form validation and error handling

---

## 🏠 Dashboard (`/dashboard`)

Main application dashboard and workflow management.

### Components:
- **`Dashboard.tsx`** - Main dashboard layout with sidebar navigation
- **`WorkflowSteps.tsx`** - Step-by-step job search workflow

### Features:
- Responsive sidebar navigation
- Multi-step workflow management
- Progress tracking
- Dynamic content rendering

---

## 📧 Email Management (`/email`)

Email integration and automated email generation.

### Components:
- **`EmailIntegrationSection.tsx`** - Gmail/Outlook account connection
- **`GeneratedEmailModal.tsx`** - AI-generated email preview and editing
- **`GmailEmailsList.tsx`** - Gmail emails display and management

### Features:
- OAuth email account connection
- AI-powered email generation using Gemini
- Email template customization
- Send and track email functionality

---

## 💼 Jobs (`/jobs`)

Job search, applications, and recommendations.

### Components:
- **`JobSearchSection.tsx`** - Job search interface with CV integration
- **`JobApplicationDashboard.tsx`** - Job application tracking dashboard
- **`JobRecommendations.tsx`** - AI-powered job recommendations based on CV
- **`AddApplicationForm.tsx`** - Manual job application entry form

### Features:
- Google Custom Search API integration
- AI-powered job matching with CV data
- Application status tracking
- Job recommendation scoring
- Real-time job search with web scraping

---

## 📄 CV Management (`/cv`)

CV upload, analysis, and management.

### Components:
- **`CVUploadSection.tsx`** - Drag & drop CV upload with AI analysis

### Features:
- Drag & drop file upload (PDF, DOC, DOCX)
- AI-powered CV analysis using Gemini
- Skill extraction and categorization
- Experience and seniority level detection
- Real-time analysis progress tracking

---

## 👤 Profile (`/profile`)

User profile management and settings.

### Components:
- **`UserProfile.tsx`** - Main user profile page with CV and job recommendations
- **`UserDetailsSection.tsx`** - User information and settings

### Features:
- Profile statistics and insights
- Account settings management
- Activity tracking
- CV status and skill display

---

## 🔄 Shared (`/shared`)

Reusable components used throughout the application.

### Components:
- **`LoadingSpinner.tsx`** - Customizable loading spinner
- **`EnhancedChatbot.tsx`** - AI chatbot widget
- **`icons.tsx`** - SVG icon components
- **`chatbot.jsx`** - Basic chatbot implementation

### Features:
- Consistent loading states
- AI-powered chat assistance
- Reusable icon library
- Animation support with GSAP

---

## 🏗️ Layout (`/layout`)

Layout and navigation components.

### Components:
- **`Sidebar.tsx`** - Main navigation sidebar

### Features:
- Responsive sidebar navigation
- Active route highlighting
- Collapsible menu
- User account display

---

## 🚀 Usage Examples

### Importing Components

```typescript
// Import specific components
import { SignUpPage, EmailVerificationPage } from './components/auth';
import { Dashboard, WorkflowSteps } from './components/dashboard';
import { CVUploadSection } from './components/cv';
import { JobRecommendations, JobSearchSection } from './components/jobs';

// Or import all from main index
import { 
  SignUpPage, 
  Dashboard, 
  CVUploadSection, 
  JobRecommendations 
} from './components';
```

### Component Structure Example

```typescript
// Example component structure
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ props }) => {
  // State management
  // Effect hooks
  // Event handlers
  
  return (
    // JSX with Tailwind CSS styling
  );
};

export default Component;
```

---

## 🎨 Styling & Design System

- **CSS Framework**: Tailwind CSS
- **Design Principles**: 
  - Mobile-first responsive design
  - Consistent spacing and typography
  - Accessible color contrast
  - Smooth animations and transitions

### Color Palette:
- **Primary**: Blue/Sky (sky-500, sky-600)
- **Secondary**: Purple (purple-500, purple-600)
- **Success**: Green (green-500, green-600)
- **Warning**: Yellow (yellow-500, yellow-600)
- **Error**: Red (red-500, red-600)
- **Neutral**: Gray scale (gray-50 to gray-900)

---

## 📱 Responsive Design

All components are built with mobile-first responsive design:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## 🧪 State Management

- **Local State**: React hooks (useState, useEffect)
- **Authentication**: JWT tokens in localStorage
- **API State**: Custom hooks for data fetching
- **Form State**: Controlled components with validation

---

## 🔗 API Integration

Components integrate with Django REST API endpoints:

- **Authentication**: `/api/auth/`
- **CV Management**: `/api/cvs/`
- **Job Matching**: `/api/job-matches/`
- **Email Integration**: `/api/email-accounts/`
- **Job Search**: `/api/jobs/search/`

---

## 🛠️ Development Guidelines

1. **Component Naming**: Use PascalCase for component files
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Error Handling**: Implement proper error boundaries and user feedback
4. **Accessibility**: Include ARIA labels and semantic HTML
5. **Performance**: Use React.memo for expensive components
6. **Testing**: Write unit tests for critical functionality

---

## 📦 Dependencies

Key libraries used in components:

- **React**: Component framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **GSAP**: Animations
- **React Router**: Navigation

---

This organized structure makes the codebase maintainable, scalable, and easy for new developers to understand and contribute to.