import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/providers/QueryProvider';

// Import our new BottomNav component
import BottomNav from "@/components/BottomNav"; 

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
      <body className={`${inter.className} bg-gray-50`}>
        <QueryProvider>
        <main className="pb-20"> 
          {children}
        </main>
        </QueryProvider>
        <BottomNav />
      </body>
    </html>
  );
}