import React from 'react';
import BottomNavigation from './BottomNavigation';
import FloatingBottomNav from './FloatingBottomNav';

interface NavigationWrapperProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
  style?: 'default' | 'floating';
}

const NavigationWrapper: React.FC<NavigationWrapperProps> = ({
  activeTab,
  onTabPress,
  style = 'floating', // Default to floating style
}) => {
  if (style === 'floating') {
    return (
      <FloatingBottomNav 
        activeTab={activeTab} 
        onTabPress={onTabPress} 
      />
    );
  }

  return (
    <BottomNavigation 
      activeTab={activeTab} 
      onTabPress={onTabPress} 
    />
  );
};

export default NavigationWrapper;