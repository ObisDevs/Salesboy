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
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}