// Theme colors and styling constants
export const colors = {
  primary: '#2563eb', // Blue
  primaryDark: '#1e40af',
  primaryLight: '#60a5fa',
  
  secondary: '#10b981', // Green
  secondaryDark: '#059669',
  secondaryLight: '#34d399',
  
  accent: '#f59e0b', // Amber
  accentDark: '#d97706',
  accentLight: '#fbbf24',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Backgrounds
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  surface: '#ffffff',
  
  // Text
  text: '#111827',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  textInverted: '#ffffff',
  
  // Borders
  border: '#e5e7eb',
  borderDark: '#d1d5db',
  
  // Macros
  protein: '#ef4444', // Red
  carbs: '#f59e0b', // Orange
  fat: '#8b5cf6', // Purple
  calories: '#3b82f6', // Blue
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

