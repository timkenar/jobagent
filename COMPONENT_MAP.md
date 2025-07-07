# Component Relationship Map

This document shows how components relate to each other and the data flow between them.

## 🏗️ Application Architecture Flow

```
App.tsx (Entry Point)
├── Authentication Flow
│   ├── SignUpPage
│   ├── EmailVerificationPage
│   ├── EmailVerificationRequired
│   └── OAuthCallback
│
└── Main Application (when authenticated)
    └── Dashboard
        ├── Sidebar (Navigation)
        └── Main Content Area
            ├── WorkflowSteps (Default)
            ├── JobApplicationDashboard
            └── UserProfile
                ├── CVUploadSection
                ├── JobRecommendations
                └── UserDetailsSection
```

## 🔄 Component Data Flow

### Authentication Flow:
```
SignUpPage → EmailVerificationRequired → EmailVerificationPage → Dashboard
     ↓
OAuthCallback (for Google login)
```

### CV Management Flow:
```
UserProfile → CVUploadSection → Backend API → AI Analysis → JobRecommendations
```

### Job Search Flow:
```
WorkflowSteps → JobSearchSection → Backend API → Job Results → GeneratedEmailModal
                      ↓
                CVUploadSection (CV data for enhanced search)
```

### Email Integration Flow:
```
WorkflowSteps → EmailIntegrationSection → OAuth → GmailEmailsList
                      ↓
              GeneratedEmailModal → Email Sending
```

## 📊 Component Dependencies

### High-Level Components (Layout):
- **App.tsx** - Root component, handles routing
- **Dashboard.tsx** - Main layout with sidebar
- **Sidebar.tsx** - Navigation menu

### Feature Components:

#### Authentication:
```
SignUpPage
├── Uses: LoadingSpinner, validation logic
└── Manages: User registration, login, OAuth

EmailVerificationPage
├── Uses: LoadingSpinner
└── Manages: Email verification tokens

OAuthCallback
├── Uses: LoadingSpinner
└── Manages: OAuth flow completion
```

#### CV Management:
```
CVUploadSection
├── Uses: LoadingSpinner, drag & drop logic
├── Connects to: /api/cvs/ endpoints
└── Features: File upload, AI analysis, progress tracking
```

#### Job Search & Applications:
```
JobSearchSection
├── Uses: LoadingSpinner, icons
├── Connects to: /api/jobs/search/
├── Depends on: CV data (from CVUploadSection)
└── Triggers: GeneratedEmailModal

JobRecommendations  
├── Uses: LoadingSpinner
├── Connects to: /api/job-matches/
├── Depends on: CV data
└── Features: AI-powered job matching, status tracking

JobApplicationDashboard
├── Uses: LoadingSpinner, AddApplicationForm
├── Connects to: /api/job-applications/
└── Features: Application tracking, status management

AddApplicationForm
├── Uses: Form validation
└── Features: Manual job application entry
```

#### Email Management:
```
EmailIntegrationSection
├── Uses: LoadingSpinner, OAuth flow
├── Connects to: /api/email-accounts/
└── Triggers: GmailEmailsList

GeneratedEmailModal
├── Uses: LoadingSpinner, icons
├── Connects to: /api/emails/generate/
├── Depends on: Job data, CV data
└── Features: AI email generation, editing, sending

GmailEmailsList
├── Uses: LoadingSpinner
├── Connects to: Gmail API
└── Features: Email display, filtering
```

#### User Profile:
```
UserProfile
├── Includes: CVUploadSection, JobRecommendations
├── Uses: LoadingSpinner, UserDetailsSection
└── Features: Profile stats, activity tracking

UserDetailsSection
├── Uses: Form validation
└── Features: User information management
```

## 🎯 Shared Components Usage

### LoadingSpinner:
Used across all components for async operations:
- File uploads
- API calls
- Form submissions
- Authentication flows

### EnhancedChatbot:
- Floating widget available throughout the app
- Provides AI assistance
- Context-aware help

### Icons:
- Consistent SVG icon library
- Used in buttons, navigation, status indicators
- Centralized in `/shared/icons.tsx`

## 🔌 External Dependencies

### API Integration Points:
```
Frontend Components → Custom Hooks → Axios → Django Backend
                                     ↓
                              JWT Authentication
```

### Third-Party Services:
```
CVUploadSection → Google Gemini AI (CV analysis)
JobSearchSection → Google Custom Search API (job search)
EmailIntegrationSection → Google OAuth (Gmail integration)
GeneratedEmailModal → Google Gemini AI (email generation)
```

## 📱 Responsive Component Behavior

### Desktop (lg: 1024px+):
- Full sidebar visible
- Multi-column layouts
- Expanded forms and modals

### Tablet (md: 768px - 1024px):
- Collapsible sidebar
- Two-column layouts
- Adjusted spacing

### Mobile (< 768px):
- Hidden sidebar (hamburger menu)
- Single-column layouts
- Touch-optimized interactions

## 🧩 Component Composition Patterns

### Container/Presentational:
```
Dashboard (Container)
├── Manages state and routing
└── Renders presentational components

Sidebar (Presentational)
├── Receives props for active state
└── Renders navigation UI
```

### Higher-Order Components:
```
Authentication Wrapper
├── Checks user authentication
├── Redirects if not authenticated
└── Renders protected components
```

### Custom Hooks Integration:
```
useJobSearch Hook
├── Used by: JobSearchSection, WorkflowSteps
├── Manages: Search state, results, loading states
└── Provides: Search functions, data, error states
```

## 🔄 State Management Flow

### Local Component State:
- Form inputs
- UI toggle states
- Component-specific loading states

### Shared State (Context):
```
GmailContext
├── Used by: EmailIntegrationSection, GmailEmailsList
├── Manages: Gmail connection state, email data
└── Provides: Gmail API functions
```

### Global State (localStorage):
```
Authentication State
├── JWT token
├── User information
└── Used across all protected components
```

## 🛣️ Navigation Flow

```
/ (Default Route)
├── Not Authenticated → SignUpPage
└── Authenticated → Dashboard
    ├── /workflow → WorkflowSteps
    ├── /applications → JobApplicationDashboard  
    ├── /profile → UserProfile
    ├── /verify-email → EmailVerificationPage
    └── /oauth-callback → OAuthCallback
```

This component map helps developers understand how the application is structured and how components interact with each other.