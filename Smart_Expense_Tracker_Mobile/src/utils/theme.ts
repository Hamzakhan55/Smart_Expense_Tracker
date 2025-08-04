export const lightTheme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#3B82F6',
    secondary: '#6B7280',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
  },
  gradients: {
    background: ['#F8FAFC', '#E2E8F0'],
    primary: ['#3B82F6', '#1E40AF'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    danger: ['#EF4444', '#DC2626'],
  }
};

export const darkTheme = {
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    primary: '#60A5FA',
    secondary: '#94A3B8',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    card: '#1E293B',
  },
  gradients: {
    background: ['#0F172A', '#1E293B'],
    primary: ['#60A5FA', '#3B82F6'],
    success: ['#34D399', '#10B981'],
    warning: ['#FBBF24', '#F59E0B'],
    danger: ['#F87171', '#EF4444'],
  }
};

export type Theme = typeof lightTheme;