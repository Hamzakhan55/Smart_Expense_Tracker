import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface CategoryIconProps {
  category: string;
  size?: number;
  color?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, size = 20, color = '#6B7280' }) => {
  const getIconName = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category.toLowerCase()) {
      // Expense categories
      case 'food & drinks':
        return 'restaurant';
      case 'transport':
        return 'car';
      case 'utilities':
        return 'flash';
      case 'shopping':
        return 'bag';
      case 'electronics & gadgets':
        return 'phone-portrait';
      case 'healthcare':
        return 'medical';
      case 'education':
        return 'school';
      case 'rent':
        return 'home';
      case 'bills':
        return 'receipt';
      case 'entertainment':
        return 'game-controller';
      case 'investments':
        return 'trending-up';
      case 'personal care':
        return 'cut';
      case 'family & kids':
        return 'people';
      case 'charity & donations':
        return 'heart';
      case 'miscellaneous':
        return 'ellipsis-horizontal';
      
      // Income categories
      case 'salary':
        return 'cash';
      case 'freelance':
        return 'laptop';
      case 'business':
        return 'business';
      case 'investment':
        return 'trending-up';
      case 'rental income':
        return 'home';
      case 'dividends':
        return 'pie-chart';
      case 'interest':
        return 'calculator';
      case 'bonus':
        return 'gift';
      case 'commission':
        return 'hand-left';
      case 'pension':
        return 'time';
      case 'scholarship':
        return 'trophy';
      case 'gift':
        return 'gift';
      case 'refund':
        return 'refresh';
      case 'grant':
        return 'document-text';
      case 'royalty':
        return 'diamond';
      case 'other':
        return 'cube';
      
      default:
        return 'ellipsis-horizontal';
    }
  };

  return (
    <Ionicons 
      name={getIconName(category)} 
      size={size} 
      color={color} 
    />
  );
};

export default CategoryIcon;