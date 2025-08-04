'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themeConfig, type ThemeConfig } from '@/lib/theme';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: ThemeConfig;
  getBackgroundClass: () => string;
  getCardClass: () => string;
  getModalClass: () => string;
  getTextClass: (variant?: 'primary' | 'secondary' | 'muted' | 'accent') => string;
  getBorderClass: (variant?: 'primary' | 'secondary' | 'accent') => string;
}

const ThemeContext = createContext<ThemeContextType>(null!);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'dark' || (!stored && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const theme = isDark ? themeConfig.dark : themeConfig.light;

  const getBackgroundClass = () => `min-h-screen bg-gradient-to-br ${theme.background.primary}`;
  const getCardClass = () => `${theme.background.card} border ${theme.border.primary} rounded-3xl ${theme.shadow.card}`;
  const getModalClass = () => `${theme.background.modal} border ${theme.border.primary} rounded-3xl ${theme.shadow.modal}`;
  const getTextClass = (variant: 'primary' | 'secondary' | 'muted' | 'accent' = 'primary') => theme.text[variant];
  const getBorderClass = (variant: 'primary' | 'secondary' | 'accent' = 'primary') => theme.border[variant];

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggleTheme, 
      theme,
      getBackgroundClass, 
      getCardClass,
      getModalClass,
      getTextClass, 
      getBorderClass 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};