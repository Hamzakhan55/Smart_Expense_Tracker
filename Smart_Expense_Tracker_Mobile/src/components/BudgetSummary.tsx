import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Budget } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface BudgetSummaryProps {
  budgets: Budget[];
  getSpentAmount: (category: string) => number;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budgets, getSpentAmount }) => {
  const { formatCurrency } = useCurrency();
  const { theme, isDarkMode } = useTheme();
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + getSpentAmount(budget.category), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const budgetsOverLimit = budgets.filter(budget => 
    getSpentAmount(budget.category) > budget.amount
  ).length;
  
  const budgetsNearLimit = budgets.filter(budget => {
    const spent = getSpentAmount(budget.category);
    const percentage = (spent / budget.amount) * 100;
    return percentage >= 75 && percentage < 100;
  }).length;

  const budgetsOnTrack = budgets.length - budgetsOverLimit - budgetsNearLimit;



  if (budgets.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topCards}>
        <View style={[styles.card, styles.budgetCard]}>
          <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
          <Text style={styles.cardLabel}>TOTAL BUDGET</Text>
          <Text style={styles.cardValue}>{formatCurrency(totalBudget)}</Text>
        </View>
        <View style={[styles.card, styles.spentCard]}>
          <Ionicons name="trending-up" size={24} color="#FFFFFF" />
          <Text style={styles.cardLabel}>TOTAL SPENT</Text>
          <Text style={styles.cardValue}>{formatCurrency(totalSpent)}</Text>
        </View>
      </View>
      
      <View style={styles.bottomCards}>
        <View style={[styles.card, styles.remainingCard]}>
          <Ionicons name="warning" size={24} color="#FFFFFF" />
          <Text style={styles.cardLabel}>REMAINING</Text>
          <Text style={styles.cardValue}>
            {formatCurrency(Math.abs(totalRemaining))}
          </Text>
        </View>
        <View style={[styles.card, styles.progressCard]}>
          <Ionicons name="pie-chart" size={24} color="#FFFFFF" />
          <Text style={styles.cardLabel}>PROGRESS</Text>
          <Text style={styles.cardValue}>{overallPercentage.toFixed(1)}%</Text>
        </View>
      </View>

      <View style={[styles.statusSection, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statusTitle, { color: theme.colors.text }]}>Budget Status Overview</Text>
        <View style={styles.statusCards}>
          <View style={[styles.statusCard, { backgroundColor: isDarkMode ? 'transparent' : '#10B981', borderColor: theme.colors.border }]}>
            <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? "#10B981" : "#FFFFFF"} />
            <Text style={[styles.statusNumber, { color: isDarkMode ? theme.colors.text : "#FFFFFF" }]}>{budgetsOnTrack}</Text>
            <Text style={[styles.statusLabel, { color: isDarkMode ? theme.colors.textSecondary : "#FFFFFF" }]}>On Track</Text>
          </View>
          <View style={[styles.statusCard, { backgroundColor: isDarkMode ? 'transparent' : '#F59E0B', borderColor: theme.colors.border }]}>
            <Ionicons name="warning" size={20} color={isDarkMode ? "#F59E0B" : "#FFFFFF"} />
            <Text style={[styles.statusNumber, { color: isDarkMode ? theme.colors.text : "#FFFFFF" }]}>{budgetsNearLimit}</Text>
            <Text style={[styles.statusLabel, { color: isDarkMode ? theme.colors.textSecondary : "#FFFFFF" }]}>Near Limit</Text>
          </View>
          <View style={[styles.statusCard, { backgroundColor: isDarkMode ? 'transparent' : '#EF4444', borderColor: theme.colors.border }]}>
            <Ionicons name="warning" size={20} color={isDarkMode ? "#EF4444" : "#FFFFFF"} />
            <Text style={[styles.statusNumber, { color: isDarkMode ? theme.colors.text : "#FFFFFF" }]}>{budgetsOverLimit}</Text>
            <Text style={[styles.statusLabel, { color: isDarkMode ? theme.colors.textSecondary : "#FFFFFF" }]}>Over Budget</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  topCards: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  bottomCards: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  budgetCard: {
    backgroundColor: '#3B82F6',
  },
  spentCard: {
    backgroundColor: '#EF4444',
  },
  remainingCard: {
    backgroundColor: '#10B981',
  },
  progressCard: {
    backgroundColor: '#8B5CF6',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusSection: {
    borderRadius: 12,
    padding: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCards: {
    flexDirection: 'row',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default BudgetSummary;