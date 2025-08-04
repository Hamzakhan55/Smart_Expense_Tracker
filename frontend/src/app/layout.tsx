import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/providers/QueryProvider';
import { CurrencyProvider } from '@/context/CurrencyContext'
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';

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
      <body className={`${inter.className}`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <CurrencyProvider>
              <NotificationProvider>
                <QueryProvider>
                  {children}
                </QueryProvider>
              </NotificationProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}