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
  onLongPress?: () => void;
}

const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({ 
  budget, 
  spent, 
  onPress, 
  onLongPress 
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
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.header}>
          <View style={styles.categoryInfo}>
            <Text style={[styles.category, { color: theme.colors.text }]}>{budget.category}</Text>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={getStatusIcon()} 
                size={16} 
                color={getProgressColor()} 
              />
              <Text style={[styles.statusText, { color: getProgressColor() }]}>
                {isOverBudget ? 'Over Budget' : `${percentage.toFixed(0)}% Used`}
              </Text>
            </View>
          </View>
          <Text style={[styles.budgetAmount, { color: theme.colors.primary }]}>{formatCurrencyAbs(budget.amount)}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getProgressColor()
                }
              ]} 
            />
            {isOverBudget && (
              <View 
                style={[
                  styles.overBudgetIndicator,
                  { backgroundColor: getProgressColor() }
                ]}
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Spent</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {formatCurrencyAbs(spent)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {isOverBudget ? 'Over by' : 'Remaining'}
            </Text>
            <Text style={[styles.statValue, { color: getProgressColor() }]}>
              {formatCurrencyAbs(remaining)}
            </Text>
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overBudgetIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BudgetProgressCard;