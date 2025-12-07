'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import Sidebar from '../components/Sidebar'
import { ToastProvider } from '../components/ui/toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    )
  }

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