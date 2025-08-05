import React from 'react';
import BottomNavigation from './BottomNavigation';
import FloatingBottomNav from './FloatingBottomNav';
import PremiumBottomNav from './PremiumBottomNav';

interface NavigationWrapperProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
  style?: 'default' | 'floating' | 'premium';
}

const NavigationWrapper: React.FC<NavigationWrapperProps> = ({
  activeTab,
  onTabPress,
  style = 'premium', // Default to premium style for best experience
}) => {
  if (style === 'premium') {
    return (
      <PremiumBottomNav 
        activeTab={activeTab} 
        onTabPress={onTabPress} 
      />
    );
  }
  
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