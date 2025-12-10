'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser-client'
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
    const checkAccess = async () => {
      const supabase = getSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Check payment status
      try {
        const res = await fetch('/api/payment/status')
        const data = await res.json()
        
        if (!res.ok || !data.hasActivePlan) {
          router.push('/payment')
          return
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Payment status check failed:', error)
        router.push('/payment')
      }
    }

    checkAccess()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <div>Checking subscription status...</div>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }} className="md:flex-row">
        <Sidebar />
        <main style={{ 
          flex: 1, 
          padding: '1rem', 
          maxWidth: '100%', 
          overflow: 'auto',
          paddingTop: '1rem'
        }} className="md:p-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}