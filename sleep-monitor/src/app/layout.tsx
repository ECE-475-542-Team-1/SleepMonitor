import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Sidebar from './components/Sidebar';

export const metadata: Metadata = {
  title: 'My Sleep Tracker',
  description: 'Track your HR and SpO₂ during sleep.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen bg-gray-50 text-gray-900">
        <div className="flex h-full">
          {/* Sidebar on the left */}
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}



