// API Configuration
// For iOS Simulator/Android Emulator, use 'localhost'
// For physical devices, use your computer's local IP address (e.g., '192.168.29.124')
// You can find your IP with: ifconfig (Mac/Linux) or ipconfig (Windows)

import { Platform } from 'react-native';

// Determine the API base URL based on the platform
// For simulators/emulators, use localhost
// For physical devices, use the local network IP
const getApiBaseUrl = () => {
  // Check if we're in development mode
  const __DEV__ = process.env.NODE_ENV !== 'production';
  
  if (__DEV__) {
    // For iOS Simulator and Android Emulator, localhost works
    // For physical devices, you need to use your computer's IP address
    // Change this to your computer's local IP when testing on a physical device
    return 'http://localhost:3000';
  }
  
  // Production API URL (update this when deploying)
  return 'http://localhost:3000';
  //return 'https://api.straysafe.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to get full API endpoint URL
export const getApiUrl = (endpoint: string) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/api/${cleanEndpoint}`;
};

