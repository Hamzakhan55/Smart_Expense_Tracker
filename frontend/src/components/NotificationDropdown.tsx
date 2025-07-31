"use client"

import { useState, useRef, useEffect } from "react"
import { useNotifications } from "@/context/NotificationContext"
import { Bell, X, AlertTriangle, Target, TrendingUp, Info, Check } from "lucide-react"

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget': return <AlertTriangle size={16} className="text-amber-500" />
      case 'goal': return <Target size={16} className="text-blue-500" />
      case 'expense': return <TrendingUp size={16} className="text-red-500" />
      default: return <Info size={16} className="text-slate-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{unreadCount}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/10 dark:shadow-slate-900/30 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div
                  key={`${notification.id}-${index}`}
                  className={`p-4 border-b border-slate-200/30 dark:border-slate-700/30 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors ${
                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown