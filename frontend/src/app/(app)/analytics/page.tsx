"use client"

import { useQuery } from "@tanstack/react-query"
import { getHistoricalSummary } from "@/services/apiService"
import { useTransactions } from "@/hooks/useTransactions"
import { useSummary } from "@/hooks/useSummary"
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart"
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart"
import { FinancialHealthScore } from "@/components/FinancialHealthScore"
import { BarChart3, PieChart, TrendingUp, Activity, Calendar, Filter } from "lucide-react"
import { useState } from "react"
import { useCurrency } from "@/context/CurrencyContext"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const { data: historicalData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["summary", "historical"],
    queryFn: getHistoricalSummary,
  })

  const { expenses, isLoading: isLoadingTransactions } = useTransactions()
  const { monthlySummary, isLoading: isLoadingSummary } = useSummary()
  const {currency}= useCurrency()

  const isLoading = isLoadingHistory || isLoadingTransactions || isLoadingSummary

  // Calculate analytics insights
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
  const avgMonthlyExpenses = historicalData
    ? historicalData.reduce((sum, d) => sum + d.total_expenses, 0) / historicalData.length
    : 0
  const expenseCategories =
    expenses?.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}
  const topCategory = Object.entries(expenseCategories).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-medium text-slate-600 dark:text-slate-300">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-slate-700/50">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Financial Analytics</span>
          </div>
          
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Total Expenses
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl">
                  <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Avg Monthly
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(avgMonthlyExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl">
                  <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Top Category
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{topCategory}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl">
                  <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Transactions
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{expenses?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Analytics Filters</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Range:</label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="12months">Last 12 Months</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Categories</option>
                    <option value="Food & Drinks">Food & Drinks</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">{historicalData && <SpendingTrendChart data={historicalData} />}</div>
          <div className="lg:col-span-2">{expenses && <CategoryBreakdownChart expenses={expenses} />}</div>
        </div>

        {/* Financial Health Score */}
        <div>
          {monthlySummary && (
            <FinancialHealthScore income={monthlySummary.total_income} expenses={monthlySummary.total_expenses} />
          )}
        </div>
      </div>
    </div>
  )
}
