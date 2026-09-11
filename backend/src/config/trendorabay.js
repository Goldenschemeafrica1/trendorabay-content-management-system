require('dotenv').config();

const trendorabayConfig = {
  // Google Analytics Configuration
  gaPropertyId: process.env.GA_PROPERTY_ID || null,
  gaViewId: process.env.GA_VIEW_ID || null,
  
  // Google Analytics API credentials
  gaClientId: process.env.GA_CLIENT_ID || null,
  gaClientSecret: process.env.GA_CLIENT_SECRET || null,
  gaRefreshToken: process.env.GA_REFRESH_TOKEN || null,
  
  // Alternative: Service Account authentication
  gaServiceAccountEmail: process.env.GA_SERVICE_ACCOUNT_EMAIL || null,
  gaServiceAccountKey: process.env.GA_SERVICE_ACCOUNT_KEY || null,
  
  // Date range for analytics data (default: last 30 days)
  dateRange: process.env.GA_DATE_RANGE || '30days',
  
  // Timeout for requests (in milliseconds)
  timeout: process.env.GA_TIMEOUT || 10000,
  
  // Whether to use mock data if API fails
  useMockData: process.env.GA_USE_MOCK_DATA === 'true' || false,
  
  // Cache duration for analytics data (in seconds)
  cacheDuration: process.env.GA_CACHE_DURATION || 300
};

module.exports = trendorabayConfig;
