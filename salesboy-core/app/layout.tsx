import './globals.css'
import { ToastProvider } from './components/ui/toast'

export const metadata = {
  title: 'SALES-UP - WhatsApp Business Assistant',
  description: 'AI-powered WhatsApp assistant for Nigerian businesses',
  manifest: '/manifest.json',
  themeColor: '#cd9777',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SALES-UP',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  openGraph: {
    title: 'SALES-UP - WhatsApp Business Assistant',
    description: 'AI-powered WhatsApp assistant for Nigerian businesses',
    url: 'https://salesboy-lilac.vercel.app',
    siteName: 'SALES-UP',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SALES-UP - WhatsApp Business Assistant',
    description: 'AI-powered WhatsApp assistant for Nigerian businesses',
    images: ['/icons/icon-512x512.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta name="theme-color" content="#cd9777" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#cd9777" media="(prefers-color-scheme: dark)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SALES-UP" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}