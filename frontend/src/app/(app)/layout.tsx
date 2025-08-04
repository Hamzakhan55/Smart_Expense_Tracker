import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayoutClient from '@/components/AppLayoutClient';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayoutClient>
        {children}
      </AppLayoutClient>
    </ProtectedRoute>
  );
}