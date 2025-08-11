"use client"

import { X, Book, HelpCircle, Mic, PlusCircle, BarChart3, Target, Settings } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

interface DocumentationModalProps {
  isOpen: boolean
  onClose: () => void
  type: "guide" | "faq"
}

const DocumentationModal = ({ isOpen, onClose, type }: DocumentationModalProps) => {
  const { getModalClass, getTextClass } = useTheme()

  if (!isOpen) return null

  const userGuideContent = [
    {
      icon: PlusCircle,
      title: "Adding Transactions",
      content: "Click the '+' button or use voice recording to add expenses and income. Fill in amount, category, and description."
    },
    {
      icon: Mic,
      title: "Voice Recording",
      content: "Click the microphone button and speak naturally: 'I spent $50 on groceries' or 'I earned $1000 from salary'."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      content: "View spending trends, category breakdowns, and monthly summaries in the Analytics section."
    },
    {
      icon: Target,
      title: "Budgets & Goals",
      content: "Set monthly budgets for categories and create savings goals to track your financial progress."
    },
    {
      icon: Settings,
      title: "Settings & Export",
      content: "Customize your experience, change currency, export data, and manage your account in Settings."
    }
  ]

  const faqContent = [
    {
      question: "How does voice recording work?",
      answer: "Our AI processes your speech to automatically extract transaction details. Just speak naturally about your expense or income."
    },
    {
      question: "Can I edit transactions after adding them?",
      answer: "Yes, click on any transaction in your history to edit the amount, category, description, or date."
    },
    {
      question: "How do I set up budgets?",
      answer: "Go to the Budgets section, click 'Add Budget', select a category, set your monthly limit, and track your progress."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes, all data is stored locally and encrypted. You can export your data anytime and control privacy settings."
    },
    {
      question: "Can I use different currencies?",
      answer: "Yes, go to Settings > General to change your preferred currency. All amounts will be displayed in your chosen currency."
    },
    {
      question: "How do I export my data?",
      answer: "Go to Settings > Data Management and click 'Export All Data' to download a PDF report of your transactions."
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${getModalClass()} w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            {type === "guide" ? <Book className="w-6 h-6 text-blue-600" /> : <HelpCircle className="w-6 h-6 text-purple-600" />}
            <h2 className={`text-2xl font-bold ${getTextClass('primary')}`}>
              {type === "guide" ? "User Guide" : "Frequently Asked Questions"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {type === "guide" ? (
            <div className="space-y-6">
              <p className={`text-lg ${getTextClass('secondary')} mb-8`}>
                Learn how to make the most of your Smart Expense Tracker with these essential features:
              </p>
              
              {userGuideContent.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex gap-4 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold ${getTextClass('primary')} mb-2`}>
                        {item.title}
                      </h3>
                      <p className={getTextClass('secondary')}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <p className={`text-lg ${getTextClass('secondary')} mb-8`}>
                Find answers to common questions about using the Smart Expense Tracker:
              </p>
              
              {faqContent.map((item, index) => (
                <div key={index} className="p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
                  <h3 className={`text-xl font-semibold ${getTextClass('primary')} mb-3`}>
                    {item.question}
                  </h3>
                  <p className={getTextClass('secondary')}>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentationModal