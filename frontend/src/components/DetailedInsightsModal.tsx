'use client';

import { useState } from 'react';
import { useSmartInsights } from '@/hooks/useSmartInsights';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Target,
  Lightbulb,
  Brain,
  ArrowRight
} from 'lucide-react';

interface DetailedInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DetailedInsightsModal = ({ isOpen, onClose }: DetailedInsightsModalProps) => {
  const { insights, categoryAnalysis, nextMonthPrediction, currentMonthTotal, previousMonthTotal } = useSmartInsights();
  const { currency } = useCurrency();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

  if (!isOpen) return null;

  const monthlyChange = currentMonthTotal - previousMonthTotal;
  const monthlyChangePercent = previousMonthTotal > 0 ? (monthlyChange / previousMonthTotal) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Detailed Financial Analysis</h2>
                <p className="text-slate-600 dark:text-slate-400">AI-powered insights and predictions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">This Month</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 truncate" title={formatCurrency(currentMonthTotal)}>
                {formatCurrency(currentMonthTotal)}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300 truncate">Predicted Next</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 truncate" 
                 title={nextMonthPrediction ? formatCurrency(nextMonthPrediction) : 'N/A'}>
                {nextMonthPrediction ? formatCurrency(nextMonthPrediction) : 'N/A'}
              </p>
            </div>

            <div className={`p-4 bg-gradient-to-br rounded-2xl border overflow-hidden ${
              monthlyChange >= 0 
                ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200/50 dark:border-red-700/50'
                : 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200/50 dark:border-green-700/50'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {monthlyChange >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium truncate ${
                  monthlyChange >= 0 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-green-700 dark:text-green-300'
                }`}>
                  Monthly Change
                </span>
              </div>
              <p className={`text-2xl font-bold truncate ${
                monthlyChange >= 0 
                  ? 'text-red-900 dark:text-red-100' 
                  : 'text-green-900 dark:text-green-100'
              }`} title={`${monthlyChange >= 0 ? '+' : ''}${monthlyChangePercent.toFixed(1)}%`}>
                {monthlyChange >= 0 ? '+' : ''}{monthlyChangePercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Detailed Insights */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              AI Insights & Recommendations
            </h3>
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={index}
                    className={`p-5 ${insight.bgColor} border ${insight.borderColor} rounded-2xl overflow-hidden`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl flex-shrink-0">
                        <Icon className={`${insight.color}`} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                            insight.type === 'prediction' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            insight.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            insight.type === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {insight.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              Category Spending Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryAnalysis
                .filter(cat => cat.currentMonth > 0)
                .sort((a, b) => b.currentMonth - a.currentMonth)
                .slice(0, 6)
                .map((category, index) => {
                  const isIncrease = category.change > 0;
                  const hasSignificantChange = Math.abs(category.changePercent) > 10;
                  
                  return (
                    <div
                      key={category.category}
                      className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <h4 className="font-medium text-slate-900 dark:text-white truncate flex-1 min-w-0">
                          {category.category}
                        </h4>
                        {hasSignificantChange && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 ${
                            isIncrease 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(category.changePercent).toFixed(0)}%
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400 flex-shrink-0">This month</span>
                          <span className="font-semibold text-slate-900 dark:text-white text-right truncate min-w-0">
                            {formatCurrency(category.currentMonth)}
                          </span>
                        </div>
                        
                        {category.previousMonth > 0 && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-500 flex-shrink-0">Last month</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400 text-right truncate min-w-0">
                              {formatCurrency(category.previousMonth)}
                            </span>
                          </div>
                        )}
                        
                        {category.change !== 0 && (
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-600 gap-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400 flex-shrink-0">Change</span>
                            <span className={`text-sm font-medium text-right truncate min-w-0 ${
                              isIncrease ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {isIncrease ? '+' : ''}{formatCurrency(category.change)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedInsightsModal;