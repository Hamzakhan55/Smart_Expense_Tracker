"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { login } from "@/services/apiService"
import Link from "next/link"
import BackendStatus from "@/components/BackendStatus"
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const { login: authLogin } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("signup") === "success") {
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("username", email)
    formData.append("password", password)

    try {
      console.log('Attempting login with:', { email })
      
      // Mock login for demo purposes when backend is down
      if (email === 'demo@example.com' && password === 'demo123') {
        console.log('Using mock login')
        const mockToken = 'mock-jwt-token-' + Date.now()
        authLogin(mockToken)
        router.push("/dashboard")
        return
      }
      
      const data = await login(formData)
      console.log('Login successful:', data)
      authLogin(data.access_token)
      router.push("/dashboard")
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError("Cannot connect to server. Please make sure the backend is running on port 8000.")
      } else {
        setError(err.response?.data?.detail || err.message || "Invalid email or password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "AI-powered insights into your spending patterns",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade encryption",
    },
    {
      icon: Zap,
      title: "Real-Time Sync",
      description: "Instant updates across all your devices",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      <BackendStatus />
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm p-4 border border-white/30">
              <Wallet size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Smart Expense Tracker</h1>
              <p className="text-white/80 text-lg">Advanced Finance Manager</p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Take Control of Your
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Financial Future
              </span>
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of users who have transformed their financial habits with our intelligent expense tracking
              and budgeting platform.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-white/80">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                SmartExpense Pro
              </h1>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-emerald-800 dark:text-emerald-200 font-medium">Account created successfully!</p>
                  <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                    Please sign in with your credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-slate-700/50 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Welcome Back</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-2">
              Sign In
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Enter your credentials to access your financial dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-white rounded-2xl border border-white/20 dark:border-slate-700/50 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/20"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  size={20}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-white rounded-2xl border border-white/20 dark:border-slate-700/50 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/20"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Do not have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
              >
                Create one now
              </Link>
            </p>
          </div>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl">
            <div className="text-center">
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium mb-2">Try the Demo</p>
              <p className="text-amber-700 dark:text-amber-300 text-xs">Email: demo@example.com • Password: demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
