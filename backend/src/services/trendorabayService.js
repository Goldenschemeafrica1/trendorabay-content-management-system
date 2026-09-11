const { google } = require('googleapis');
const trendorabayConfig = require('../config/trendorabay');

// Simple in-memory cache
const cache = new Map();

/**
 * Get cached data if available and not expired
 */
function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < trendorabayConfig.cacheDuration * 1000) {
    return cached.data;
  }
  return null;
}

/**
 * Set data in cache
 */
function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Get authenticated Google Analytics client
 */
async function getAnalyticsClient() {
  try {
    // Use OAuth2 with refresh token
    if (trendorabayConfig.gaClientId && trendorabayConfig.gaClientSecret && trendorabayConfig.gaRefreshToken) {
      const oauth2Client = new google.auth.OAuth2(
        trendorabayConfig.gaClientId,
        trendorabayConfig.gaClientSecret
      );
      oauth2Client.setCredentials({
        refresh_token: trendorabayConfig.gaRefreshToken
      });
      return oauth2Client;
    }
    
    // Use Service Account
    if (trendorabayConfig.gaServiceAccountEmail && trendorabayConfig.gaServiceAccountKey) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: trendorabayConfig.gaServiceAccountEmail,
          private_key: trendorabayConfig.gaServiceAccountKey.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
      });
      return auth.getClient();
    }
    
    throw new Error('No valid Google Analytics credentials configured');
  } catch (error) {
    console.error('Error creating Google Analytics client:', error.message);
    throw error;
  }
}

/**
 * Execute Google Analytics query
 */
async function executeGaQuery(metrics, dimensions = []) {
  try {
    const auth = await getAnalyticsClient();
    const analyticsreporting = google.analyticsreporting('v4');
    
    const request = {
      auth,
      reportRequests: [
        {
          viewId: trendorabayConfig.gaViewId,
          dateRanges: [
            {
              startDate: trendorabayConfig.dateRange,
              endDate: 'today'
            }
          ],
          metrics: metrics.map(m => ({ expression: m })),
          dimensions: dimensions.map(d => ({ name: d }))
        }
      ]
    };
    
    const response = await analyticsreporting.reports.batchGet(request);
    return response.data;
  } catch (error) {
    console.error('Error executing GA query:', error.message);
    throw error;
  }
}

/**
 * Get Trendorabay analytics summary
 */
async function getAnalyticsSummary() {
  const cacheKey = 'trendorabay_summary';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    if (!trendorabayConfig.gaViewId) {
      throw new Error('GA_VIEW_ID not configured');
    }

    const response = await executeGaQuery(
      ['ga:sessions', 'ga:users', 'ga:avgSessionDuration']
    );
    
    const rows = response.reports[0].data.rows;
    if (rows && rows.length > 0) {
      const data = {
        totalViews: parseInt(rows[0].metrics[0].values[0]) || 0,
        uniqueVisitors: parseInt(rows[0].metrics[0].values[1]) || 0,
        avgTimeOnPage: parseFloat((parseInt(rows[0].metrics[0].values[2]) || 0) / 60).toFixed(1)
      };
      setCachedData(cacheKey, data);
      return data;
    }
    
    throw new Error('No data returned from Google Analytics');
  } catch (error) {
    if (trendorabayConfig.useMockData) {
      console.log('Using mock data for Trendorabay summary');
      return {
        totalViews: 125000,
        uniqueVisitors: 45000,
        avgTimeOnPage: 4.5
      };
    }
    throw error;
  }
}

/**
 * Get Trendorabay traffic sources
 */
