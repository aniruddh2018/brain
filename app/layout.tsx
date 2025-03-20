import React from 'react';
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IQLEVAL',
  description: 'Comprehensive cognitive assessment',
  keywords: ['cognitive assessment', 'brain games', 'memory', 'problem-solving', 'cognitive flexibility'],
  authors: [{ name: 'IQLEVAL Team' }],
  creator: 'IQLEVAL',
  publisher: 'IQLEVAL',
  manifest: '/manifest.json',
  applicationName: 'IQLEVAL',
  appleWebApp: {
    capable: true,
    title: 'IQLEVAL',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://txndzhjxsijyjeuoqfxl.supabase.co" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}
