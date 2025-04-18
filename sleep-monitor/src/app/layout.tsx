import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Sidebar from './components/Sidebar';
import NextAuthSessionProvider from './providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Sleep Tracker App',
  description: 'Track your sleep data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
      <NextAuthSessionProvider>
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}



