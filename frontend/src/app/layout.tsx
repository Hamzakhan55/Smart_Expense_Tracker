import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/providers/QueryProvider';
import { CurrencyProvider } from '@/context/CurrencyContext'
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

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
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <CurrencyProvider>
              <QueryProvider>
                {children}
              </QueryProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}