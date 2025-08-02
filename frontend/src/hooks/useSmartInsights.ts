'use client';

import { useMemo } from 'react';
import { useSummary } from './useSummary';
import { useTransactions } from './useTransactions';
import { useCurrency } from '@/context/CurrencyContext';
import { Calendar, TrendingUp, TrendingDown, Target, Lightbulb, AlertCircle, Brain } from 'lucide-react';

interface InsightData {
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  message: string;
  type: 'prediction' | 'success' | 'warning' | 'tip' | 'info';
  priority: number;
}

interface CategorySpending {
  category: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercent: number;
}

export const useSmartInsights = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const { monthlySummary: currentSummary } = useSummary(currentYear, currentMonth);
  const { monthlySummary: previousSummary } = useSummary(previousYear, previousMonth);
  const { expenses: allExpenses } = useTransactions();
  const { currency } = useCurrency();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

  // Filter expenses by month
  const currentExpenses = useMemo(() => {
    if (!allExpenses) return [];
    return allExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  }, [allExpenses, currentMonth, currentYear]);

  const previousExpenses = useMemo(() => {
    if (!allExpenses) return [];
    return allExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() + 1 === previousMonth && expenseDate.getFullYear() === previousYear;
    });
  }, [allExpenses, previousMonth, previousYear]);

  // Category analysis
  const categoryAnalysis = useMemo((): CategorySpending[] => {
    const categories = [...new Set([...currentExpenses.map(e => e.category), ...previousExpenses.map(e => e.category)])];

    return categories.map(category => {
      const currentAmount = currentExpenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);
      const previousAmount = previousExpenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);
      const change = currentAmount - previousAmount;
      const changePercent = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

      return {
        category,
        currentMonth: currentAmount,
        previousMonth: previousAmount,
        change,
        changePercent
      };
    }).filter(item => item.currentMonth > 0 || item.previousMonth > 0);
  }, [currentExpenses, previousExpenses]);

  // Advanced prediction algorithm
  const nextMonthPrediction = useMemo(() => {
    if (!currentSummary || !previousSummary) return null;

    const currentTotal = currentSummary.total_expenses;
    const previousTotal = previousSummary.total_expenses;
    
    if (previousTotal === 0) return currentTotal;

    // Multi-factor prediction model
    const monthlyTrend = (currentTotal - previousTotal) / previousTotal;
    const seasonalFactor = 1 + (Math.sin((currentMonth * Math.PI) / 6) * 0.15);
    const volatilityAdjustment = Math.abs(monthlyTrend) > 0.3 ? 0.5 : 0.7; // Reduce impact of extreme changes
    
    // Category-based prediction refinement
    const categoryTrends = categoryAnalysis.map(cat => ({
      category: cat.category,
      trend: cat.previousMonth > 0 ? cat.changePercent / 100 : 0,
      weight: cat.currentMonth / currentTotal
    }));

    const weightedTrend = categoryTrends.reduce((sum, cat) => sum + (cat.trend * cat.weight), 0);
    
    const prediction = currentTotal * (1 + (weightedTrend * volatilityAdjustment)) * seasonalFactor;
    
    return Math.max(prediction, currentTotal * 0.7); // Minimum 70% of current month
  }, [currentSummary, previousSummary, currentMonth, categoryAnalysis]);

  // Generate insights
  const insights = useMemo((): InsightData[] => {
    if (!currentSummary || !allExpenses) return [];

    const insights: InsightData[] = [];

    // 1. Next month prediction (highest priority)
    if (nextMonthPrediction && currentSummary.total_expenses > 0) {
      const difference = nextMonthPrediction - currentSummary.total_expenses;
      const changePercent = (difference / currentSummary.total_expenses) * 100;
      const isSignificantChange = Math.abs(changePercent) > 10;
      
      if (isSignificantChange) {
        const isIncrease = difference > 0;
        insights.push({
          icon: Calendar,
          color: isIncrease ? "text-orange-400" : "text-green-400",
          bgColor: isIncrease ? "bg-orange-500/10" : "bg-green-500/10",
          borderColor: isIncrease ? "border-orange-500/20" : "border-green-500/20",
          message: `AI predicts next month's expenses: ${formatCurrency(nextMonthPrediction)} (${isIncrease ? '+' : ''}${changePercent.toFixed(0)}% vs this month)`,
          type: "prediction",
          priority: 1
        });
      }
    }

    // 2. Significant category changes
    const significantChanges = categoryAnalysis
      .filter(item => Math.abs(item.changePercent) > 25 && Math.abs(item.change) > 100)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

    if (significantChanges.length > 0) {
      const topChange = significantChanges[0];
      const isIncrease = topChange.change > 0;
      
      insights.push({
        icon: isIncrease ? TrendingUp : TrendingDown,
        color: isIncrease ? "text-red-400" : "text-green-400",
        bgColor: isIncrease ? "bg-red-500/10" : "bg-green-500/10",
        borderColor: isIncrease ? "border-red-500/20" : "border-green-500/20",
        message: `${topChange.category} spending ${isIncrease ? 'surged' : 'dropped'} ${Math.abs(topChange.changePercent).toFixed(0)}% (${formatCurrency(Math.abs(topChange.change))}) vs last month`,
        type: isIncrease ? "warning" : "success",
        priority: 2
      });
    }

    // 3. Savings rate analysis
    if (currentSummary && previousSummary) {
      const currentSavingsRate = currentSummary.total_income > 0 
        ? ((currentSummary.total_income - currentSummary.total_expenses) / currentSummary.total_income) * 100 
        : 0;
      const previousSavingsRate = previousSummary.total_income > 0 
        ? ((previousSummary.total_income - previousSummary.total_expenses) / previousSummary.total_income) * 100 
        : 0;
      
      const savingsChange = currentSavingsRate - previousSavingsRate;
      
      if (Math.abs(savingsChange) > 8) {
        const isImprovement = savingsChange > 0;
        insights.push({
          icon: Target,
          color: isImprovement ? "text-emerald-400" : "text-amber-400",
          bgColor: isImprovement ? "bg-emerald-500/10" : "bg-amber-500/10",
          borderColor: isImprovement ? "border-emerald-500/20" : "border-amber-500/20",
          message: `Savings rate ${isImprovement ? 'improved' : 'declined'} by ${Math.abs(savingsChange).toFixed(1)}% (now ${currentSavingsRate.toFixed(1)}%)`,
          type: isImprovement ? "success" : "warning",
          priority: 3
        });
      }
    }

    // 4. Smart spending recommendations
    const topSpendingCategories = categoryAnalysis
      .filter(item => item.currentMonth > 200)
      .sort((a, b) => b.currentMonth - a.currentMonth)
      .slice(0, 2);

    if (topSpendingCategories.length > 0) {
      const topCategory = topSpendingCategories[0];
      const smartTips = {
        "Food & Drinks": "Try meal prep Sundays - can save 30-40% on food costs",
        "Transport": "Consider ride-sharing or public transport for 20% savings",
        "Shopping": "Use the 48-hour rule for purchases over $50",
        "Entertainment": "Look for free community events and happy hour deals",
        "Utilities": "Smart thermostat can reduce bills by 10-15%",
        "Healthcare": "Use generic medications and preventive care",
        "Education": "Check for online course discounts and library resources"
      };
      
      const tip = smartTips[topCategory.category as keyof typeof smartTips] || 
                  `Review ${topCategory.category} expenses for optimization opportunities`;
      
      insights.push({
        icon: Lightbulb,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        message: `${topCategory.category}: ${formatCurrency(topCategory.currentMonth)} this month. ${tip}`,
        type: "tip",
        priority: 4
      });
    }

    // 5. Unusual spending patterns
    const unusualPatterns = categoryAnalysis.filter(item => 
      item.changePercent > 100 && item.currentMonth > 50
    );

    if (unusualPatterns.length > 0) {
      const pattern = unusualPatterns[0];
      insights.push({
        icon: AlertCircle,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        message: `Unusual spike in ${pattern.category} spending detected. Review recent transactions for accuracy`,
        type: "warning",
        priority: 5
      });
    }

    return insights
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 4);
  }, [currentSummary, previousSummary, allExpenses, categoryAnalysis, nextMonthPrediction, formatCurrency]);

  return {
    insights,
    categoryAnalysis,
    nextMonthPrediction,
    isLoading: !currentSummary || !allExpenses,
    currentMonthTotal: currentSummary?.total_expenses || 0,
    previousMonthTotal: previousSummary?.total_expenses || 0
  };
};