// Theme colors and styling constants
export const colors = {
  primary: '#E87722', // Warm Orange
  primaryDark: '#D96B1A',
  primaryLight: '#F59E42',
  
  secondary: '#7BC043', // Lime Green
  secondaryDark: '#6BA838',
  secondaryLight: '#84C85C',
  
  accent: '#F59E42', // Light Orange
  accentDark: '#E87722',
  accentLight: '#FFBE76',
  
  success: '#7BC043',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#5B9BF3',
  
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray50: '#FDF8F4',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#D9D9D9',
  gray400: '#B8B8B8',
  gray500: '#8E8E8E',
  gray600: '#6B6B6B',
  gray700: '#4A4A4A',
  gray800: '#2E2E2E',
  gray900: '#1A1A1A',
  
  // Backgrounds
  background: '#ffffff',
  backgroundSecondary: '#FDF8F4',
  surface: '#ffffff',
  
  // Text
  text: '#2E2E2E',
  textSecondary: '#8E8E8E',
  textLight: '#B8B8B8',
  textInverted: '#ffffff',
  
  // Borders
  border: '#EEEEEE',
  borderDark: '#D9D9D9',
  
  // Macros
  protein: '#5B9BF3', // Blue
  carbs: '#84C85C', // Lime Green
  fat: '#8b5cf6', // Purple
  calories: '#E87722', // Orange
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
};

