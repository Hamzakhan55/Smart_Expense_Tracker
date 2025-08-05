import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Budget } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface BudgetProgressCardProps {
  budget: Budget;
  spent: number;
  onPress?: () => void;
}

const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({ 
  budget, 
  spent, 
  onPress
}) => {
  const { theme } = useTheme();
  const percentage = (spent / budget.amount) * 100;
  const remaining = budget.amount - spent;
  const isOverBudget = spent > budget.amount;
  
  const getProgressColor = () => {
    if (isOverBudget) return '#EF4444';
    if (percentage >= 90) return '#F59E0B';
    if (percentage >= 75) return '#F97316';
    return '#10B981';
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'Food & Drinks': 'restaurant',
      'Transport': 'car',
      'Utilities': 'flash',
      'Shopping': 'bag',
      'Electronics & Gadgets': 'phone-portrait',
      'Healthcare': 'medical',
      'Education': 'school',
      'Rent': 'home',
      'Bills': 'receipt',
      'Entertainment': 'game-controller',
      'Investments': 'trending-up',
      'Personal Care': 'cut',
      'Family & Kids': 'people',
      'Charity & Donations': 'heart',
      'Miscellaneous': 'ellipsis-horizontal',
    };
    return iconMap[category] || 'wallet';
  };

  const getStatusIcon = () => {
    if (isOverBudget) return 'warning';
    if (percentage >= 90) return 'alert-circle';
    if (percentage >= 75) return 'time';
    return 'checkmark-circle';
  };

  const { formatCurrency } = useCurrency();
  
  const formatCurrencyAbs = (value: number) => formatCurrency(Math.abs(value));

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.header}>
          <View style={styles.categorySection}>
            <View style={[styles.categoryIcon, { backgroundColor: getProgressColor() }]}>
              <Ionicons 
                name={getCategoryIcon(budget.category)} 
                size={16} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[styles.category, { color: theme.colors.text }]}>{budget.category}</Text>
              <Text style={[styles.budgetAmount, { color: theme.colors.textSecondary }]}>{formatCurrencyAbs(budget.amount)}</Text>
            </View>
          </View>
          
          <Text style={[styles.percentage, { color: getProgressColor() }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surface }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getProgressColor()
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Spent</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{formatCurrencyAbs(spent)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Left</Text>
            <Text style={[styles.statValue, { color: getProgressColor() }]}>{formatCurrencyAbs(remaining)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryInfo: {
    flex: 1,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  budgetAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default BudgetProgressCard;