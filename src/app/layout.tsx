import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SidebarNavigation } from '@/components/layout/SidebarNavigation';
import { Footer } from '@/components/layout/Footer';
import { FloatingAIChat } from '@/components/ui/FloatingAIChat';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'NILVORA — AI-Powered Real Estate Marketplace | Ambattur & Chennai',
  description:
    'Verified property discovery, vertical video Reels, TN RERA broker collaboration, AI document screening, and digital transaction assistance across Ambattur and Chennai, Tamil Nadu.',
  keywords: [
    'Ambattur real estate',
    'Chennai properties',
    'Patta verification',
    'TN RERA brokers',
    'Real estate reels',
    'Mogappair plots',
    'Anna Nagar apartments',
    'Tamil Nadu property registration',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className="flex min-h-screen font-sans selection:bg-emerald-500 selection:text-slate-950">
        <Suspense fallback={null}>
          <SidebarNavigation />
        </Suspense>
        <div className="min-w-0 flex-1 pt-14 lg:pt-0">
          <main className="site-canvas min-h-screen">{children}</main>
          <Footer />
        </div>
        <Suspense fallback={null}>
          <FloatingAIChat />
        </Suspense>
      </body>
    </html>
  );
}
