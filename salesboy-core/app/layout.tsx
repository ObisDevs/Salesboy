import './globals.css'
import { ToastProvider } from './components/ui/toast'

export const metadata = {
  title: 'Sales-up - WhatsApp Business Assistant',
  description: 'AI-powered WhatsApp assistant for Nigerian businesses',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'Sales-up - WhatsApp Business Assistant',
    description: 'AI-powered WhatsApp assistant for Nigerian businesses',
    url: 'https://salesboy-lilac.vercel.app',
    siteName: 'Sales-up',
    images: [
      {
        url: '/favicon.svg',
        width: 512,
        height: 512,
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sales-up - WhatsApp Business Assistant',
    description: 'AI-powered WhatsApp assistant for Nigerian businesses',
    images: ['/favicon.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}