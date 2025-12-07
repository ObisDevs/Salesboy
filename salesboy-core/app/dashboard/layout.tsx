'use client'
import Sidebar from '../components/Sidebar'
import { ToastProvider } from '../components/ui/toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '100%', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}