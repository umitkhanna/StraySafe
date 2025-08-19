import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { env } from './env';

// API client configuration
const API_BASE_URL = env.API_URL;

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
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: APIError = {
      message: 'An error occurred',
      status: error.response?.status || 0,
      details: error.response?.data,
    };

    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data as any;
      apiError.message = errorData.message || errorData.error || `HTTP error! status: ${error.response.status}`;
    } else if (error.message) {
      apiError.message = error.message;
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 401:
        // Unauthorized - clear stored auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        break;
      case 403:
        apiError.message = 'Access forbidden';
        break;
      case 404:
        apiError.message = 'Resource not found';
        break;
      case 422:
        apiError.message = 'Validation error';
        break;
      case 500:
        apiError.message = 'Internal server error';
        break;
    }

    return Promise.reject(apiError);
  }
);

// Export the configured axios instance for direct use if needed
export { apiClient };

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  token?: string;
  message?: string;
}

export interface APIError {
  message: string;
  status: number;
  details?: any;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    params?: Record<string, any>;
  } = {}
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      method: options.method || 'GET',
      data: options.data,
      params: options.params,
    });

    return response.data;
  } catch (error) {
    throw error; // Re-throw the processed error from interceptor
  }
}

// Authentication API functions
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      data: credentials,
    });
  },

  logout: async (): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },


};

// Additional utility functions
export const apiUtils = {
  // Set auth token for future requests
  setAuthToken: (token: string) => {
    localStorage.setItem('authToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Clear auth token
  clearAuthToken: () => {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  // Get current auth token
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};
