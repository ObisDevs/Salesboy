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
      console.log('[Dashboard Layout] Starting access check...')
      
      const supabase = getSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('[Dashboard Layout] Auth session:', { hasSession: !!session, userId: session?.user?.id })
      
      if (!session) {
        console.log('[Dashboard Layout] No session, redirecting to login')
        router.push('/login')
        return
      }

      // Check subscription directly from Supabase
      console.log('[Dashboard Layout] Checking subscription...')
      try {
        const { data: userPlan, error } = await supabase
          .from('user_plans')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        console.log('[Dashboard Layout] Subscription check result:', { 
          hasData: !!userPlan, 
          error: error?.message,
          status: userPlan?.status,
          expiresAt: userPlan?.expires_at 
        })

        if (error && error.code !== 'PGRST116') {
          console.error('[Dashboard Layout] Error fetching subscription:', error)
        }

        const hasActivePlan = userPlan && 
          userPlan.status === 'active' && 
          new Date(userPlan.expires_at) > new Date()

        console.log('[Dashboard Layout] Has active plan:', hasActivePlan)

        if (!hasActivePlan) {
          console.log('[Dashboard Layout] No active plan, redirecting to payment')
          router.push('/payment')
          return
        }

        console.log('[Dashboard Layout] Access granted, loading dashboard')
        setLoading(false)
      } catch (error: any) {
        console.error('[Dashboard Layout] Subscription check failed:', error.message)
        // On error, allow access to prevent being stuck
        setLoading(false)
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
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row' }}>
        <Sidebar />
        <main style={{ 
          flex: 1, 
          padding: '2rem', 
          maxWidth: '100%', 
          overflow: 'auto',
          background: 'var(--bg-primary)'
        }}>
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}