# AI Job Search Email Assistant

An intelligent job search application with Gmail integration for automatic job application tracking.

## Features

- 🔍 **Smart Job Search**: AI-powered job discovery with personalized recommendations
- 📧 **Gmail Integration**: Automatic tracking of job applications from your Gmail
- 🔐 **OAuth Authentication**: Secure Gmail access with OAuth 2.0
- 📊 **Application Tracking**: Monitor job application status and progress
- 🤖 **AI Email Generation**: Generate personalized job application emails

## Run Locally

**Prerequisites:** Node.js 16+ and Python 3.8+

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ../job_search_app
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5173/oauth-callback
   ```

4. Run Django server:
   ```bash
   python manage.py runserver
   ```

## Gmail OAuth Integration

### Setup Gmail OAuth

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API

2. **Configure OAuth Consent Screen**:
   - Go to APIs & Services > OAuth consent screen
   - Configure your app details
   - Add scopes: `gmail.readonly`, `gmail.send`, `userinfo.email`

3. **Create OAuth Credentials**:
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:5173/oauth-callback` (development)
     - `https://yourdomain.com/oauth-callback` (production)

### Frontend Integration

The `EmailIntegrationSection` component handles the OAuth flow:

```typescript
// OAuth initialization
const handleConnect = async (provider: 'gmail' | 'outlook') => {
  const res = await axios.get(`/api/email-accounts/oauth-init/?provider=${provider}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Open OAuth popup window
  const popup = window.open(res.data.oauth_url, 'oauthPopup', 'width=500,height=600');
};

// Handle OAuth callback via postMessage
useEffect(() => {
  function handleMessage(event: MessageEvent) {
    if (event.data?.type === 'gmail_oauth_code' && event.data.code) {
      // Exchange code for tokens
      axios.post('/api/email-accounts/gmail-oauth-callback/', {
        code: event.data.code,
        redirect_uri: window.location.origin + '/api/email-accounts/gmail-oauth-callback/',
      });
    }
  }
  window.addEventListener('message', handleMessage);
}, []);
```

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/email-accounts/oauth-init/` | GET | Initialize OAuth flow |
| `/api/email-accounts/gmail-oauth-callback/` | POST | Handle OAuth callback |
| `/api/email-accounts/` | GET | List connected accounts |
| `/api/email-accounts/{id}/gmail-emails/` | GET | Fetch Gmail emails |

### OAuth Flow

1. **Initialize**: Frontend calls `/api/email-accounts/oauth-init/?provider=gmail`
2. **Redirect**: User redirects to Google OAuth consent screen
3. **Authorize**: User grants permissions for Gmail access
4. **Callback**: Google redirects to your callback URL with authorization code
5. **Exchange**: Backend exchanges code for access/refresh tokens
6. **Store**: Tokens stored securely in database
7. **Access**: Use tokens to make Gmail API calls

### Security Features

- ✅ **Secure Token Storage**: Refresh tokens stored securely in database
- ✅ **Automatic Token Refresh**: Tokens refreshed automatically when expired
- ✅ **Scope Limitation**: Only request necessary Gmail permissions
- ✅ **CSRF Protection**: State parameter prevents CSRF attacks
- ✅ **Popup-based Flow**: Reduces redirect-based security risks

### Error Handling

The integration includes comprehensive error handling:

```typescript
// Frontend error states
- Authentication required
- Popup blocked
- OAuth initialization failed
- Token exchange failed
- API rate limits

// Backend error handling
- Invalid client credentials
- Expired authorization codes
- Token refresh failures
- Gmail API errors
```

### Troubleshooting

**Common Issues:**

1. **"Authentication required"**: User not logged into your app
2. **"Popup blocked"**: Browser blocking popup windows
3. **"Invalid redirect URI"**: Redirect URI not configured in Google Console
4. **"Access denied"**: User denied Gmail permissions
5. **"Invalid client"**: Incorrect Google Client ID/Secret

**Solutions:**

- Ensure user is authenticated before OAuth flow
- Add your domain to popup allowlist
- Verify redirect URIs match exactly in Google Console
- Check Google Cloud Console for API quotas and limits
- Validate environment variables are set correctly

## Environment Variables

Create a `.env` file with:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth-callback

# Gmail API Configuration
GMAIL_API_SCOPES=gmail.readonly,gmail.send,userinfo.email

# Backend API URL
VITE_API_URL=http://localhost:8000

# Other API Keys
GEMINI_API_KEY=your_gemini_api_key
```

## Deployment

### Frontend Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Update environment variables for production:
   ```bash
   GOOGLE_REDIRECT_URI=https://yourdomain.com/oauth-callback
   VITE_API_URL=https://your-api-domain.com
   ```

### Backend Deployment

1. Update Django settings for production
2. Configure OAuth redirect URIs for production domain
3. Set secure environment variables
4. Enable HTTPS (required for OAuth)

## License

This project is licensed under the MIT License.
