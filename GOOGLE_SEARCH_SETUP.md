# Google Custom Search Engine Setup

This guide will help you set up Google Custom Search Engine for job searching functionality.

## Prerequisites

- Google Account
- Google Cloud Platform project (for API access)

## Step 1: Enable Google Custom Search API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**:
   - Navigate to **APIs & Services** > **Library**
   - Search for "Custom Search API"
   - Click on it and press **Enable**

## Step 2: Create API Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key
4. (Optional) Restrict the API key to only Custom Search API for security

## Step 3: Create Custom Search Engine

1. Go to [Google Custom Search Engine](https://cse.google.com/cse/)
2. Click **Add** to create a new search engine
3. Configure your search engine:
   - **Sites to search**: Leave blank to search the entire web
   - **Language**: English
   - **Name**: "Job Search Engine" (or any name you prefer)
4. Click **Create**
5. Copy the **Search Engine ID** (looks like: `017043718932720052025:3vboe_7xgrs`)

## Step 4: Configure Search Engine Settings

1. In your Custom Search Engine control panel:
   - Go to **Setup** > **Basics**
   - Enable **Search the entire web**
   - Turn **ON** the "Search the entire web but emphasize included sites" option
2. Go to **Setup** > **Advanced**:
   - Enable **Image search** (optional)
   - Enable **SafeSearch** (recommended)

## Step 5: Add Job Sites to Search (Optional but Recommended)

1. In your Custom Search Engine control panel:
   - Go to **Setup** > **Sites**
   - Add these job sites to prioritize them in search results:
     ```
     linkedin.com/jobs/*
     indeed.com
     glassdoor.com
     monster.com
     careerbuilder.com
     dice.com
     stackoverflow.com/jobs/*
     angel.co
     remote.co
     remoteok.io
     freelancer.com
     upwork.com
     brightermonday.co.ke
     fuzu.com
     ```

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Add your API credentials:
   ```env
   VITE_GOOGLE_SEARCH_API_KEY=your_api_key_here
   VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   ```

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to the Job Recommendations page
3. Click on the "Google Search" tab
4. Enter a job title and location
5. Click "Search Google Jobs"

## API Limits and Pricing

- **Free Tier**: 100 queries per day
- **Paid Tier**: $5 per 1,000 queries (up to 10,000 queries per day maximum)
- For higher volume, consider implementing caching or rate limiting

## Troubleshooting

### Common Issues:

1. **"API key not valid"**:
   - Ensure your API key is correct
   - Check that Custom Search API is enabled
   - Verify API key restrictions

2. **"Search Engine ID not found"**:
   - Double-check your Search Engine ID
   - Ensure the search engine is active

3. **"No results found"**:
   - Try broader search terms
   - Check if "Search the entire web" is enabled
   - Verify your search engine configuration

4. **CORS errors**:
   - Custom Search API should work from frontend
   - If issues persist, consider proxying through your backend

### Testing API Directly:

You can test your API setup using this URL structure:
```
https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_ID&q=software+developer+jobs
```

## Advanced Configuration

### Custom Search Parameters:

The service supports additional search parameters:
- `dateRestrict`: Filter by date (e.g., "d1" for last day, "w1" for last week)
- `gl`: Geographic location (e.g., "us", "ke")
- `lr`: Language restriction (e.g., "lang_en")
- `safe`: SafeSearch level ("active", "off")

### Job Site Optimization:

For better job results, the service automatically:
- Adds job-specific keywords to queries
- Filters results to job-related content
- Extracts job metadata (salary, skills, requirements)
- Calculates relevance scores

## Security Best Practices

1. **Restrict API Key**: In Google Cloud Console, restrict your API key to:
   - Specific APIs (Custom Search API only)
   - Specific websites (your domain)
   - Specific IP addresses (if applicable)

2. **Environment Variables**: Never commit API keys to version control
3. **Rate Limiting**: Implement client-side rate limiting to avoid quota exhaustion
4. **Error Handling**: Implement proper error handling for API failures

## Integration with Backend

To save Google search results to your backend:

1. Create a new API endpoint in your Django backend
2. Modify the `searchGoogleJobs` function to save results
3. Add job tracking and application features

Example backend endpoint:
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_google_job(request):
    # Save Google job search result to database
    # Return saved job ID for tracking
    pass
```

## Support

For issues with:
- **Google API**: Check [Google Custom Search documentation](https://developers.google.com/custom-search/v1/overview)
- **Application**: Create an issue in the project repository
- **Billing**: Contact Google Cloud Support

## Additional Resources

- [Google Custom Search Engine Help](https://support.google.com/customsearch/)
- [Custom Search API Reference](https://developers.google.com/custom-search/v1/reference/rest)
- [Google Cloud Console](https://console.cloud.google.com/)