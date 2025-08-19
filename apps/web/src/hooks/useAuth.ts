import { useMutation } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import type { LoginCredentials, LoginResponse, APIError } from '@/lib/api';

// Login mutation hook
export const useLogin = () => {
  return useMutation<LoginResponse, APIError, LoginCredentials>({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      console.log('Login successful:', data);
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Store user data if provided
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// Logout mutation hook
export const useLogout = () => {
  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.log('Logout successful');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
};
