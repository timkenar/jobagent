# Subscription Module

A comprehensive subscription management system with Paystack integration for the AI Job Search Email Assistant.

## Overview

This module provides a complete subscription management solution including:
- Subscription plan management
- Payment processing with Paystack
- Usage tracking and limits
- Feature gating
- Billing history
- User dashboard

## Components Structure

```
components/subscriptions/
├── context/
│   └── SubscriptionContext.tsx     # Global subscription state management
├── services/
│   └── subscriptionService.ts      # API service for subscription operations
├── components/
│   ├── PlanCard.tsx               # Individual subscription plan card
│   ├── UsageCard.tsx              # Usage statistics display
│   └── FeatureGate.tsx            # Feature access control component
├── pages/
│   ├── PlansPage.tsx              # Available subscription plans
│   ├── DashboardPage.tsx          # User subscription dashboard
│   ├── BillingPage.tsx            # Payment history and billing
│   ├── SettingsPage.tsx           # Subscription settings
│   └── PaymentCallbackPage.tsx    # Payment verification page
├── types.ts                       # TypeScript type definitions
└── README.md                      # This file
```

## Quick Start

### 1. Install Dependencies

The subscription module requires React Router for navigation:

```bash
npm install react-router-dom
```

### 2. Add Context Provider

Wrap your application with the SubscriptionProvider:

```tsx
import { SubscriptionProvider } from './components/subscriptions/context/SubscriptionContext';

function App() {
  return (
    <SubscriptionProvider>
      {/* Your app components */}
    </SubscriptionProvider>
  );
}
```

### 3. Add Routes

Add subscription routes to your router:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PlansPage from './components/subscriptions/pages/PlansPage';
import DashboardPage from './components/subscriptions/pages/DashboardPage';
import BillingPage from './components/subscriptions/pages/BillingPage';
import SettingsPage from './components/subscriptions/pages/SettingsPage';
import PaymentCallbackPage from './components/subscriptions/pages/PaymentCallbackPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/subscriptions/plans" element={<PlansPage />} />
        <Route path="/subscriptions/dashboard" element={<DashboardPage />} />
        <Route path="/subscriptions/billing" element={<BillingPage />} />
        <Route path="/subscriptions/settings" element={<SettingsPage />} />
        <Route path="/subscriptions/callback" element={<PaymentCallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4. Configure API Base URL

Update your API configuration to match your backend:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    SUBSCRIPTIONS: '/api/subscriptions/',
    // ... other endpoints
  }
};
```

## Usage Examples

### Feature Gating

Protect features based on subscription limits:

```tsx
import { FeatureGate } from './components/subscriptions/components/FeatureGate';

function JobApplicationForm() {
  return (
    <FeatureGate feature="job_applications" amount={1}>
      <form>
        {/* Job application form */}
      </form>
    </FeatureGate>
  );
}
```

### Usage Tracking

Display usage statistics:

```tsx
import { UsageCard } from './components/subscriptions/components/UsageCard';
import { useSubscription } from './components/subscriptions/context/SubscriptionContext';

function UsageOverview() {
  const { stats } = useSubscription();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats && Object.entries(stats.usage_stats).map(([feature, usage]) => (
        <UsageCard
          key={feature}
          feature={feature as any}
          usage={usage}
        />
      ))}
    </div>
  );
}
```

### Check Subscription Status

```tsx
import { useSubscription } from './components/subscriptions/context/SubscriptionContext';

function MyComponent() {
  const { currentSubscription, canUseFeature } = useSubscription();
  
  const canUploadCV = canUseFeature('cv_uploads', 1);
  const hasActiveSubscription = currentSubscription?.status === 'active';
  
  return (
    <div>
      {hasActiveSubscription ? (
        <p>You have an active subscription!</p>
      ) : (
        <p>Please subscribe to continue.</p>
      )}
      
      {canUploadCV ? (
        <button>Upload CV</button>
      ) : (
        <button disabled>CV Upload Limit Reached</button>
      )}
    </div>
  );
}
```

## Backend Setup

### 1. Environment Variables
Add these to your Django `.env` file:
```bash
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
FRONTEND_URL=http://localhost:5173
```

### 2. Database Setup
```bash
python manage.py makemigrations subscriptions
python manage.py migrate
python manage.py create_subscription_plans
```

### 3. API Endpoints
- `GET /api/subscriptions/plans/` - List subscription plans
- `GET /api/subscriptions/subscriptions/` - User subscriptions
- `GET /api/subscriptions/stats/` - Subscription statistics
- `POST /api/subscriptions/payments/initialize/` - Initialize payment
- `POST /api/subscriptions/payments/verify/` - Verify payment
- `POST /api/subscriptions/webhook/paystack/` - Paystack webhook

## Feature Access Control

### Backend Usage Tracking
```python
from subscriptions.services import can_user_access_feature, use_feature

