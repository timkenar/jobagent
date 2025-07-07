# Developer Guide - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Finding Components

### By Feature:
```
Need authentication? → /components/auth/
Need job search? → /components/jobs/
Need CV upload? → /components/cv/
Need email features? → /components/email/
Need layout elements? → /components/layout/
Need reusable components? → /components/shared/
```

### Import Examples:
```typescript
// Import specific feature components
import { SignUpPage } from './components/auth';
import { CVUploadSection } from './components/cv';
import { JobRecommendations } from './components/jobs';

// Import from main index (recommended)
import { SignUpPage, CVUploadSection, JobRecommendations } from './components';
```

## 🏗️ Adding New Components

### 1. Choose the right folder:
- **Authentication**: `/auth`
- **Job-related**: `/jobs`
- **CV-related**: `/cv`
- **Email-related**: `/email`
- **Profile/User**: `/profile`
- **Reusable**: `/shared`
- **Layout**: `/layout`

### 2. Create component file:
```typescript
// components/[folder]/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  // Define props with TypeScript
}

const NewComponent: React.FC<NewComponentProps> = ({ props }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Component content */}
    </div>
  );
};

export default NewComponent;
```

### 3. Add to folder's index.ts:
```typescript
// components/[folder]/index.ts
export { default as NewComponent } from './NewComponent';
```

## 🎨 Styling Guidelines

### Use Tailwind CSS classes:
```typescript
// Good
<div className="bg-white rounded-lg shadow-md p-6 mb-4">

// Layout
<div className="flex items-center justify-between">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">

// States
<button className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50">
```

### Color System:
```typescript
// Primary actions
className="bg-sky-600 hover:bg-sky-700 text-white"

// Success states
className="bg-green-500 text-green-800"

// Warning states  
className="bg-yellow-500 text-yellow-800"

// Error states
className="bg-red-500 text-red-800"
```

## 🔧 Common Patterns

### API Calls:
```typescript
import axios from 'axios';

const fetchData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get('/api/endpoint', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### Loading States:
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleAction = async () => {
  setLoading(true);
  setError('');
  try {
    await apiCall();
  } catch (err) {
    setError('Something went wrong');
  } finally {
    setLoading(false);
  }
};
```

### Form Handling:
```typescript
const [formData, setFormData] = useState({ field: '' });

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Handle form submission
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};
```

## 🧩 Key Components Overview

### Authentication:
- `SignUpPage` - User registration/login
- `EmailVerificationPage` - Email verification flow

### Job Search:
- `JobSearchSection` - Search interface with CV integration
- `JobRecommendations` - AI-powered job matches
- `JobApplicationDashboard` - Application tracking

### CV Management:
- `CVUploadSection` - Drag & drop upload with AI analysis

### Email:
- `EmailIntegrationSection` - Gmail/Outlook connection
- `GeneratedEmailModal` - AI email generation and editing

### Layout:
- `Dashboard` - Main app layout
- `Sidebar` - Navigation menu

### Shared:
- `LoadingSpinner` - Loading indicators
- `EnhancedChatbot` - AI chat widget

## 🔌 API Endpoints

### Authentication:
```typescript
POST /api/auth/signup/     // User registration
POST /api/auth/login/      // User login
POST /api/auth/logout/     // User logout
```

### CV Management:
```typescript
GET  /api/cvs/active/      // Get active CV
POST /api/cvs/             // Upload new CV
PATCH /api/cvs/{id}/       // Update CV
DELETE /api/cvs/{id}/      // Delete CV
```

### Job Search:
```typescript
POST /api/jobs/search/     // Search for jobs
GET  /api/job-matches/     // Get job matches
POST /api/job-matches/find_matches/  // Find new matches
```

### Email:
```typescript
GET  /api/email-accounts/  // Get connected accounts
POST /api/emails/generate/ // Generate AI email
```

## 🐛 Common Issues & Solutions

### Import Errors:
```typescript
// Wrong
import Component from './Component';

// Right (with new structure)
import { Component } from '../components/jobs';
// or
import { Component } from '../components';
```

### Missing Props:
```typescript
// Always define interfaces
interface ComponentProps {
  required: string;
  optional?: number;
}
```

### Styling Issues:
```typescript
// Use consistent spacing
className="p-4 mb-6"     // padding and margin
className="space-y-4"    // vertical spacing between children
className="gap-4"        // grid/flex gap
```

## 📱 Responsive Design

### Mobile-First Approach:
```typescript
// Start with mobile, then add larger breakpoints
className="w-full md:w-1/2 lg:w-1/3"
className="flex flex-col md:flex-row"
className="text-sm md:text-base lg:text-lg"
```

### Common Breakpoints:
- `sm:` 640px and up
- `md:` 768px and up  
- `lg:` 1024px and up
- `xl:` 1280px and up

## 🔄 State Management Tips

### Local State:
```typescript
const [data, setData] = useState(initialValue);
```

### Effect Hooks:
```typescript
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

### Custom Hooks:
```typescript
// Extract complex logic into custom hooks
const { data, loading, error } = useJobSearch();
```

## 🧪 Testing Guidelines

### Component Structure:
1. Imports
2. Interface definitions
3. Component function
4. State and effects
5. Event handlers
6. Render logic
7. Export

### Error Handling:
```typescript
try {
  // API call
} catch (error) {
  console.error('Error:', error);
  setError('User-friendly message');
}
```

This guide should help you navigate and contribute to the codebase efficiently!