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

// Debug logging to check which URL is being used
console.log('API_BASE_URL:', API_BASE_URL);
console.log('BASE_URL:', BASE_URL);
console.log('Hostname:', window.location.hostname);

export { BASE_URL };

// Simple in-memory cache with 1-minute TTL (reduced from 5 minutes)
const cache = new Map();
const CACHE_TTL = 1 * 60 * 1000; // 1 minute

// Track if a token refresh is in progress
let isRefreshing = false;
let refreshSubscribers = [];

class ApiService {
  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
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
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      // Refresh failed, clear tokens and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data.token;
  }

  async request(method, endpoint, data = null) {
    try {
      const isFormData = data instanceof FormData;
      const headers = {
        ...this.getAuthHeaders(),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      };

      const config = {
        method,
        headers,
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
      console.error(`${method} request error:`, error);
      throw error;
    }
  }

  async get(endpoint, forceRefresh = false) {
    // Check cache for GET requests (unless forceRefresh is true)
    const cacheKey = `GET:${endpoint}`;
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
    }

    const result = await this.request('GET', endpoint);
    
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

  async post(endpoint, data) {
    const result = await this.request('POST', endpoint, data);
    this.clearRelatedCache(endpoint);
    return result;
  }

  async put(endpoint, data) {
    const result = await this.request('PUT', endpoint, data);
    this.clearRelatedCache(endpoint);
    return result;
  }

  async patch(endpoint, data) {
    const result = await this.request('PATCH', endpoint, data);
    this.clearRelatedCache(endpoint);
    return result;
  }

  async delete(endpoint) {
    const result = await this.request('DELETE', endpoint);
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
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  async register(name, email, password, role = 'user') {
    const response = await this.post('/auth/register', { name, email, password, role });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
}

export default new ApiService();