# Check if user can use feature
if can_user_access_feature(request.user, 'job_applications'):
    # Create job application
    use_feature(request.user, 'job_applications')
else:
    return Response({'error': 'Subscription limit reached'}, 
                   status=status.HTTP_402_PAYMENT_REQUIRED)
```

### Frontend Feature Gates
```tsx
import { useSubscription } from './components/subscriptions/context/SubscriptionContext';

function JobApplicationButton() {
  const { canUseFeature } = useSubscription();
  
  if (!canUseFeature('job_applications')) {
    return (
      <button onClick={() => window.location.href = '/subscriptions/plans'}>
        Upgrade to Apply
      </button>
    );
  }
  
  return <button onClick={applyToJob}>Apply Now</button>;
}
```

## Subscription Plans

### Default Plans
The system comes with predefined plans:

1. **Free** - 10 applications, 1 CV, 1 email account, 20 AI requests
2. **Basic** - 50 applications, 3 CVs, 2 email accounts, 100 AI requests
3. **Professional** - 150 applications, 5 CVs, 5 email accounts, 300 AI requests
4. **Enterprise** - 500 applications, 10 CVs, 10 email accounts, 1000 AI requests

### Custom Plans
Create custom plans via Django admin or API:
```python
plan = SubscriptionPlan.objects.create(
    name="Custom Plan",
    price=4999.00,
    currency="NGN",
    billing_cycle="monthly",
    max_job_applications=100,
    max_cv_uploads=5,
    max_email_accounts=3,
    ai_requests_limit=200
)
```

## Paystack Integration

### Test Cards
Use these test cards for testing:
- **Success**: 4084084084084081
- **Declined**: 4084084084084081 (with insufficient funds)
- **Invalid**: 4084084084084082

### Webhook Setup
1. Go to Paystack Dashboard > Settings > Webhooks
2. Add endpoint: `https://yourdomain.com/api/subscriptions/webhook/paystack/`
3. Copy webhook secret to environment variables

### Currency Support
Configure supported currencies in Paystack dashboard:
- NGN (Nigerian Naira) - Primary
- USD (US Dollar) - International
- GHS (Ghana Cedi) - Regional

## Monitoring & Analytics

### Usage Reports
```python
# Get subscription statistics
python manage.py subscription_stats

# Check expired subscriptions
python manage.py check_expired_subscriptions

# Reset monthly usage
python manage.py reset_monthly_usage
```

### Error Handling
The system includes comprehensive error handling:
- Payment failures
- Network issues
- Invalid subscriptions
- Webhook verification failures

## Security Features

- ✅ JWT authentication required
- ✅ Webhook signature verification
- ✅ Rate limiting on subscription changes
- ✅ Secure payment processing
- ✅ Input validation and sanitization

## Testing

### Run Backend Tests
```bash
python manage.py test subscriptions
```

### Test Paystack Integration
```bash
python test_paystack.py
```

### Frontend Testing
Use the `SubscriptionTest` component to verify frontend integration:
```tsx
import { SubscriptionTest } from './components/subscription/SubscriptionTest';

<SubscriptionTest />
```

## Troubleshooting

### Common Issues

1. **Currency not supported**
   - Configure currencies in Paystack dashboard
   - Update plan currency settings

2. **Webhook not receiving events**
   - Verify webhook URL is accessible
   - Check webhook secret configuration

3. **Payment initialization fails**
   - Verify Paystack keys are correct
   - Check user authentication

4. **Feature access denied**
   - Check subscription status
   - Verify usage limits
   - Ensure subscription is active

### Debug Mode
Enable debug logging in Django settings:
```python
LOGGING = {
    'loggers': {
        'subscriptions': {
            'level': 'DEBUG',
            'handlers': ['console'],
        },
    },
}
```

## Support

For issues or questions:
1. Check the logs for error details
2. Verify Paystack dashboard for payment status
3. Test with the provided test components
4. Review API responses for error messages

## Roadmap

Future enhancements:
- [ ] Proration for plan changes
- [ ] Multi-currency support
- [ ] Invoice generation
- [ ] Usage analytics dashboard
- [ ] Subscription pausing/resuming
- [ ] Bulk subscription management