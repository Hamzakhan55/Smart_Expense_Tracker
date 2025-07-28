import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/providers/QueryProvider';
import { CurrencyProvider } from '@/context/CurrencyContext'
import BottomNav from "@/components/BottomNav"; 
import FloatingActions from "@/components/FloatingActions";
import { AuthProvider } from '@/context/AuthContext';
import UserProfile from '@/components/UserProfile';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Expense Tracker",
  description: "Track your expenses intelligently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <html lang="en">
      <body className={`${inter.className} bg-gray-50`} suppressHydrationWarning>
        <AuthProvider>
          <CurrencyProvider>
            <QueryProvider>
              <div className="fixed top-4 right-4 z-50">
                <UserProfile />
              </div>
              <main className="pb-20">{children}</main>
              <BottomNav />
              <FloatingActions />
            </QueryProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}