'use client';

import { useMemo } from 'react';
import { useSummary } from './useSummary';
import { useTransactions } from './useTransactions';
import { useCurrency } from '@/context/CurrencyContext';
import { Calendar, TrendingUp, TrendingDown, Target, Lightbulb, AlertTriangle } from 'lucide-react';

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

  const { monthlySummary: currentSummary, isLoading: isLoadingCurrentSummary } = useSummary(currentYear, currentMonth);
  const { monthlySummary: previousSummary, isLoading: isLoadingPreviousSummary } = useSummary(previousYear, previousMonth);
  const { expenses: allExpenses, isLoading: isLoadingTransactions } = useTransactions();
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
      const changePercent = previousAmount > 0 ? Math.abs((change / previousAmount) * 100) : 0;

      return {
        category,
        currentMonth: currentAmount,
        previousMonth: previousAmount,
        change,
        changePercent
      };
    }).filter(item => item.currentMonth > 0 || item.previousMonth > 0);
  }, [currentExpenses, previousExpenses]);

  // Multi-month prediction algorithm
  const predictions = useMemo(() => {
    if (!allExpenses || allExpenses.length < 3) return null;

    // Get last 6 months of data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = currentMonth - i <= 0 ? currentMonth - i + 12 : currentMonth - i;
      const targetYear = currentMonth - i <= 0 ? currentYear - 1 : currentYear;
      
      const monthExpenses = allExpenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() + 1 === targetMonth && expenseDate.getFullYear() === targetYear;
      });
      
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      monthlyData.push({ month: targetMonth, year: targetYear, total });
    }

    if (monthlyData.length < 3) return null;

    // Exponential smoothing
    const alpha = 0.3;
    const beta = 0.2;
    
    let level = monthlyData[0].total;
    let trend = monthlyData[1].total - monthlyData[0].total;
    
    for (let i = 1; i < monthlyData.length; i++) {
      const actual = monthlyData[i].total;
      const prevLevel = level;
      
      level = alpha * actual + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
    }

    // Generate predictions for next 6 months
    const predictions = [];
    const currentTotal = currentSummary?.total_expenses || 0;
    
    for (let monthsAhead = 1; monthsAhead <= 6; monthsAhead++) {
      const futureMonth = (currentMonth + monthsAhead - 1) % 12 + 1;
      const seasonalIndex = 1 + Math.sin((futureMonth * Math.PI) / 6) * 0.1;
      
      const basePrediction = level + (trend * monthsAhead);
      const seasonalPrediction = basePrediction * seasonalIndex;
      
      // Apply bounds
      const lowerBound = currentTotal * 0.6;
      const upperBound = currentTotal * 1.8;
      const finalPrediction = Math.max(lowerBound, Math.min(upperBound, seasonalPrediction));
      
      predictions.push({
        monthsAhead,
        amount: finalPrediction,
        month: futureMonth
      });
    }
    
    return predictions;
  }, [allExpenses, currentMonth, currentYear, currentSummary]);

  // Generate insights
  const insights = useMemo((): InsightData[] => {
    if (!currentSummary || !allExpenses) return [];

    const insights: InsightData[] = [];

    // 1. Multi-month predictions
    if (predictions && currentSummary.total_expenses > 0) {
      const nextMonth = predictions[0];
      const threeMonths = predictions[2];
      
      if (nextMonth) {
        const difference = nextMonth.amount - currentSummary.total_expenses;
        const changePercent = (difference / currentSummary.total_expenses) * 100;
        
        if (Math.abs(changePercent) > 5) {
          const isIncrease = difference > 0;
          
          insights.push({
            icon: Calendar,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            borderColor: "border-yellow-500/20",
            message: `AI predicts your total spending next month will be ${formatCurrency(nextMonth.amount)} (${isIncrease ? '+' : ''}${changePercent.toFixed(0)}% vs current month)`,
            type: "prediction",
            priority: 1
          });
        }
      }
      
      if (threeMonths) {
        const difference = threeMonths.amount - currentSummary.total_expenses;
        const changePercent = (difference / currentSummary.total_expenses) * 100;
        
        if (Math.abs(changePercent) > 10) {
          insights.push({
            icon: TrendingUp,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            borderColor: "border-yellow-500/20",
            message: `3-month forecast: Your spending trend suggests ${formatCurrency(threeMonths.amount)} per month (${changePercent > 0 ? 'increasing' : 'decreasing'} trend)`,
            type: "prediction",
            priority: 1
          });
        }
      }
    }

    // 2. Significant category changes
    const significantChanges = categoryAnalysis
      .filter(item => {
        const hasSignificantChange = Math.abs(item.changePercent) > 25 && Math.abs(item.change) > 100;
        const isReasonablePercent = item.changePercent <= 500;
        return hasSignificantChange && isReasonablePercent;
      })
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
      .filter(item => item.currentMonth > 50)
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
    } else if (currentSummary.total_expenses > 0) {
      // General tips when no specific category spending is high enough
      const generalTips = [
        "Track every expense, no matter how small - it adds up over time",
        "Set up automatic savings - even PKR 1,000 per month makes a difference",
        "Review your subscriptions monthly and cancel unused ones",
        "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
        "Compare prices before making purchases over PKR 1,000"
      ];
      
      const randomTip = generalTips[Math.floor(Math.random() * generalTips.length)];
      
      insights.push({
        icon: Lightbulb,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        message: `Money Tip: ${randomTip}`,
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
        icon: AlertTriangle,
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
  }, [currentSummary, previousSummary, allExpenses, categoryAnalysis, predictions, formatCurrency]);

  return {
    insights,
    categoryAnalysis,
    predictions,
    isLoading: isLoadingCurrentSummary || isLoadingPreviousSummary || isLoadingTransactions || !currentSummary || !allExpenses,
    currentMonthTotal: currentSummary?.total_expenses || 0,
    previousMonthTotal: previousSummary?.total_expenses || 0
  };
};