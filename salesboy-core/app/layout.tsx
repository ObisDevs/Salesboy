import './globals.css'
import { ToastProvider } from './components/ui/toast'

export const metadata = {
  title: 'Salesboy AI - WhatsApp Business Assistant',
  description: 'AI-powered WhatsApp assistant for Nigerian businesses',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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