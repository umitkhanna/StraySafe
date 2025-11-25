// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api'; // Update this to your actual API URL

// App Colors - Matching web app branding
export const COLORS = {
  primary: '#ff6b35',      // Orange primary color
  secondary: '#ffa726',    // Lighter orange
  accent: '#ff8a65',       // Even lighter orange
  background: '#f5f5f5',   // Light gray background
  surface: '#ffffff',      // White surface
  text: {
    primary: '#212121',    // Dark gray text
    secondary: '#757575',  // Medium gray text
    light: '#ffffff',      // White text
  },
  success: '#4caf50',      // Green
  warning: '#ff9800',      // Amber
  error: '#f44336',        // Red
  info: '#2196f3',         // Blue
};

// App Fonts
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

// App Dimensions
export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  // font sizes
  largeTitle: 50,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // app dimensions
  width: 375,
  height: 812,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  NGO_ADMIN: 'ngoAdmin',
  MUNICIPALITY_ADMIN: 'municipalityAdmin',
  OPERATORS: 'operators',
  GROUND_STAFF: 'groundStaff',
  HIGH_RISK_USER: 'highRiskUser',
  USER: 'user',
};

// Incident Types
export const INCIDENT_TYPES = {
  DOG_BITE: 'Dog Bite',
  DOG_CHASING: 'Dog Chasing',
  AGGRESSIVE_BEHAVIOR: 'Aggressive Behavior',
  STRAY_GATHERING: 'Stray Gathering',
  OTHER: 'Other',
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};
