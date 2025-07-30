import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import NavigationBar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <NavigationBar />
        
        <main className="pt-40 p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}