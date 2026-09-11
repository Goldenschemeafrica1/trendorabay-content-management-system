# Trendorabay Analytics Integration (Google Analytics)

This document explains how to configure the CMS to fetch traffic analytics data from Google Analytics for the Trendorabay website.

## Overview

The CMS now supports fetching analytics data from Google Analytics to display traffic analytics in the CMS dashboard. This includes:

- **Analytics Summary**: Total page views, unique visitors, and average time on page
- **Traffic Sources**: Breakdown of where traffic comes from (organic search, direct, social media, referral)
- **Device Types**: Distribution of devices used by visitors (desktop, mobile, tablet)
- **Countries**: Geographic distribution of visitors

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Google Analytics Configuration
GA_PROPERTY_ID=your_ga_property_id
GA_VIEW_ID=your_ga_view_id
GA_CLIENT_ID=your_oauth_client_id
GA_CLIENT_SECRET=your_oauth_client_secret
GA_REFRESH_TOKEN=your_oauth_refresh_token
GA_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GA_SERVICE_ACCOUNT_KEY=your_service_account_private_key
GA_DATE_RANGE=30days
GA_TIMEOUT=10000
GA_USE_MOCK_DATA=true
GA_CACHE_DURATION=300
```

### Environment Variable Details

**Required:**
- **GA_VIEW_ID**: The Google Analytics View ID (e.g., `123456789`)

**Authentication (choose one method):**

**OAuth2 Method:**
- **GA_CLIENT_ID**: OAuth2 client ID from Google Cloud Console
- **GA_CLIENT_SECRET**: OAuth2 client secret from Google Cloud Console
- **GA_REFRESH_TOKEN**: OAuth2 refresh token (obtained during OAuth flow)

**Service Account Method:**
- **GA_SERVICE_ACCOUNT_EMAIL**: Service account email (e.g., `xxx@xxx.iam.gserviceaccount.com`)
- **GA_SERVICE_ACCOUNT_KEY**: Service account private key (full key with newlines preserved)

**Optional:**
- **GA_PROPERTY_ID**: Google Analytics Property ID (optional, for reference)
- **GA_DATE_RANGE**: Date range for analytics data (default: `30days`)
- **GA_TIMEOUT**: Request timeout in milliseconds (default: `10000`)
- **GA_USE_MOCK_DATA**: Set to `true` to use mock data if the API fails (default: `false`)
- **GA_CACHE_DURATION**: Cache duration for analytics data in seconds (default: `300`)

## Setting Up Google Analytics API Access

### Option 1: OAuth2 Authentication

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Analytics API**
   - Navigate to APIs & Services > Library
   - Search for "Google Analytics Reporting API"
   - Enable the API

3. **Create OAuth2 Credentials**
   - Go to APIs & Services > Credentials
   - Create credentials > OAuth client ID
   - Application type: Web application
   - Add authorized redirect URIs if needed
   - Save the Client ID and Client Secret

4. **Obtain Refresh Token**
   - Use OAuth2 flow to obtain authorization code
   - Exchange authorization code for refresh token
   - Store the refresh token in `GA_REFRESH_TOKEN`

### Option 2: Service Account Authentication

1. **Create a Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to IAM & Admin > Service Accounts
   - Create a new service account
   - Note the service account email

2. **Generate Service Account Key**
   - Click on the service account
   - Go to Keys tab
   - Add Key > Create new key
   - Select JSON format
   - Download and save the key file
   - Copy the private key from the JSON file to `GA_SERVICE_ACCOUNT_KEY`

3. **Grant Access to Google Analytics**
   - Go to [Google Analytics Admin](https://analytics.google.com/admin/)
   - Select the property/view
   - Go to User Management
   - Add the service account email with "Read & Analyze" permissions

4. **Find Your View ID**
   - In Google Analytics, go to Admin > View Settings
   - Copy the View ID (e.g., `123456789`)

## How It Works

### Service Layer

The `trendorabayService.js` service handles all communication with Google Analytics:

- **Caching**: Implements in-memory caching to reduce API calls
- **Error Handling**: Falls back to mock data if configured and the API fails
- **Authentication**: Supports both OAuth2 and Service Account authentication
- **Data Transformation**: Converts GA API responses to the format expected by the frontend

### Google Analytics API Queries

The service uses the Google Analytics Reporting API v4 to fetch:

1. **Analytics Summary**: `ga:sessions`, `ga:users`, `ga:avgSessionDuration`
2. **Traffic Sources**: `ga:sessions` grouped by `ga:channelGrouping`
3. **Device Types**: `ga:sessions` grouped by `ga:deviceCategory`
4. **Countries**: `ga:sessions` grouped by `ga:country`

### CMS API Routes

The CMS provides the following routes to fetch Trendorabay analytics:

- `GET /api/analytics/trendorabay/summary` - Get analytics summary
- `GET /api/analytics/trendorabay/traffic-sources` - Get traffic sources
- `GET /api/analytics/trendorabay/device-types` - Get device types
- `GET /api/analytics/trendorabay/countries` - Get countries

All routes require authentication.

## Frontend Integration

The Analytics page (`frontend/src/pages/Analytics.jsx`) includes a toggle to switch between CMS and Trendorabay data:

- **CMS**: Shows analytics data from the CMS database
- **Trendorabay**: Shows analytics data fetched from Google Analytics

## Development Mode

During development, set `GA_USE_MOCK_DATA=true` to use mock data instead of making real API calls. This is useful when:

- Google Analytics credentials are not yet configured
- Testing the UI without affecting production data
- Working offline

## Production Setup

For production:

1. Set `GA_USE_MOCK_DATA=false`
2. Configure either OAuth2 or Service Account authentication
3. Set the correct `GA_VIEW_ID`
4. Adjust `GA_CACHE_DURATION` based on your needs (higher values reduce API load)
5. Ensure the service account or OAuth client has proper permissions

## Troubleshooting

### Authentication Errors

If you receive authentication errors:

1. **For OAuth2**: Verify `GA_CLIENT_ID`, `GA_CLIENT_SECRET`, and `GA_REFRESH_TOKEN` are correct
2. **For Service Account**: Verify `GA_SERVICE_ACCOUNT_EMAIL` and `GA_SERVICE_ACCOUNT_KEY` are correct
3. Ensure the service account has "Read & Analyze" permissions in Google Analytics
4. Check that the Analytics API is enabled in Google Cloud Console

### View ID Issues

If you receive errors about the View ID:

1. Verify `GA_VIEW_ID` is correct (numeric ID, not property ID)
2. Ensure the view exists in your Google Analytics account
3. Check that the authenticated user/service account has access to this view

### Data Not Updating

If analytics data seems stale:

1. Check the `GA_CACHE_DURATION` setting
2. Reduce cache duration for more frequent updates
3. Manually clear the cache by restarting the server
4. Verify Google Analytics is receiving data from your website

### API Quota Issues

If you hit API quota limits:

1. Increase `GA_CACHE_DURATION` to reduce API calls
2. Consider implementing persistent caching (Redis)
3. Review Google Analytics API quota in Google Cloud Console

## Files Modified

- `backend/src/config/trendorabay.js` - Google Analytics configuration
- `backend/src/services/trendorabayService.js` - Service for fetching GA data
- `backend/src/routes/analytics.js` - Updated to use Trendorabay service
- `backend/package.json` - Added googleapis dependency
- `backend/.env.example` - Added Google Analytics environment variables

## Future Enhancements

Potential improvements for the integration:

- Add support for Google Analytics 4 (GA4) API
- Implement persistent caching (Redis)
- Add historical data tracking and trends
- Support for custom date ranges in the UI
- Real-time data updates via webhooks
- Support for multiple Google Analytics views
