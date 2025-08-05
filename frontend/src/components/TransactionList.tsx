"use client"

import { useMemo, useState } from "react"
import TransactionDetailModal from "./TransactionDetailModal"
import AddTransactionModal from "./AddTransactionModal"
import CategoryIcon from "./CategoryIcon"
import { useCurrency } from "@/context/CurrencyContext"
import { TrendingUp, TrendingDown, Receipt } from "lucide-react"
import type { Expense, Income } from "@/types"

type Transaction = { type: "expense"; data: Expense } | { type: "income"; data: Income }

interface TransactionListProps {
  expenses: Expense[] | undefined
  incomes: Income[] | undefined
  isLoading: boolean
  filter?: "income" | "expense" | "all"
  disableClick?: boolean
}

const TransactionList = ({ expenses, incomes, isLoading, filter = "all", disableClick = false }: TransactionListProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const sortedTransactions = useMemo(() => {
    const incomesToShow =
      filter === "all" || filter === "income"
        ? (incomes?.map((income) => ({ type: "income" as const, data: income })) ?? [])
        : []

    const expensesToShow =
      filter === "all" || filter === "expense"
        ? (expenses?.map((expense) => ({ type: "expense" as const, data: expense })) ?? [])
        : []

    const combined = [...incomesToShow, ...expensesToShow]
    combined.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())

    return combined
  }, [incomes, expenses, filter])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4 p-6 bg-slate-100 dark:bg-slate-700/50 rounded-2xl">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded-lg w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded-lg w-1/2"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded-lg w-20"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded-lg w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-8">
        {sortedTransactions.length > 0 ? (
          <div className="space-y-3">
            {sortedTransactions.map((transaction, index) => (
              <TransactionItemEnhanced
                key={`${transaction.type}-${transaction.data.id}`}
                transaction={transaction}
                onClick={disableClick ? undefined : () => setSelectedTransaction(transaction)}
                index={index}
                disableClick={disableClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              {filter === "income" ? (
                <TrendingUp className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              ) : filter === "expense" ? (
                <TrendingDown className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              ) : (
                <Receipt className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No transactions found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {filter === "all"
                ? "Start by adding your first transaction"
                : `No ${filter} transactions found for this period`}
            </p>
          </div>
        )}
      </div>

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onEdit={() => {
          setIsEditModalOpen(true)
        }}
      />
      
      <AddTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTransaction(null)
        }}
        transactionToEdit={selectedTransaction}
      />
    </>
  )
}

// Enhanced Transaction Item Component
const TransactionItemEnhanced = ({
  transaction,
  onClick,
  index,
  disableClick = false,
}: {
  transaction: Transaction
  onClick?: () => void
  index: number
  disableClick?: boolean
}) => {
  const isIncome = transaction.type === "income"
  const { data } = transaction
  const { currency } = useCurrency()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }



  return (
    <div
      onClick={disableClick ? undefined : onClick}
      className={`group p-6 bg-white/50 dark:bg-slate-700/30 rounded-2xl border border-slate-200/50 dark:border-slate-600/50 transition-all duration-200 ${
        disableClick 
          ? "" 
          : "cursor-pointer hover:bg-white/80 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/20 hover:scale-[1.01]"
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
            isIncome
              ? "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400"
              : "bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <CategoryIcon category={data.category} size={24} />
        </div>

        {/* Transaction Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white truncate">{data.description}</h4>
            <div
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                isIncome
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
              }`}
            >
              {data.category}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{formatDate(data.date)}</span>
            <span>•</span>
            <span className="capitalize">{transaction.type}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <div
            className={`text-xl font-bold ${
              isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(data.amount)}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {isIncome ? (
              <TrendingUp size={12} className="inline mr-1" />
            ) : (
              <TrendingDown size={12} className="inline mr-1" />
            )}
            {isIncome ? "Income" : "Expense"}
          </div>
        </div>

        {/* Hover Arrow */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default TransactionList
