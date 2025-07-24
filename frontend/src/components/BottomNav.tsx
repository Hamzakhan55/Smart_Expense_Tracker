'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, FileText, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const BottomNav = () => {
  const pathname = usePathname(); // Get the current URL path

  return (
    <nav className="fixed bottom-0 w-full bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link href={item.href} key={item.label} className={`flex flex-col items-center p-3 transition-colors duration-200 ${isActive ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
              <Icon className="w-6 h-6 mb-1" />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;