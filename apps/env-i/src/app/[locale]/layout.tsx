import type {Metadata, Viewport} from 'next';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { LoadingProvider } from '@/context/LoadingContext';
import LoadingSpinner from '@/components/loading-spinner';
import React from 'react';
import { ErrorBoundary } from "@/components/ui/error-boundary"; // Added import for ErrorBoundary

export const metadata: Metadata = {
  title: 'T-ENV-I Envanter Sistemi',
  description: 'TEK Ekosistemi için Kapsamlı Envanter Yönetim Sistemi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'T-ENV-I',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import { AppLifecycle } from '@/components/layout/app-lifecycle';

// function AppContent removed - hooks moved to AppLifecycle


export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
            href="https://fonts.googleapis.com/css2?family=Geist+Sans:wght@400;500;600;700&display=swap"
            rel="stylesheet"
        />
        {/* PWA Meta Tags managed by next-pwa/metadata usually, but keeping harmless ones if needed. Removing icons handled by metadata export */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="T-ENV-I" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <React.Suspense fallback={<div>Yükleniyor...</div>}>
              <LoadingProvider> 
                <AuthProvider>
                    <AppLifecycle />
                    {children}
                    <Toaster />
                </AuthProvider>
                <LoadingSpinner />
              </LoadingProvider>
            </React.Suspense>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
