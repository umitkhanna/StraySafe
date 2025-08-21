import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { env } from './env';
import type { 
  User, 
  NGO, 
  Municipality, 
  UsersResponse, 
  NGOsResponse, 
  MunicipalitiesResponse
} from './types';

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

// Types for users
export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  organization_name?: string;
  organization_type?: string;
  parent_id?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
  organization_name?: string;
  parent_id?: string;
}

// Types for NGOs
export interface NGO {
  _id: string;
  name: string;
  registrationNumber: string;
  description?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  legalInfo: {
    registrationDate?: string;
    taxExemptionNumber?: string;
    legalStatus?: string;
  };
  operationalAreas: string[];
  certifications: Array<{
    name: string;
    issuingAuthority: string;
    issueDate: string;
    expiryDate?: string;
    certificateNumber?: string;
  }>;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNGOData {
  name: string;
  registrationNumber: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  legalInfo?: {
    registrationDate?: string;
    taxExemptionNumber?: string;
    legalStatus?: string;
  };
}

export interface NGOsResponse {
  success: boolean;
  data: NGO[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Types for Municipalities
export interface Municipality {
  _id: string;
  name: string;
  state: string;
  country: string;
  populationData: {
    totalPopulation?: number;
    urbanPopulation?: number;
    ruralPopulation?: number;
    lastCensusYear?: number;
  };
  boundaries?: {
    type: string;
    coordinates: number[][][];
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  adminUser?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMunicipalityData {
  name: string;
  state: string;
  country: string;
  populationData?: {
    totalPopulation?: number;
    urbanPopulation?: number;
    ruralPopulation?: number;
    lastCensusYear?: number;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  adminUser?: string;
}

export interface MunicipalitiesResponse {
  success: boolean;
  data: Municipality[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
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

  // You can add more auth-related endpoints here
  // register: async (userData: RegisterData): Promise<RegisterResponse> => { ... },
  // refreshToken: async (): Promise<TokenResponse> => { ... },
};

// Users API functions
export const usersAPI = {
  // Get all users (admin only)
  getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<UsersResponse> => {
    return apiRequest<UsersResponse>('/users', {
      method: 'GET',
      params,
    });
  },

  // Get users that current user can manage
  getManaged: async (): Promise<UsersResponse> => {
    return apiRequest<UsersResponse>('/users/managed', {
      method: 'GET',
    });
  },

  // Get organization members
  getOrganizationMembers: async (): Promise<UsersResponse> => {
    return apiRequest<UsersResponse>('/users/organization-members', {
      method: 'GET',
    });
  },

  // Get users by role
  getByRole: async (role: string): Promise<UsersResponse> => {
    return apiRequest<UsersResponse>(`/users/by-role/${role}`, {
      method: 'GET',
    });
  },

  // Create new user
  create: async (userData: CreateUserData): Promise<{ success: boolean; data: User }> => {
    return apiRequest<{ success: boolean; data: User }>('/users/add-sub-user', {
      method: 'POST',
      data: userData,
    });
  },

  // Delete user
  delete: async (userId: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Update user
  update: async (userId: string, userData: Partial<User>): Promise<{ success: boolean; data: User }> => {
    return apiRequest<{ success: boolean; data: User }>(`/users/${userId}`, {
      method: 'PATCH',
      data: userData,
    });
  },

  // Move user to different parent
  move: async (userId: string, newParentId: string | null): Promise<{ success: boolean; data: User }> => {
    return apiRequest<{ success: boolean; data: User }>(`/users/move/${userId}`, {
      method: 'PATCH',
      data: { newParentId },
    });
  },
};

// NGOs API functions
export const ngosAPI = {
  // Get all NGOs
  getAll: async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<NGOsResponse> => {
    return apiRequest<NGOsResponse>('/ngos', {
      method: 'GET',
      params,
    });
  },

  // Get single NGO
  getById: async (ngoId: string): Promise<{ success: boolean; data: NGO }> => {
    return apiRequest<{ success: boolean; data: NGO }>(`/ngos/${ngoId}`, {
      method: 'GET',
    });
  },

  // Create new NGO
  create: async (ngoData: CreateNGOData): Promise<{ success: boolean; data: NGO }> => {
    return apiRequest<{ success: boolean; data: NGO }>('/ngos', {
      method: 'POST',
      data: ngoData,
    });
  },

  // Update NGO
  update: async (ngoId: string, ngoData: Partial<CreateNGOData>): Promise<{ success: boolean; data: NGO }> => {
    return apiRequest<{ success: boolean; data: NGO }>(`/ngos/${ngoId}`, {
      method: 'PATCH',
      data: ngoData,
    });
  },

  // Delete NGO
  delete: async (ngoId: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/ngos/${ngoId}`, {
      method: 'DELETE',
    });
  },

  // Verify NGO
  verify: async (ngoId: string): Promise<{ success: boolean; data: NGO }> => {
    return apiRequest<{ success: boolean; data: NGO }>(`/ngos/${ngoId}/verify`, {
      method: 'PATCH',
    });
  },

  // Get NGO statistics
  getStats: async (): Promise<{ success: boolean; data: any }> => {
    return apiRequest<{ success: boolean; data: any }>('/ngos/stats', {
      method: 'GET',
    });
  },
};

// Municipalities API functions
export const municipalitiesAPI = {
  // Get all municipalities
  getAll: async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<MunicipalitiesResponse> => {
    const returnvar: MunicipalitiesResponse = await apiRequest<MunicipalitiesResponse>('/municipalities', {
      method: 'GET',
      params,
    });
    console.log("returnvar:", returnvar);
    return returnvar;
  },

  // Get single municipality
  getById: async (municipalityId: string): Promise<{ success: boolean; data: Municipality }> => {
    return apiRequest<{ success: boolean; data: Municipality }>(`/municipalities/${municipalityId}`, {
      method: 'GET',
    });
  },

  // Create new municipality
  create: async (municipalityData: CreateMunicipalityData): Promise<{ success: boolean; data: Municipality }> => {
    return apiRequest<{ success: boolean; data: Municipality }>('/municipalities', {
      method: 'POST',
      data: municipalityData,
    });
  },

  // Update municipality
  update: async (municipalityId: string, municipalityData: Partial<CreateMunicipalityData>): Promise<{ success: boolean; data: Municipality }> => {
    return apiRequest<{ success: boolean; data: Municipality }>(`/municipalities/${municipalityId}`, {
      method: 'PATCH',
      data: municipalityData,
    });
  },

  // Delete municipality
  delete: async (municipalityId: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/municipalities/${municipalityId}`, {
      method: 'DELETE',
    });
  },

  // Get municipality statistics
  getStats: async (): Promise<{ success: boolean; data: any }> => {
    return apiRequest<{ success: boolean; data: any }>('/municipalities/stats', {
      method: 'GET',
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
