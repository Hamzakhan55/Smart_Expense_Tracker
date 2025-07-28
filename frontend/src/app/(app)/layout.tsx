import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import FloatingActions from '@/components/FloatingActions';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <main className="pb-20">{children}</main>
      <BottomNav />
      <FloatingActions />
    </ProtectedRoute>
  );
}