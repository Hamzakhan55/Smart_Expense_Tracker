"use client"

import { useState } from "react"
import { useSmartInsights } from "@/hooks/useSmartInsights"
import { useTheme } from "@/context/ThemeContext"
import InfoTooltip from "@/components/InfoTooltip"
import { Sparkles, Brain, BarChart3, Zap } from "lucide-react"

const SmartInsightsWidget = () => {
  const { insights, isLoading, predictions, currentMonthTotal, previousMonthTotal } = useSmartInsights()
  const { getCardClass } = useTheme()

  if (isLoading) {
    return (
      <div className={`${getCardClass()} overflow-hidden`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg animate-pulse">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Smart Insights</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI analyzing your data...</p>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-slate-100/50 dark:bg-slate-700/50 rounded-2xl animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${getCardClass()} overflow-hidden group hover:shadow-2xl transition-all duration-300`}>
      <div className="p-8">
        {/* Header with enhanced styling */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
              <Brain className="text-white" size={20} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Smart Insights</h3>
                <InfoTooltip content="AI analyzes your spending patterns to provide personalized predictions, alerts about unusual spending, money-saving tips, and insights about your financial habits. These insights help you make better financial decisions." />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered financial intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full">
            <Zap className="w-3 h-3 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-medium text-violet-700 dark:text-violet-300">LIVE</span>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div
                  key={index}
                  className={`relative p-5 ${insight.bgColor} border ${insight.borderColor} rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group/insight cursor-pointer`}
                >
                  {/* Priority indicator */}
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-xl shadow-sm group-hover/insight:shadow-md transition-shadow">
                      <Icon className={`${insight.color}`} size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium mb-2">
                        {insight.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 opacity-70 group-hover/insight:opacity-100 transition-opacity duration-200">
                          <BarChart3 className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                            {insight.type}
                          </span>
                        </div>
                        {insight.type === 'prediction' && (
                          <div className="px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded-full">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">AI Forecast</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Brain className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h4 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Getting Ready to Help You</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                I need to learn about your spending habits first! Add some expenses and income transactions, and I'll start providing personalized insights about your money, predictions for future spending, and tips to save money.
              </p>
              <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                💡 Tip: Add at least 5-10 transactions to get meaningful insights
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {insights.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI Active • Real-time analysis</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default SmartInsightsWidget
