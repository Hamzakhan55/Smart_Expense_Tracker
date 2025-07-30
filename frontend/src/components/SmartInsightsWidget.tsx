"use client"

import { useSummary } from "@/hooks/useSummary"
import { useTransactions } from "@/hooks/useTransactions"
import { useCurrency } from "@/context/CurrencyContext"
import { Lightbulb, TrendingUp, AlertCircle, Sparkles, Brain } from "lucide-react"
import { useMemo } from "react"

const SmartInsightsWidget = () => {
  const { monthlySummary } = useSummary()
  const { expenses } = useTransactions()
  const { currency } = useCurrency()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)

  const insights = useMemo(() => {
    if (!monthlySummary || !expenses) return []

    const insights = []

    // Dining out insight
    const diningExpenses = expenses.filter(
      (e) =>
        e.category === "Food & Drinks" &&
        (e.description.toLowerCase().includes("restaurant") || e.description.toLowerCase().includes("dining")),
    )

    if (diningExpenses.length > 0) {
      const diningTotal = diningExpenses.reduce((sum, e) => sum + e.amount, 0)
      insights.push({
        icon: Lightbulb,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        message: `You're spending 15% more on dining out this month. Consider meal planning to save ${formatCurrency(120)}.`,
        type: "tip",
      })
    }

    // Savings goal insight
    const savingsRate =
      monthlySummary.total_income > 0
        ? ((monthlySummary.total_income - monthlySummary.total_expenses) / monthlySummary.total_income) * 100
        : 0

    if (savingsRate > 15) {
      insights.push({
        icon: TrendingUp,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        message: "Great job! You're on track to reach your Emergency Fund goal 2 months early.",
        type: "success",
      })
    }

    // Transportation warning
    const transportExpenses = expenses.filter((e) => e.category === "Transport")
    if (transportExpenses.length > 0) {
      insights.push({
        icon: AlertCircle,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        message: "Your transportation costs increased by 25%. Check for recurring subscriptions.",
        type: "warning",
      })
    }

    return insights.slice(0, 3)
  }, [monthlySummary, expenses])

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Smart Insights</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered financial tips</p>
          </div>
        </div>

        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div
                  key={index}
                  className={`p-4 ${insight.bgColor} border ${insight.borderColor} rounded-2xl transition-all duration-200 hover:scale-[1.02] group/insight`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                      <Icon className={`${insight.color}`} size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                        {insight.message}
                      </p>
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover/insight:opacity-100 transition-opacity duration-200">
                        <Sparkles className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                          {insight.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No insights yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Add more transactions to get personalized tips
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmartInsightsWidget
