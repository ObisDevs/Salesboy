 'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DashboardHeader from '../components/DashboardHeader'
import { Button } from '../components/ui/button'
import { LoadingSpinner } from '../components/ui/loading'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser-client'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ sessions: 0, documents: 0, messages: 0, totalMessages: 0 })
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function load() {
      try {
        // Debug: Check if auth token exists in localStorage
        const keys = Object.keys(localStorage)
        const authKeys = keys.filter(k => k.includes('auth') || k.includes('supabase'))
        console.log('Auth-related localStorage keys:', authKeys)

        // Try to get session directly first
        console.log('Attempting to restore session from storage...')
        const { data: { session: storedSession }, error: sessionError } = await supabase.auth.getSession()
        console.log('getSession() result:', { hasSession: !!storedSession, error: sessionError?.message })

        // Use onAuthStateChange as a fallback listener for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: any, session: any) => {
            console.log('Auth state changed:', { event, hasSession: !!session, userEmail: session?.user?.email })

            if (!session) {
              console.log('No session in onAuthStateChange')
              setAuthenticated(false)
              setLoading(false)
              return
            }

            console.log('Session found via onAuthStateChange:', session.user.email)
            setAuthenticated(true)

            // Fetch dashboard data
            try {
              const [pRes, sRes] = await Promise.all([
                fetch('/api/profile', { credentials: 'include' }),
                fetch('/api/stats', { credentials: 'include' })
              ])

              console.log('API responses:', { profileStatus: pRes.status, statsStatus: sRes.status })

              if (pRes.status === 401 || sRes.status === 401) {
                console.error('API returned 401 - session may be invalid')
                setLoading(false)
                return
              }

              const profileData = await pRes.json()
              const statsData = await sRes.json()

              setProfile(profileData.data)
              setStats(statsData.data)
            } catch (err) {
              console.error('Error fetching dashboard data:', err)
            } finally {
              setLoading(false)
            }
          }
        )

        // If we already have a stored session, immediately use it
        if (storedSession) {
          console.log('Using stored session immediately:', storedSession.user.email)
          setAuthenticated(true)
          
          try {
            const [pRes, sRes] = await Promise.all([
              fetch('/api/profile', { credentials: 'include' }),
              fetch('/api/stats', { credentials: 'include' })
            ])

            if (pRes.status !== 401 && sRes.status !== 401) {
              const profileData = await pRes.json()
              const statsData = await sRes.json()
              setProfile(profileData.data)
              setStats(statsData.data)
            }
          } catch (err) {
            console.error('Error fetching dashboard data from stored session:', err)
          } finally {
            setLoading(false)
          }
        }

        return () => subscription.unsubscribe()
      } catch (err) {
        console.error('Dashboard auth setup error:', err)
        setLoading(false)
      }
    }

    const unsubscribe = load()
    return () => {
      unsubscribe?.then(fn => fn?.())
    }
  }, [])

  if (loading) {
    return (
      <>
        <DashboardHeader title="Dashboard" description="System Overview" />
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <LoadingSpinner />
        </div>
      </>
    )
  }

  if (authenticated === false) {
    return (
      <>
        <DashboardHeader title="Dashboard" description="Please sign in" />
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ marginBottom: '1rem' }}>You are not signed in. Please log in to access your dashboard.</p>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </>
    )
  }

  return (
    <ErrorBoundary>
      <DashboardHeader 
        title={`Welcome to Sales-up`}
        description="System Overview" 
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div className="card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
            ACTIVE SESSIONS
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--accent)' }}>{stats.sessions}</div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--success)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
            DOCUMENTS
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--success)' }}>{stats.documents}</div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
            MESSAGES TODAY
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--accent)' }}>{stats.messages}</div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--success)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
            UPTIME
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--success)' }}>100%</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '500', color: 'var(--accent)' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button onClick={() => router.push('/dashboard/sessions')}>Start Session</Button>
          <Button onClick={() => router.push('/dashboard/kb')}>Upload Document</Button>
          <Button onClick={() => router.push('/dashboard/logs')}>View Logs</Button>
          <Button onClick={() => router.push('/dashboard/bot-config')}>Configure Bot</Button>
          <Button onClick={() => router.push('/dashboard/groups')}>Manage Groups</Button>
        </div>
      </div>
    </ErrorBoundary>
  )
}