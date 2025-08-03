import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Budget, Expense } from '../types';

interface BudgetAnalyticsProps {
  budgets: Budget[];
  expenses: Expense[];
  currentMonth: number;
  currentYear: number;
}

const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({
  budgets,
  expenses,
  currentMonth,
  currentYear,
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  // Get current month expenses
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() + 1 === currentMonth && 
           expenseDate.getFullYear() === currentYear;
  });

  // Get previous month expenses for comparison
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  const previousMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() + 1 === prevMonth && 
           expenseDate.getFullYear() === prevYear;
  });

  // Calculate insights
  const insights = [];

  // Most overspent category
  const categoryOverspends = budgets.map(budget => {
    const spent = currentMonthExpenses
      .filter(expense => expense.category === budget.category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return {
      category: budget.category,
      overspend: spent - budget.amount,
      percentage: ((spent - budget.amount) / budget.amount) * 100,
    };
  }).filter(item => item.overspend > 0)
    .sort((a, b) => b.overspend - a.overspend);

  if (categoryOverspends.length > 0) {
    const worst = categoryOverspends[0];
    insights.push({
      type: 'warning',
      icon: 'trending-up',
      title: 'Highest Overspend',
      description: `${worst.category}: ${formatCurrency(worst.overspend)} over budget`,
      color: '#EF4444',
    });
  }

  // Best performing category
  const categoryPerformance = budgets.map(budget => {
    const spent = currentMonthExpenses
      .filter(expense => expense.category === budget.category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = (spent / budget.amount) * 100;
    return {
      category: budget.category,
      percentage,
      remaining: budget.amount - spent,
    };
  }).filter(item => item.percentage < 100)
    .sort((a, b) => a.percentage - b.percentage);

  if (categoryPerformance.length > 0) {
    const best = categoryPerformance[0];
    insights.push({
      type: 'success',
      icon: 'checkmark-circle',
      title: 'Best Performance',
      description: `${best.category}: Only ${best.percentage.toFixed(0)}% used`,
      color: '#10B981',
    });
  }

  // Month-over-month comparison
  const currentTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const previousTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  if (previousTotal > 0) {
    const change = currentTotal - previousTotal;
    const changePercentage = (change / previousTotal) * 100;
    
    if (Math.abs(changePercentage) > 5) {
      insights.push({
        type: change > 0 ? 'warning' : 'success',
        icon: change > 0 ? 'trending-up' : 'trending-down',
        title: 'Monthly Trend',
        description: `${Math.abs(changePercentage).toFixed(0)}% ${change > 0 ? 'increase' : 'decrease'} from last month`,
        color: change > 0 ? '#F59E0B' : '#10B981',
      });
    }
  }

  // Average daily spending
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const currentDay = new Date().getDate();
  const avgDailySpending = currentTotal / currentDay;
  const projectedMonthly = avgDailySpending * daysInMonth;
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  if (projectedMonthly > totalBudget * 1.1) {
    insights.push({
      type: 'warning',
      icon: 'speedometer',
      title: 'Spending Pace',
      description: `At current pace, you'll exceed budget by ${formatCurrency(projectedMonthly - totalBudget)}`,
      color: '#EF4444',
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'success',
      icon: 'thumbs-up',
      title: 'Great Job!',
      description: 'Your spending is well within budget limits',
      color: '#10B981',
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Insights</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll}>
        {insights.map((insight, index) => (
          <LinearGradient
            key={index}
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.insightCard}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${insight.color}20` }]}>
              <Ionicons name={insight.icon as any} size={20} color={insight.color} />
            </View>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  insightsScroll: {
    flexDirection: 'row',
  },
  insightCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default BudgetAnalytics;