async function getTrafficSources() {
  const cacheKey = 'trendorabay_traffic_sources';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    if (!trendorabayConfig.gaViewId) {
      throw new Error('GA_VIEW_ID not configured');
    }

    const response = await executeGaQuery(
      ['ga:sessions'],
      ['ga:channelGrouping']
    );
    
    const rows = response.reports[0].data.rows;
    if (rows && rows.length > 0) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
      const data = rows.map((row, index) => ({
        name: row.dimensions[0],
        value: Math.round((parseInt(row.metrics[0].values[0]) / rows.reduce((sum, r) => sum + parseInt(r.metrics[0].values[0]), 0)) * 100),
        color: colors[index % colors.length]
      }));
      setCachedData(cacheKey, data);
      return data;
    }
    
    throw new Error('No data returned from Google Analytics');
  } catch (error) {
    if (trendorabayConfig.useMockData) {
      console.log('Using mock data for Trendorabay traffic sources');
      return [
        { name: 'Organic Search', value: 52, color: '#3b82f6' },
        { name: 'Direct', value: 20, color: '#10b981' },
        { name: 'Social Media', value: 15, color: '#f59e0b' },
        { name: 'Referral', value: 13, color: '#ef4444' }
      ];
    }
    throw error;
  }
}

/**
 * Get Trendorabay device types
 */
async function getDeviceTypes() {
  const cacheKey = 'trendorabay_device_types';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    if (!trendorabayConfig.gaViewId) {
      throw new Error('GA_VIEW_ID not configured');
    }

    const response = await executeGaQuery(
      ['ga:sessions'],
      ['ga:deviceCategory']
    );
    
    const rows = response.reports[0].data.rows;
    if (rows && rows.length > 0) {
      const colors = {
        'desktop': '#3b82f6',
        'mobile': '#10b981',
        'tablet': '#f59e0b'
      };
      const total = rows.reduce((sum, r) => sum + parseInt(r.metrics[0].values[0]), 0);
      const data = rows.map(row => ({
        name: row.dimensions[0].charAt(0).toUpperCase() + row.dimensions[0].slice(1),
        value: Math.round((parseInt(row.metrics[0].values[0]) / total) * 100),
        color: colors[row.dimensions[0].toLowerCase()] || '#8b5cf6'
      }));
      setCachedData(cacheKey, data);
      return data;
    }
    
    throw new Error('No data returned from Google Analytics');
  } catch (error) {
    if (trendorabayConfig.useMockData) {
      console.log('Using mock data for Trendorabay device types');
      return [
        { name: 'Desktop', value: 45, color: '#3b82f6' },
        { name: 'Mobile', value: 48, color: '#10b981' },
        { name: 'Tablet', value: 7, color: '#f59e0b' }
      ];
    }
    throw error;
  }
}

/**
 * Get Trendorabay countries
 */
async function getCountries() {
  const cacheKey = 'trendorabay_countries';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    if (!trendorabayConfig.gaViewId) {
      throw new Error('GA_VIEW_ID not configured');
    }

    const response = await executeGaQuery(
      ['ga:sessions'],
      ['ga:country']
    );
    
    const rows = response.reports[0].data.rows;
    if (rows && rows.length > 0) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
      const total = rows.reduce((sum, r) => sum + parseInt(r.metrics[0].values[0]), 0);
      const data = rows.slice(0, 10).map((row, index) => ({
        name: row.dimensions[0],
        value: Math.round((parseInt(row.metrics[0].values[0]) / total) * 100),
        color: colors[index % colors.length]
      }));
      setCachedData(cacheKey, data);
      return data;
    }
    
    throw new Error('No data returned from Google Analytics');
  } catch (error) {
    if (trendorabayConfig.useMockData) {
      console.log('Using mock data for Trendorabay countries');
      return [
        { name: 'Nigeria', value: 40, color: '#3b82f6' },
        { name: 'United States', value: 15, color: '#10b981' },
        { name: 'United Kingdom', value: 12, color: '#f59e0b' },
        { name: 'Ghana', value: 10, color: '#ef4444' },
        { name: 'Kenya', value: 8, color: '#ec4899' }
      ];
    }
    throw error;
  }
}

/**
 * Clear cache for a specific key or all cache
 */
function clearCache(key = null) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

module.exports = {
  getAnalyticsSummary,
  getTrafficSources,
  getDeviceTypes,
  getCountries,
  clearCache
};
