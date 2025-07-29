'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Target, TrendingUp, PieChart, CreditCard } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: FileText },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/goals', label: 'Goals', icon: TrendingUp },
  { href: '/analytics', label: 'Analytics', icon: PieChart },
  { href: '/accounts', label: 'Accounts', icon: CreditCard },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white px-6">
      <div className="flex space-x-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.label}
              href={item.href} 
              className={`flex items-center gap-2 py-4 text-sm font-medium transition-colors border-b-2 ${
                isActive 
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar;