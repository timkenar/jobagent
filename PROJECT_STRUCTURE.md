# AI Job Search Email Assistant - Project Structure

This document provides a comprehensive overview of the project structure and codebase organization.

## 🏗️ Project Overview

A full-stack AI-powered job search assistant that helps users:
- Upload and analyze CVs using AI
- Search for relevant jobs
- Generate personalized application emails
- Track job applications and recommendations
- Integrate with Gmail for automated workflows

## 📁 Root Directory Structure

```
ai-job-search-email-assistant/
├── components/                 # Frontend React components (organized by feature)
├── src/                       # Frontend source code
│   ├── hooks/                 # Custom React hooks
│   ├── contexts/              # React context providers
│   ├── services/              # API service functions
│   └── constants/             # Application constants
├── types.ts                   # TypeScript type definitions
├── App.tsx                    # Main React application component
├── index.tsx                  # Application entry point
├── package.json               # Frontend dependencies
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
└── README.md                  # Project documentation
```

## 🎯 Frontend Architecture (`/components`)

### Organized by Feature Domains

```
components/
├── auth/                      # Authentication & Authorization
│   ├── SignUpPage.tsx         # User registration and sign-in
│   ├── EmailVerificationPage.tsx # Email verification interface
│   ├── EmailVerificationRequired.tsx # Verification warnings
│   ├── OAuthCallback.tsx      # OAuth callback handler
│   ├── OAuthDebug.tsx         # OAuth debugging
│   └── index.ts               # Auth components exports
│
├── dashboard/                 # Main Dashboard & Workflow
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── WorkflowSteps.tsx      # Step-by-step workflow
│   └── index.ts               # Dashboard components exports
│
├── email/                     # Email Integration & Management
│   ├── EmailIntegrationSection.tsx # Account connection
│   ├── GeneratedEmailModal.tsx # AI email preview/editing
│   ├── GmailEmailsList.tsx    # Gmail management
│   └── index.ts               # Email components exports
│
├── jobs/                      # Job Search & Applications
│   ├── JobSearchSection.tsx   # Job search interface
│   ├── JobApplicationDashboard.tsx # Application tracking
│   ├── JobRecommendations.tsx # AI-powered recommendations
│   ├── AddApplicationForm.tsx # Manual application entry
│   └── index.ts               # Job components exports
│
├── cv/                        # CV Upload & Management
│   ├── CVUploadSection.tsx    # Drag & drop CV upload
│   └── index.ts               # CV components exports
│
├── profile/                   # User Profile & Settings
│   ├── UserProfile.tsx        # Main profile page
│   ├── UserDetailsSection.tsx # User information
│   └── index.ts               # Profile components exports
│
├── shared/                    # Reusable Components
│   ├── LoadingSpinner.tsx     # Loading indicators
│   ├── EnhancedChatbot.tsx    # AI chatbot widget
│   ├── icons.tsx              # SVG icon components
│   ├── chatbot.jsx            # Basic chatbot
│   └── index.ts               # Shared components exports
│
├── layout/                    # Layout & Navigation
│   ├── Sidebar.tsx            # Main navigation sidebar
│   └── index.ts               # Layout components exports
│
├── index.ts                   # Main components export
└── README.md                  # Components documentation
```

## 🔧 Source Code Organization (`/src`)

```
src/
├── hooks/                     # Custom React Hooks
│   ├── useJobSearch.ts        # Job search state management
│   └── [other custom hooks]
│
├── contexts/                  # React Context Providers
│   ├── GmailContext.tsx       # Gmail integration context
│   └── [other contexts]
│
├── services/                  # API Service Functions
│   ├── geminiService.ts       # AI service integration
│   ├── gmailService.ts        # Gmail API service
│   └── [other services]
│
└── constants/                 # Application Constants
    ├── emailTemplate.ts       # Email templates
    └── [other constants]
```

## 🎨 Design System & Styling

### Technology Stack:
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP (GreenSock)
- **Icons**: Custom SVG components
- **Build Tool**: Vite

