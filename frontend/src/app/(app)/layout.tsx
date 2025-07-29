import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="pt-32 p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}