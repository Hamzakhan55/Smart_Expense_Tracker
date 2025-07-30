'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LogOut, User as UserIcon, Calendar, Bell, Sun, Moon, LayoutDashboard, FileText, Target, TrendingUp, PieChart, Settings } from 'lucide-react';
import { Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: FileText },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/goals', label: 'Goals', icon: TrendingUp },
  { href: '/analytics', label: 'Analytics', icon: PieChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600 p-2">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">SmartExpense Pro</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Advanced Personal Finance Manager</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <Calendar size={16} />
            <span>{currentDate}</span>
          </div>
          
          <button className="relative p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">3</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <UserIcon size={16} />
            <span>{user?.email || 'User'}</span>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <button 
            onClick={logout} 
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" 
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
      
      <nav className="px-6">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.label}
                href={item.href} 
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive 
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Header;