import './globals.css'

export const metadata = {
  title: 'Salesboy AI - WhatsApp Business Assistant',
  description: 'AI-powered WhatsApp assistant for Nigerian businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  )
}