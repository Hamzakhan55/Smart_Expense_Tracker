'use client';

import { useTheme } from '@/context/ThemeContext';
import { ReactNode } from 'react';

interface ThemeWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: 'page' | 'card' | 'modal';
}

export const ThemeWrapper = ({ children, className = '', variant = 'page' }: ThemeWrapperProps) => {
  const { getBackgroundClass, getCardClass } = useTheme();

  const getVariantClass = () => {
    switch (variant) {
      case 'page':
        return getBackgroundClass();
      case 'card':
        return getCardClass();
      case 'modal':
        return `${getCardClass()} backdrop-blur-xl`;
      default:
        return '';
    }
  };

  return (
    <div className={`${getVariantClass()} ${className}`}>
      {children}
    </div>
  );
};

export default ThemeWrapper;