// Environment variable utilities for the app

export const env = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL as string,
  API_BASE: import.meta.env.VITE_API_BASE as string,
  ML_BASE: import.meta.env.VITE_ML_BASE as string,
  
  // Utility to get all VITE environment variables
  getAllViteEnvVars: () => {
    const viteEnvVars: Record<string, string> = {};
    for (const [key, value] of Object.entries(import.meta.env)) {
      if (key.startsWith('VITE_')) {
        viteEnvVars[key] = value as string;
      }
    }
    return viteEnvVars;
  },

  // Check if we're in development mode
  isDevelopment: import.meta.env.DEV,
  
  // Check if we're in production mode
  isProduction: import.meta.env.PROD,
};

// Helper function to log all environment variables (useful for debugging)
export const logEnvironmentInfo = () => {
  console.group('🔧 Environment Configuration');
  console.log('Mode:', import.meta.env.MODE);
  console.log('Development:', env.isDevelopment);
  console.log('Production:', env.isProduction);
  console.log('API URL:', env.API_URL);
  console.log('API Base:', env.API_BASE);
  console.log('ML Base:', env.ML_BASE);
  console.log('All VITE vars:', env.getAllViteEnvVars());
  console.groupEnd();
};