### Design Principles:
- **Mobile-First**: Responsive design for all screen sizes
- **Accessibility**: ARIA labels and semantic HTML
- **Consistency**: Unified color palette and spacing
- **Performance**: Optimized components and lazy loading

### Color System:
```css
/* Primary Colors */
--primary-blue: #0284c7 (sky-600)
--primary-purple: #7c3aed (purple-600)

/* Status Colors */
--success: #059669 (green-600)
--warning: #d97706 (yellow-600)
--error: #dc2626 (red-600)

/* Neutral Colors */
--gray-50 to --gray-900 (Gray scale)
```

## 🔄 Data Flow Architecture

### State Management:
1. **Local Component State**: React hooks (useState, useEffect)
2. **Global State**: React Context for cross-component data
3. **Server State**: Custom hooks for API data fetching
4. **Authentication State**: JWT tokens in localStorage

### API Integration Flow:
```
Frontend Components → Custom Hooks → API Services → Django Backend
```

### Key Data Flows:
1. **Authentication**: JWT token management
2. **CV Processing**: File upload → AI analysis → Database storage
3. **Job Search**: Query → External APIs → AI processing → Results
4. **Email Generation**: Job data + CV data → AI → Generated email

## 🌐 Backend Integration Points

The frontend integrates with Django REST API endpoints:

```
Authentication:
- POST /api/auth/signup/
- POST /api/auth/login/
- POST /api/auth/logout/

CV Management:
- GET /api/cvs/active/
- POST /api/cvs/
- DELETE /api/cvs/{id}/

Job Matching:
- GET /api/job-matches/
- POST /api/job-matches/find_matches/

Email Integration:
- GET /api/email-accounts/
- POST /api/email-accounts/

Job Search:
- POST /api/jobs/search/
- POST /api/emails/generate/
```

## 🚀 Component Usage Patterns

### Import Patterns:
```typescript
// Feature-specific imports
import { SignUpPage, EmailVerificationPage } from './components/auth';
import { CVUploadSection } from './components/cv';
import { JobRecommendations } from './components/jobs';

// Centralized imports
import { 
  SignUpPage, 
  CVUploadSection, 
  JobRecommendations 
} from './components';
```

### Component Structure:
```typescript
interface ComponentProps {
  // Props with TypeScript interfaces
}

const Component: React.FC<ComponentProps> = ({ props }) => {
  // Hooks and state management
  const [state, setState] = useState();
  
  // Effect hooks
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = () => {
    // Event logic
  };
  
  return (
    <div className="tailwind-classes">
      {/* JSX with Tailwind styling */}
    </div>
  );
};

export default Component;
```

## 🔐 Security Considerations

### Frontend Security:
- JWT token storage and validation
- Input sanitization and validation
- HTTPS-only communication
- XSS protection through React's built-in escaping

### API Security:
- Authentication required for protected endpoints
- File upload validation and scanning
- Rate limiting on AI API calls
- CORS configuration for frontend access

## 📱 Responsive Design Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## 🧪 Development Workflow

### Getting Started:
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

### Code Organization Guidelines:
1. **Feature-based organization** over file-type organization
2. **Consistent naming conventions** (PascalCase for components)
3. **TypeScript interfaces** for all props and data structures
4. **Centralized exports** through index.ts files
5. **Modular components** with single responsibility

### Best Practices:
- Use TypeScript for type safety
- Implement proper error handling
- Write descriptive component and prop names
- Keep components small and focused
- Use custom hooks for complex logic
- Follow accessibility guidelines

## 📦 Key Dependencies

### Core Dependencies:
- `react` - UI framework
- `typescript` - Type safety
- `tailwindcss` - Styling
- `axios` - HTTP client
- `react-router-dom` - Navigation

### Development Dependencies:
- `vite` - Build tool
- `@types/*` - TypeScript definitions
- `eslint` - Code linting
- `prettier` - Code formatting

This organized structure ensures the codebase is maintainable, scalable, and easy for developers to understand and contribute to.