"use client"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { LogOut, UserIcon, Calendar, Bell, Sun, Moon, Wallet, ChevronDown, Search } from "lucide-react"
import { useState, useEffect } from "react"

const Header = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const pathname = usePathname()

  const [currentDate, setCurrentDate] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
      )
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-3 shadow-lg shadow-blue-500/25">
                <Wallet size={24} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                SmartExpense Pro
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Advanced Finance Manager</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search transactions, budgets..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Date and Time */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
              <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
              <div className="text-sm">
                <div className="font-medium text-slate-900 dark:text-white">{currentDate}</div>
                <div className="text-slate-500 dark:text-slate-400">{currentTime}</div>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-3 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200 group">
              <Bell size={18} />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">3</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-3 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200 group overflow-hidden"
            >
              <div className="relative z-10">{isDark ? <Sun size={18} /> : <Moon size={18} />}</div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <UserIcon size={16} className="text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {getGreeting()}, {user?.name || "User"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email || "user@example.com"}</div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/10 dark:shadow-slate-900/30 overflow-hidden">
                  <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <UserIcon size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{user?.name || "User Name"}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {user?.email || "user@example.com"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
