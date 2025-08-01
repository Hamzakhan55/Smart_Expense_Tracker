"use client"

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        if (response.ok) {
          setStatus('online')
        } else {
          setStatus('offline')
        }
      } catch (error) {
        console.error('Backend health check failed:', error)
        setStatus('offline')
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span className="text-blue-800 dark:text-blue-200">Checking backend...</span>
      </div>
    )
  }

  if (status === 'offline') {
    return (
      <div className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg text-sm">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <span className="text-red-800 dark:text-red-200">Backend offline</span>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg text-sm">
      <CheckCircle className="w-4 h-4 text-green-600" />
      <span className="text-green-800 dark:text-green-200">Backend online</span>
    </div>
  )
}