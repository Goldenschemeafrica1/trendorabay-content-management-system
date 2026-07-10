const API_BASE_URL = 'http://localhost:5002/api';

// Simple in-memory cache with 5-minute TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ApiService {
  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
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

      // Handle 401 Unauthorized - clear token and redirect to login (but not for login endpoint)
      if (response.status === 401 && endpoint !== '/auth/login') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Authentication required');
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

  async get(endpoint) {
    // Check cache for GET requests
    const cacheKey = `GET:${endpoint}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const result = await this.request('GET', endpoint);
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
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
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  async register(name, email, password, role = 'user') {
    const response = await this.post('/auth/register', { name, email, password, role });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  logout() {
    localStorage.removeItem('auth_token');
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
