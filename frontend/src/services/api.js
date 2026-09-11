const API_BASE_URL = (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.endsWith('/api'))
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5002/api'
      : 'https://trendorabay-content-management-system.onrender.com/api');

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5002'
    : 'https://trendorabay-content-management-system.onrender.com');

export { BASE_URL };

// API Signature Secret (should match backend)
const API_SIGNATURE_SECRET = import.meta.env.VITE_API_SIGNATURE_SECRET || 'default-secret-change-in-production';

/**
 * Generate HMAC-SHA256 signature for API requests
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {object} body - Request body
 * @param {string} timestamp - Request timestamp
 * @returns {string} - Hex signature
 */
const generateSignature = async (method, path, body, timestamp) => {
  const payload = `${method}:${path}:${JSON.stringify(body)}:${timestamp}`;
  
  // Use Web Crypto API for HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(API_SIGNATURE_SECRET);
  const messageData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return signatureHex;
};

/**
 * Create signature headers for critical operations
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body
 * @returns {object} - Headers with signature and timestamp
 */
const createSignatureHeaders = async (method, endpoint, body = {}) => {
  const timestamp = Date.now().toString();
  const signature = await generateSignature(method, endpoint, body, timestamp);
  
  return {
    'X-Signature': signature,
    'X-Timestamp': timestamp
  };
};

// Critical endpoints that require signature verification
const CRITICAL_ENDPOINTS = [
  '/users',
  '/settings',
  '/media',
  '/security/audit-logs'
];

// Simple in-memory cache with 1-minute TTL (reduced from 5 minutes)
const cache = new Map();
const CACHE_TTL = 1 * 60 * 1000; // 1 minute

// Track if a token refresh is in progress
let isRefreshing = false;
let refreshSubscribers = [];

class ApiService {
  getAuthHeaders() {
    const token = sessionStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Add subscriber to wait for token refresh
  addRefreshSubscriber(callback) {
    refreshSubscribers.push(callback);
  }

  // Notify all subscribers that token is refreshed
  onRefreshed(token) {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
  }

  // Refresh the access token
  async refreshAccessToken() {
    // Refresh token is in httpOnly cookie, sent automatically by browser
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // Include cookies
    });

    if (!response.ok) {
      // Refresh failed, clear tokens and redirect to login
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    sessionStorage.setItem('auth_token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    
    return data.token;
  }

  async request(method, endpoint, data = null, retryCount = 0, requireSignature = false) {
    const maxRetries = 2;
    try {
      const isFormData = data instanceof FormData;
      const headers = {
        ...this.getAuthHeaders(),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      };

      // Add signature for critical operations
      if (requireSignature || this.isCriticalEndpoint(endpoint)) {
        const signatureHeaders = await createSignatureHeaders(method, endpoint, data || {});
        Object.assign(headers, signatureHeaders);
      }

      const config = {
        method,
        headers
      };

      if (data) {
        config.body = isFormData ? data : JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // Handle 401 Unauthorized - try to refresh token (but not for login or refresh endpoints)
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await this.refreshAccessToken();
            isRefreshing = false;
            this.onRefreshed(newToken);
            // Retry the original request with new token
            return this.request(method, endpoint, data);
          } catch (refreshError) {
            isRefreshing = false;
            throw refreshError;
          }
        } else {
          // Wait for the in-progress refresh to complete
          return new Promise((resolve, reject) => {
            this.addRefreshSubscriber((token) => {
              try {
                resolve(this.request(method, endpoint, data));
              } catch (error) {
                reject(error);
              }
            });
          });
        }
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Insufficient permissions');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Retry on network errors (ECONNRESET, ENOTFOUND, etc.) for GET requests
      if (retryCount < maxRetries && method === 'GET' && this.isNetworkError(error)) {
        console.warn(`${method} request failed, retrying (${retryCount + 1}/${maxRetries}):`, endpoint, error.message);
        await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1))); // Exponential backoff
        return this.request(method, endpoint, data, retryCount + 1);
      }
      console.error(`${method} request error:`, error);
      throw error;
    }
  }

  isNetworkError(error) {
    // Check for common network error patterns
    const networkErrorPatterns = [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'fetch failed',
      'NetworkError'
    ];
    return networkErrorPatterns.some(pattern => 
      error.message && error.message.includes(pattern)
    );
  }

  isCriticalEndpoint(endpoint) {
    return CRITICAL_ENDPOINTS.some(critical => endpoint.includes(critical));
  }

  async get(endpoint, forceRefresh = false, requireSignature = false) {
    // Check cache for GET requests (unless forceRefresh is true)
    const cacheKey = `GET:${endpoint}`;
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
    }

    const result = await this.request('GET', endpoint, null, 0, requireSignature);
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  // Clear specific cache entry
  clearCache(endpoint) {
    const cacheKey = `GET:${endpoint}`;
    cache.delete(cacheKey);
  }

  async post(endpoint, data, requireSignature = false) {
    const result = await this.request('POST', endpoint, data, 0, requireSignature);
    this.clearRelatedCache(endpoint);
    return result;
  }

  async put(endpoint, data, requireSignature = false) {
    const result = await this.request('PUT', endpoint, data, 0, requireSignature);
    this.clearRelatedCache(endpoint);
    return result;
  }

  async patch(endpoint, data, requireSignature = false) {
    const result = await this.request('PATCH', endpoint, data, 0, requireSignature);
    this.clearRelatedCache(endpoint);
    return result;
  }

  async delete(endpoint, requireSignature = false) {
    const result = await this.request('DELETE', endpoint, null, 0, requireSignature);
    this.clearRelatedCache(endpoint);
    return result;
  }

  clearRelatedCache(endpoint) {
    // Clear cache entries that might be affected by this endpoint
    const resourceType = endpoint.split('/')[1]; // e.g., 'stories' from '/stories/123'
    for (const key of cache.keys()) {
      if (key.includes(resourceType)) {
        cache.delete(key);
      }
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    console.log('Login response received:', response);
    if (response.user) {
      // Clear old session data first
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');
      // Store new session data (refresh token is in httpOnly cookie)
      sessionStorage.setItem('auth_token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
      console.log('User data stored in sessionStorage:', response.user);
      // Dispatch custom event to update UI in same tab
      window.dispatchEvent(new Event('user-session-changed'));
    }
    return response;
  }

  async register(name, email, password, role = 'user') {
    const response = await this.post('/auth/register', { name, email, password, role });
    if (response.token) {
      sessionStorage.setItem('auth_token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  logout() {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }

  getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!sessionStorage.getItem('auth_token');
  }

  // Security monitoring methods
  async getSecuritySummary() {
    return this.get('/security/summary');
  }

  async getSecurityStats(days = 30) {
    return this.get(`/security/stats?days=${days}`);
  }

  async getSecurityEvents(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/security/events?${params}`);
  }

  async getCriticalEvents() {
    return this.get('/security/critical');
  }

  // Audit log methods
  async getAuditLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/security/audit-logs?${params}`);
  }

  async getAuditStats(days = 30) {
    return this.get(`/security/audit-stats?days=${days}`);
  }

  // CSP violation methods
  async getCspViolations(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/security/csp-violations?${params}`);
  }

  async getCspStats(days = 30) {
    return this.get(`/security/csp-stats?days=${days}`);
  }

  async resolveCspViolation(id, notes) {
    return this.put(`/security/csp-violations/${id}/resolve`, { notes });
  }
}

export default new ApiService();
