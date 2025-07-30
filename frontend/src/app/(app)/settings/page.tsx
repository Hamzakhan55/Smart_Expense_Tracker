"use client"

import type React from "react"

import { useState } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { useCurrency } from "@/context/CurrencyContext"
import { generateTransactionReport } from "@/services/reportService"
import CurrencySelector from "@/components/CurrencySelector"
import {
  SettingsIcon,
  User,
  Globe,
  Download,
  Trash2,
  Shield,
  Bell,
  Moon,
  Sun,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Palette,
  Lock,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react"
import { useMemo } from "react"

export default function SettingsPage() {
  const { expenses, incomes, clearAllTransactions } = useTransactions()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { currency } = useCurrency()

  const [activeSection, setActiveSection] = useState("general")
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false,
    emailNotifications: true,
  })
  const [privacy, setPrivacy] = useState({
    showBalance: true,
    shareAnalytics: false,
    dataCollection: true,
  })

  const allTransactions = useMemo(() => {
    const combined = [
      ...(incomes?.map((income) => ({ type: "income" as const, data: income })) ?? []),
      ...(expenses?.map((expense) => ({ type: "expense" as const, data: expense })) ?? []),
    ]
    combined.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
    return combined
  }, [incomes, expenses])

  const handleExportAll = () => {
    if (allTransactions.length > 0) {
      generateTransactionReport(allTransactions, "Full History")
    } else {
      alert("No transactions to export.")
    }
  }

  const handleDeleteAll = () => {
    const confirmation = window.prompt("This action cannot be undone. Please type 'DELETE' to confirm.")
    if (confirmation === "DELETE") {
      clearAllTransactions()
      alert("All transaction data has been deleted.")
    } else {
      alert("Deletion cancelled.")
    }
  }

  const settingSections = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "data", label: "Data Management", icon: Database },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ]

  const SettingCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden ${className}`}
    >
      {children}
    </div>
  )

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    children,
  }: {
    icon: React.ElementType
    title: string
    description: string
    children: React.ReactNode
  }) => (
    <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <SettingCard>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">General Settings</h3>
                <div className="space-y-0">
                  <SettingItem icon={Globe} title="Currency" description="Choose your preferred currency">
                    <CurrencySelector />
                  </SettingItem>
                  <SettingItem
                    icon={isDark ? Sun : Moon}
                    title="Theme"
                    description="Switch between light and dark mode"
                  >
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all duration-200"
                    >
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </button>
                  </SettingItem>
                  <SettingItem icon={Palette} title="Language" description="Select your preferred language">
                    <select className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </SettingItem>
                </div>
              </div>
            </SettingCard>
          </div>
        )

      case "account":
        return (
          <div className="space-y-6">
            <SettingCard>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Account Information</h3>
                <div className="space-y-0">
                  <SettingItem icon={User} title="Profile" description="Manage your profile information">
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 dark:text-white">{user?.name || "User Name"}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {user?.email || "user@example.com"}
                      </div>
                    </div>
                  </SettingItem>
                  <SettingItem icon={Mail} title="Email" description="Update your email address">
                    <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200">
                      Change Email
                    </button>
                  </SettingItem>
                  <SettingItem icon={Lock} title="Password" description="Change your account password">
                    <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200">
                      Change Password
                    </button>
                  </SettingItem>
                  <SettingItem icon={Smartphone} title="Two-Factor Auth" description="Secure your account with 2FA">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Enabled</span>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                  </SettingItem>
                </div>
              </div>
            </SettingCard>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <SettingCard>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h3>
                <div className="space-y-0">
                  <SettingItem
                    icon={Bell}
                    title="Budget Alerts"
                    description="Get notified when you're close to budget limits"
                  >
                    <Toggle
                      checked={notifications.budgetAlerts}
                      onChange={(checked) => setNotifications({ ...notifications, budgetAlerts: checked })}
                    />
                  </SettingItem>
                  <SettingItem
                    icon={Bell}
                    title="Goal Reminders"
                    description="Receive reminders about your savings goals"
                  >
                    <Toggle
                      checked={notifications.goalReminders}
                      onChange={(checked) => setNotifications({ ...notifications, goalReminders: checked })}
                    />
                  </SettingItem>
                  <SettingItem
                    icon={FileText}
                    title="Weekly Reports"
                    description="Get weekly spending summaries via email"
                  >
                    <Toggle
                      checked={notifications.weeklyReports}
                      onChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                    />
                  </SettingItem>
                  <SettingItem
                    icon={Mail}
                    title="Email Notifications"
                    description="Receive important updates via email"
                  >
                    <Toggle
                      checked={notifications.emailNotifications}
                      onChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </SettingItem>
                </div>
              </div>
            </SettingCard>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-6">
            <SettingCard>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Privacy & Security</h3>
                <div className="space-y-0">
                  <SettingItem
                    icon={privacy.showBalance ? Eye : EyeOff}
                    title="Show Balance"
                    description="Display account balances on dashboard"
                  >
                    <Toggle
                      checked={privacy.showBalance}
                      onChange={(checked) => setPrivacy({ ...privacy, showBalance: checked })}
                    />
                  </SettingItem>
                  <SettingItem
                    icon={Shield}
                    title="Share Analytics"
                    description="Help improve the app by sharing anonymous usage data"
                  >
                    <Toggle
                      checked={privacy.shareAnalytics}
                      onChange={(checked) => setPrivacy({ ...privacy, shareAnalytics: checked })}
                    />
                  </SettingItem>
                  <SettingItem
                    icon={Database}
                    title="Data Collection"
                    description="Allow collection of usage data for personalized insights"
                  >
                    <Toggle
                      checked={privacy.dataCollection}
                      onChange={(checked) => setPrivacy({ ...privacy, dataCollection: checked })}
                    />
                  </SettingItem>
                </div>
              </div>
            </SettingCard>
          </div>
        )

      case "data":
        return (
          <div className="space-y-6">
            <SettingCard>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Data Management</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Export Data</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Download a complete PDF report of your transaction history
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p>Total transactions: {allTransactions.length}</p>
                        <p>Last updated: {new Date().toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={handleExportAll}
                        disabled={allTransactions.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Download size={18} />
                        Export All Data
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Backup Data</h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-200">
                          Create a backup of all your financial data
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                      <Database size={18} />
                      Create Backup
                    </button>
                  </div>
                </div>
              </div>
            </SettingCard>
          </div>
        )

      case "danger":
        return (
          <div className="space-y-6">
            <SettingCard className="border-red-200 dark:border-red-800">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                    <p className="text-sm text-red-500 dark:text-red-400">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl border border-red-200/50 dark:border-red-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                          Delete All Transaction Data
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-200 mb-4">
                          Permanently delete all of your incomes and expenses. This action cannot be undone.
                        </p>
                        <div className="text-xs text-red-600 dark:text-red-300">
                          <p>• All transaction history will be lost</p>
                          <p>• Budget and goal data will remain intact</p>
                          <p>• This action requires confirmation</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDeleteAll}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-semibold hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Trash2 size={18} />
                        Delete All Data
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                          Reset All Settings
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-200 mb-4">
                          Reset all application settings to their default values.
                        </p>
                        <div className="text-xs text-amber-600 dark:text-amber-300">
                          <p>• All preferences will be reset</p>
                          <p>• Transaction data will remain intact</p>
                          <p>• You will need to reconfigure your preferences</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-semibold hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                        <SettingsIcon size={18} />
                        Reset Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SettingCard>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-slate-700/50">
            <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Application Settings</span>
          </div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <SettingCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Settings Menu</h3>
                <nav className="space-y-2">
                  {settingSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl transition-all duration-200 ${
                          activeSection === section.id
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </SettingCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}
