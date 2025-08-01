"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useCurrency } from "@/context/CurrencyContext"
import { TrendingUp } from "lucide-react"
import type { HistoricalDataPoint } from "@/types"

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const SpendingTrendChart = ({ data }: { data: HistoricalDataPoint[] }) => {
  const { currency } = useCurrency()
  const chartData = data.map((d) => ({
    name: monthNames[d.month - 1],
    Expenses: d.total_expenses,
    Income: d.total_income,
  }))

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact" }).format(value)

  const totalExpenses = data.reduce((sum, d) => sum + d.total_expenses, 0)
  const avgExpenses = totalExpenses / data.length
  const trend =
    data.length > 1
      ? ((data[data.length - 1].total_expenses - data[0].total_expenses) / data[0].total_expenses) * 100
      : 0

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Income vs Expenses</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">6-month financial overview</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(avgExpenses)}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Average Monthly</div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCurrency} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.1)", radius: 8 }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: "#1e293b" }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="Income" fill="url(#incomeGradient)" radius={[8, 8, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Expenses" fill="url(#expenseGradient)" radius={[8, 8, 0, 0]} maxBarSize={40} />
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
