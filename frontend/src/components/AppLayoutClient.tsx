'use client';
import Header from '@/components/Header';
import NavigationBar from '@/components/Sidebar';
import { useTheme } from '@/context/ThemeContext';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { getBackgroundClass } = useTheme();
  
  return (
    <div className={getBackgroundClass()}>
      <Header />
      <NavigationBar />
      
      <main className="pt-40 p-6">
        {children}
      </main>
    </div>
  );
}