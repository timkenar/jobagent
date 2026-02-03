# API Documentation - Job Automation Platform

**Base URL**: `https://api.yourapp.com/api/v1`

## Authentication
All endpoints require: `Authorization: Bearer <access_token>`

### Auth Endpoints
- `POST /auth/register/` - Register new user
- `POST /auth/login/` - Login with email/password
- `POST /auth/refresh/` - Refresh access token
- `GET /auth/oauth/initiate/?provider=google` - Start OAuth
- `POST /auth/oauth/callback/` - Complete OAuth

## User Profile
- `GET /users/me/` - Get current user
- `PATCH /users/me/` - Update profile
- `GET /users/me/usage/` - Get usage stats

## CV Management
- `POST /cvs/` - Upload CV (triggers AI analysis)
- `GET /cvs/` - List all CVs
- `GET /cvs/{id}/` - Get CV details with analysis
- `POST /cvs/{id}/set-primary/` - Set primary CV
- `DELETE /cvs/{id}/` - Delete CV

## Job Search
- `GET /jobs/search/?q=&location=&remote_type=` - Search jobs
- `GET /jobs/matches/?min_score=70` - AI recommendations
- `GET /jobs/{id}/` - Job details
- `PATCH /jobs/matches/{id}/` - Update match status
- `POST /jobs/matches/generate/` - Generate matches (async)

## Automation
- `POST /automation/runs/` - Start automation
- `GET /automation/runs/` - List runs
- `GET /automation/runs/{id}/` - Run details
- `POST /automation/runs/{id}/cancel/` - Cancel run
- `POST /automation/platforms/test/` - Test platform login
- `POST /automation/platforms/credentials/` - Save credentials
- `GET /automation/platforms/` - Platform status

## Applications
- `GET /applications/` - List applications
- `GET /applications/{id}/` - Application details
- `PATCH /applications/{id}/` - Update application
- `GET /applications/stats/` - Statistics

## Email
- `POST /email/connect/` - Connect email account
- `GET /email/accounts/` - List accounts
- `POST /email/accounts/{id}/sync/` - Sync emails
- `POST /email/cover-letter/generate/` - Generate cover letter

## Subscriptions
- `GET /subscriptions/plans/` - List plans
- `POST /subscriptions/checkout/` - Create checkout
- `GET /subscriptions/current/` - Current subscription

## Analytics
- `GET /analytics/dashboard/?period=month` - Dashboard stats

## Example Responses

### Job Match
```json
{
  "job": {"title": "Senior Python Dev", "company": "Tech Co"},
  "overall_score": 92.5,
  "matched_skills": ["Python", "Django"],
  "missing_skills": ["Kubernetes"],
  "match_explanation": "Excellent match based on..."
}
```

### Automation Run
```json
{
  "status": "completed",
  "applications_successful": 7,
  "applications_failed": 1,
  "error_log": [...]
}
```

## Rate Limits
- Free: 60 req/min
- Pro: 120 req/min
- Premium: 300 req/min

## WebSocket
`wss://api.yourapp.com/ws/?token=<token>`

Events: `automation.completed`, `cv.analyzed`, `match.generated`
