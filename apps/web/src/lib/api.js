import axios from 'axios';

// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const apiError = {
      message: 'An error occurred',
      status: error.response?.status || 0,
      details: error.response?.data,
    };

    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data;
      apiError.message = errorData.message || apiError.message;
    }

    // Handle specific error status codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    return Promise.reject(apiError);
  }
);

// Municipalities API
export const municipalitiesAPI = {
  /**
   * Get all municipalities with pagination and search
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search=''] - Search query
   * @returns {Promise<Object>} Municipalities response
   */
  getAll: async (params = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const response = await apiClient.get('/municipalities', {
      params: { page, limit, search }
    });
    return response.data;
  },

  /**
   * Get municipality by ID
   * @param {string} id - Municipality ID
   * @returns {Promise<Object>} Municipality data
   */
  getById: async (id) => {
    const response = await apiClient.get(`/municipalities/${id}`);
    return response.data;
  },

  /**
   * Create new municipality
   * @param {Object} data - Municipality data
   * @returns {Promise<Object>} Created municipality
   */
  create: async (data) => {
    const response = await apiClient.post('/municipalities', data);
    return response.data;
  },

  /**
   * Update municipality
   * @param {string} id - Municipality ID
   * @param {Object} data - Updated municipality data
   * @returns {Promise<Object>} Updated municipality
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/municipalities/${id}`, data);
    return response.data;
  },

  /**
   * Delete municipality
   * @param {string} id - Municipality ID
   * @returns {Promise<Object>} Deletion response
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/municipalities/${id}`);
    return response.data;
  }
};

// NGOs API
export const ngosAPI = {
  /**
   * Get all NGOs with pagination and search
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search=''] - Search query
   * @returns {Promise<Object>} NGOs response
   */
  getAll: async (params = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const response = await apiClient.get('/ngos', {
      params: { page, limit, search }
    });
    return response.data;
  },

  /**
   * Get NGO by ID
   * @param {string} id - NGO ID
   * @returns {Promise<Object>} NGO data
   */
  getById: async (id) => {
    const response = await apiClient.get(`/ngos/${id}`);
    return response.data;
  },

  /**
   * Create new NGO
   * @param {Object} data - NGO data
   * @returns {Promise<Object>} Created NGO
   */
  create: async (data) => {
    const response = await apiClient.post('/ngos', data);
    return response.data;
  },

  /**
   * Update NGO
   * @param {string} id - NGO ID
   * @param {Object} data - Updated NGO data
   * @returns {Promise<Object>} Updated NGO
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/ngos/${id}`, data);
    return response.data;
  },

  /**
   * Delete NGO
   * @param {string} id - NGO ID
   * @returns {Promise<Object>} Deletion response
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/ngos/${id}`);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  /**
   * Get all users with pagination and search
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Users response
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  getById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   * @param {Object} data - User data
   * @returns {Promise<Object>} Created user
   */
  create: async (data) => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Deletion response
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};

// Auth API
export const authAPI = {
  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Auth response
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    localStorage.removeItem('authToken');
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
};

export default apiClient;
