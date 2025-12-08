'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardHeader from '../components/DashboardHeader'
import { Button } from '../components/ui/button'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ sessions: 0, documents: 0, messages: 0 })

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => setProfile(d.data))
    fetch('/api/sessions/status?user_id=current-user').then(r => r.json()).then(d => {
      setStats(prev => ({ ...prev, sessions: d.gateway_status?.ready ? 1 : 0 }))
    })
  }, [])

  return (
    <>
      <DashboardHeader 
        title={`Welcome, ${profile?.full_name || 'User'}`}
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
          <Button onClick={() => router.push('/dashboard/settings')}>Configure Bot</Button>
        </div>
      </div>
    </>
  )
}