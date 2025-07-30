"use client"

import type React from "react"

import { useSummary } from "@/hooks/useSummary"
import { useTransactions } from "@/hooks/useTransactions"
import { useCurrency } from "@/context/CurrencyContext"
import TransactionList from "@/components/TransactionList"
import QuickAddWidget from "@/components/QuickAddWidget"
import BudgetAlertsWidget from "@/components/BudgetAlertsWidget"
import SmartInsightsWidget from "@/components/SmartInsightsWidget"
import VoiceRecorder from "@/components/VoiceRecorder"
import AiConfirmationModal from "@/components/AiConfirmationModal"
import { Wallet, TrendingUp, TrendingDown, Target, Sparkles } from "lucide-react"
import { useState } from "react"
import type { AiResponse } from "@/types"

const StatCard = ({
  title,
  amount,
  icon: Icon,
  gradient,
  change,
  trend,
}: {
  title: string
  amount: number
  icon: React.ElementType
  gradient: string
  change?: string
  trend?: "up" | "down" | "neutral"
}) => {
  const { currency } = useCurrency()
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value)

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-emerald-200"
      case "down":
        return "text-red-200"
      default:
        return "text-white/70"
    }
  }

  return (
    <div
      className={`${gradient} relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 ease-out`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider mb-1">{title}</h3>
            <div className="w-8 h-0.5 bg-white/30 rounded-full" />
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Icon size={24} className="text-white/90" />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(amount)}</p>
          {change && (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 ${getTrendColor()}`}
              >
                {trend === "up" && <TrendingUp size={14} />}
                {trend === "down" && <TrendingDown size={14} />}
                <span className="text-xs font-medium">{change}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { monthlySummary, runningBalance, isLoading, error } = useSummary()
  const { expenses, incomes, isLoading: isTransactionsLoading, processVoice, isProcessingVoice } = useTransactions()
  const [aiData, setAiData] = useState<AiResponse | null>(null)
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const { monthlySummary: lastMonthlySummary } = useSummary(lastMonthYear, lastMonth)

  const handleVoiceRecording = (audioFile: File) => {
    processVoice(audioFile, {
      onSuccess: (data: AiResponse) => {
        setAiData(data)
      },
      onError: (error) => {
        console.error("Voice processing failed:", error)
      },
    })
  }

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%"
    const change = ((current - previous) / previous) * 100
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`
  }

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "up" : "neutral"
    return current > previous ? "up" : current < previous ? "down" : "neutral"
  }

  // Calculate savings rate
  const savingsRate = monthlySummary?.total_income
    ? ((monthlySummary.total_income - monthlySummary.total_expenses) / monthlySummary.total_income) * 100
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-medium text-slate-600 dark:text-slate-300">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-red-200 dark:border-red-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-xl font-medium text-red-600 dark:text-red-400">Error loading dashboard data</p>
          <p className="text-slate-500 dark:text-slate-400">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Net Worth"
            amount={runningBalance?.total_balance ?? 0}
            icon={Wallet}
            gradient="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl shadow-xl shadow-emerald-500/25"
            change={
              lastMonthlySummary
                ? `${calculateChange(runningBalance?.total_balance ?? 0, lastMonthlySummary.total_income - lastMonthlySummary.total_expenses)} from last month`
                : "No previous data"
            }
            trend={
              lastMonthlySummary
                ? getTrend(
                    runningBalance?.total_balance ?? 0,
                    lastMonthlySummary.total_income - lastMonthlySummary.total_expenses,
                  )
                : "neutral"
            }
          />
          <StatCard
            title="Monthly Income"
            amount={monthlySummary?.total_income ?? 0}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-xl shadow-blue-500/25"
            change={
              lastMonthlySummary
                ? `${calculateChange(monthlySummary?.total_income ?? 0, lastMonthlySummary.total_income)} from last month`
                : "No previous data"
            }
            trend={
              lastMonthlySummary
                ? getTrend(monthlySummary?.total_income ?? 0, lastMonthlySummary.total_income)
                : "neutral"
            }
          />
          <StatCard
            title="Monthly Expenses"
            amount={monthlySummary?.total_expenses ?? 0}
            icon={TrendingDown}
            gradient="bg-gradient-to-br from-rose-500 via-pink-600 to-red-600 rounded-3xl shadow-xl shadow-rose-500/25"
            change={
              lastMonthlySummary
                ? `${calculateChange(monthlySummary?.total_expenses ?? 0, lastMonthlySummary.total_expenses)} from last month`
                : "No previous data"
            }
            trend={
              lastMonthlySummary
                ? getTrend(monthlySummary?.total_expenses ?? 0, lastMonthlySummary.total_expenses)
                : "neutral"
            }
          />
          <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-3xl shadow-xl shadow-violet-500/25 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 ease-out">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider mb-1">Savings Rate</h3>
                  <div className="w-8 h-0.5 bg-white/30 rounded-full" />
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Target size={24} className="text-white/90" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-4xl font-bold tracking-tight">{savingsRate.toFixed(1)}%</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70">
                    <span className="text-xs font-medium">Target: 20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <QuickAddWidget />
          <BudgetAlertsWidget />
          <SmartInsightsWidget />
        </div>

        {/* Recent Transactions */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-2">
              Recent Transactions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Your latest financial activity</p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
            <TransactionList
              expenses={expenses?.slice(0, 10)}
              incomes={incomes?.slice(0, 10)}
              isLoading={isTransactionsLoading}
              filter="all"
            />
          </div>
        </div>

        {/* Voice Recorder */}
        <div className="fixed bottom-8 right-8 z-50">
          <VoiceRecorder onRecordingComplete={handleVoiceRecording} isProcessing={isProcessingVoice} />
        </div>

        <AiConfirmationModal aiData={aiData} onClose={() => setAiData(null)} />
      </div>
    </div>
  )
}
