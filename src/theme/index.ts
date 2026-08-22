// Shared non-color tokens
const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

const radius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 9999,
};

const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const lightColors = {
  primary: '#4338CA',
  primaryLight: '#EEF2FF',
  secondary: '#1E293B',
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
  error: '#EF4444',
};

export const darkColors = {
  primary: '#6366F1',
  primaryLight: '#1E1B4B',
  secondary: '#CBD5E1',
  success: '#34D399',
  successLight: '#064E3B',
  danger: '#F87171',
  dangerLight: '#450A0A',
  warning: '#FBBF24',
  warningLight: '#451A03',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  inputBg: '#334155',
  error: '#F87171',
};

export type ThemeColors = typeof lightColors;

export type AppTheme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  isDark: boolean;
};

export const lightTheme: AppTheme = {
  colors: lightColors,
  spacing,
  radius,
  shadows,
  isDark: false,
};

export const darkTheme: AppTheme = {
  colors: darkColors,
  spacing,
  radius,
  shadows: {
    sm: { ...shadows.sm, shadowColor: '#000000', shadowOpacity: 0.2 },
    md: { ...shadows.md, shadowColor: '#000000', shadowOpacity: 0.3 },
    lg: { ...shadows.lg, shadowColor: '#000000', shadowOpacity: 0.4 },
  },
  isDark: true,
};

// Default export for backward compatibility during migration
export const theme = lightTheme;
