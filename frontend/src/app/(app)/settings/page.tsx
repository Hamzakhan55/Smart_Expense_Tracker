"use client"

import type React from "react"

import { useState } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { useCurrency } from "@/context/CurrencyContext"
import { generateTransactionReport } from "@/services/reportService"
import CurrencySelector from "@/components/CurrencySelector"
import DocumentationModal from "@/components/DocumentationModal"
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
  const { user, updateUser } = useAuth()
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
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState<{ isOpen: boolean; type: 'guide' | 'faq' }>({ isOpen: false, type: 'guide' })

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

  const handleCreateBackup = () => {
    if (allTransactions.length > 0) {
      generateTransactionReport(allTransactions, "Backup_" + new Date().toISOString().split('T')[0], currency)
      alert("Backup created successfully!")
    } else {
      alert("No data to backup.")
    }
  }

  const handleResetSettings = () => {
    const confirmation = window.confirm("Are you sure you want to reset all settings to default values?")
    if (confirmation) {
      setNotifications({
        budgetAlerts: true,
        goalReminders: true,
        weeklyReports: false,
        emailNotifications: true,
      })
      setPrivacy({
        showBalance: true,
        shareAnalytics: false,
        dataCollection: true,
      })
      alert("Settings have been reset to default values.")
    }
  }

  const handleLeaveReview = () => {
    window.open('https://github.com/Hamzakhan55/Smart_Expense_Tracker/issues/new?template=review.md&title=App%20Review', '_blank')
  }

  const handleUserGuide = () => {
    setShowDocumentation({ isOpen: true, type: 'guide' })
  }

  const handleFAQ = () => {
    setShowDocumentation({ isOpen: true, type: 'faq' })
  }

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const { updateEmail } = await import('@/services/apiService')
      const updatedUser = await updateEmail(emailForm.newEmail)
      updateUser({ email: updatedUser.email })
      alert('Email updated successfully!')
      setShowChangeEmailModal(false)
      setEmailForm({ newEmail: '', password: '' })
    } catch (error) {
      alert('Failed to update email. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }
    setIsUpdating(true)
    try {
      const { updatePassword } = await import('@/services/apiService')
      await updatePassword(passwordForm.newPassword)
      alert('Password updated successfully!')
      setShowChangePasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      alert('Failed to update password. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const settingSections = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "data", label: "Data Management", icon: Database },
    { id: "support", label: "Support", icon: Mail },
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
    <div className="flex items-center justify-between p-8 border-b border-slate-200/30 dark:border-slate-700/30 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all duration-200 group">
      <div className="flex items-center gap-6">
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-200">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-base text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
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
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <SettingsIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">General Settings</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configure your basic preferences</p>
                  </div>
                </div>
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
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Account Information</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile and security</p>
                  </div>
                </div>
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
                    <button 
                      onClick={() => setShowChangeEmailModal(true)}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200"
                    >
                      Change Email
                    </button>
                  </SettingItem>
                  <SettingItem icon={Lock} title="Password" description="Change your account password">
                    <button 
                      onClick={() => setShowChangePasswordModal(true)}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200"
                    >
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
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Control how you receive updates</p>
                  </div>
                </div>
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
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy & Security</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Protect your data and privacy</p>
                  </div>
                </div>
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
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Data Management</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Export and backup your information</p>
                  </div>
                </div>
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
                    <button 
                      onClick={handleCreateBackup}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                      <Database size={18} />
                      Create Backup
                    </button>
                  </div>
                </div>
              </div>
            </SettingCard>
          </div>
        )

      case "support":
        return (
          <div className="space-y-6">
            <SettingCard>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Support & Contact</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get help and provide feedback</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Contact Developer</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Get in touch for support, feedback, or feature requests
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <a href="mailto:hamzakhan127109@gmail.com" className="text-sm text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200">hamzakhan127109@gmail.com</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <a href="https://github.com/Hamzakhan55" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200">https://github.com/Hamzakhan55</a>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Rate & Review</h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-200">
                          Help us improve by sharing your experience
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLeaveReview}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Leave a Review
                    </button>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Documentation</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-200">
                          Learn how to use all features effectively
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleUserGuide}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200">
                        User Guide
                      </button>
                      <button 
                        onClick={handleFAQ}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200">
                        FAQ
                      </button>
                    </div>
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
                      <button 
                        onClick={handleResetSettings}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-semibold hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
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
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <SettingsIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Settings Menu</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your preferences</p>
                  </div>
                </div>
                <nav className="space-y-3">
                  {settingSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-4 px-5 py-4 text-left rounded-2xl transition-all duration-300 group ${
                          activeSection === section.id
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02]"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:scale-[1.01]"
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${
                          activeSection === section.id
                            ? "bg-white/20"
                            : "bg-slate-100 dark:bg-slate-600 group-hover:bg-slate-200 dark:group-hover:bg-slate-500"
                        }`}>
                          <Icon size={20} className={activeSection === section.id ? "text-white" : "text-slate-600 dark:text-slate-400"} />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-base">{section.label}</span>
                        </div>
                        {activeSection === section.id && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
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

        {/* Change Email Modal */}
        {showChangeEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Change Email</h3>
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Email</label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowChangeEmailModal(false)}
                    className="flex-1 py-2 px-4 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isUpdating ? 'Updating...' : 'Update Email'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="flex-1 py-2 px-4 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isUpdating ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Documentation Modal */}
        <DocumentationModal 
          isOpen={showDocumentation.isOpen}
          onClose={() => setShowDocumentation({ isOpen: false, type: 'guide' })}
          type={showDocumentation.type}
        />
      </div>
    </div>
  )
}
