"use client"

import { useState, useMemo } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { useCurrency } from "@/context/CurrencyContext"
import { useTheme } from "@/context/ThemeContext"
import TransactionList from "@/components/TransactionList"
import { generateTransactionReport } from "@/services/reportService"
import { Search, Filter, Calendar, Download, Plus, TrendingUp, TrendingDown, Receipt } from "lucide-react"

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [dateRange, setDateRange] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [exportMonth, setExportMonth] = useState(new Date().getMonth())
  const [exportYear, setExportYear] = useState(new Date().getFullYear())

  const { expenses, incomes, isLoading } = useTransactions(searchTerm)
  const { currency } = useCurrency()
  const { getCardClass } = useTheme()

  // Calculate totals for the current filter
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
  const totalIncome = incomes?.reduce((sum, income) => sum + income.amount, 0) || 0
  const netAmount = totalIncome - totalExpenses

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount)

  const getFilterStats = () => {
    switch (filter) {
      case "income":
        return {
          count: incomes?.length || 0,
          amount: totalIncome,
          label: "Total Income",
          icon: TrendingUp,
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        }
      case "expense":
        return {
          count: expenses?.length || 0,
          amount: totalExpenses,
          label: "Total Expenses",
          icon: TrendingDown,
          color: "text-rose-600 dark:text-rose-400",
          bgColor: "bg-rose-50 dark:bg-rose-900/20",
        }
      default:
        return {
          count: (expenses?.length || 0) + (incomes?.length || 0),
          amount: Math.abs(netAmount),
          label: netAmount >= 0 ? "Net Positive" : "Net Negative",
          icon: Receipt,
          color: netAmount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
          bgColor: netAmount >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20",
        }
    }
  }

  const stats = getFilterStats()
  const StatsIcon = stats.icon

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    
    const combined = [
      ...(incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []),
      ...(expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
    ]
    
    // Apply transaction type filter
    const typeFiltered = combined.filter(t => {
      if (filter === 'income') return t.type === 'income'
      if (filter === 'expense') return t.type === 'expense'
      return true
    })
    
    // Apply date range filter
    const dateFiltered = typeFiltered.filter(t => {
      const transactionDate = new Date(t.data.date)
      switch (dateRange) {
        case 'today':
          return transactionDate.toDateString() === now.toDateString()
        case 'week':
          const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
          return transactionDate >= oneWeekAgo
        case 'month':
          return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          return transactionDate.getMonth() === lastMonth.getMonth() && transactionDate.getFullYear() === lastMonth.getFullYear()
        case 'quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3)
          const transactionQuarter = Math.floor(transactionDate.getMonth() / 3)
          return transactionQuarter === currentQuarter && transactionDate.getFullYear() === now.getFullYear()
        case 'year':
          return transactionDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })
    
    // Apply sorting
    return dateFiltered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.data.amount - a.data.amount
        case 'category':
          return a.data.category.localeCompare(b.data.category)
        case 'description':
          return (a.data.description || '').localeCompare(b.data.description || '')
        case 'date':
        default:
          return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
      }
    })
  }, [incomes, expenses, dateRange, sortBy, filter])

  const handleExportData = () => {
    const exportTransactions = [
      ...(incomes?.map(income => ({ type: 'income' as const, data: income })) ?? []),
      ...(expenses?.map(expense => ({ type: 'expense' as const, data: expense })) ?? [])
    ].filter(t => {
      const transactionDate = new Date(t.data.date)
      return transactionDate.getMonth() === exportMonth && transactionDate.getFullYear() === exportYear
    })
    
    if (exportTransactions.length > 0) {
      const monthName = new Date(exportYear, exportMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      generateTransactionReport(exportTransactions, monthName, currency)
    } else {
      alert('No transactions found for the selected month.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-slate-700/50">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Transaction Management</span>
          </div>
          
        </div>

        {/* Stats Card */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 ${stats.bgColor} rounded-2xl`}>
                  <StatsIcon size={32} className={stats.color} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.amount)}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{stats.label}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.count}</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {stats.count === 1 ? "Transaction" : "Transactions"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Search Transactions
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by description, category, or amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
                {/* Transaction Type Filter */}
                <div className="min-w-[200px]">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Transaction Type
                  </label>
                  <div className="relative">
                    <Filter
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={18}
                    />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as "all" | "income" | "expense")}
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="all">All Transactions</option>
                      <option value="income">Income Only</option>
                      <option value="expense">Expenses Only</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="min-w-[180px]">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Date Range
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={18}
                    />
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="lastMonth">Last Month</option>
                      <option value="year">This Year</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div className="min-w-[160px]">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Sort By</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 pr-10 py-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="category">Category</option>
                      <option value="description">Description</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Section */}
            <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex flex-col lg:flex-row gap-6 items-end">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Export Monthly Report</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Month</label>
                      <select
                        value={exportMonth}
                        onChange={(e) => setExportMonth(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>
                            {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Year</label>
                      <select
                        value={exportYear}
                        onChange={(e) => setExportYear(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - 2 + i
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div className="p-2">
            <TransactionList 
              expenses={filteredTransactions.filter(t => t.type === 'expense').map(t => t.data)} 
              incomes={filteredTransactions.filter(t => t.type === 'income').map(t => t.data)} 
              isLoading={isLoading} 
              filter={filter} 
            />
          </div>
        </div>
      </div>
  )
}
