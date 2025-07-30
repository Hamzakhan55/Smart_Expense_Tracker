"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Target,
  TrendingUp,
  PieChart,
  Settings,
  CreditCard,
  Plus,
  Sparkles,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-blue-500 to-indigo-600" },
  { href: "/transactions", label: "Transactions", icon: FileText, color: "from-emerald-500 to-teal-600" },
  { href: "/budgets", label: "Budgets", icon: Target, color: "from-amber-500 to-orange-600" },
  { href: "/goals", label: "Goals", icon: TrendingUp, color: "from-purple-500 to-violet-600" },
  { href: "/analytics", label: "Analytics", icon: PieChart, color: "from-rose-500 to-pink-600" },
  { href: "/settings", label: "Settings", icon: Settings, color: "from-slate-500 to-gray-600" },
]

const NavigationBar = () => {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <nav className="fixed top-20 left-0 right-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const isHovered = hoveredItem === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-300 rounded-2xl group ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {/* Active/Hover Background */}
                  {(isActive || isHovered) && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl transition-all duration-300 ${
                        isActive ? "opacity-100 shadow-lg" : "opacity-10"
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 flex items-center justify-center">
                    <Icon
                      size={18}
                      className={`transition-all duration-300 ${
                        isActive ? "text-white" : isHovered ? "scale-110" : ""
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span className="relative z-10 font-semibold">{item.label}</span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                  )}

                  {/* Hover Glow Effect */}
                  {isHovered && !isActive && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl opacity-5 blur-xl scale-110`}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          
        </div>
      </div>
    </nav>
  )
}

export default NavigationBar
