'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { LoadingSpinner } from '@/app/components/ui/loading'

export default function SessionsPage() {
  const [sessionStatus, setSessionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const startSession = async () => {
    setLoading(true)
    try {
      await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'current-user' })
      })
      checkStatus()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const stopSession = async () => {
    setLoading(true)
    try {
      await fetch('/api/sessions/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'current-user' })
      })
      setSessionStatus(null)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/sessions/status?user_id=current-user')
      const data = await res.json()
      setSessionStatus(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <>
      <DashboardHeader 
        title="WhatsApp Sessions" 
        description="Manage your WhatsApp connections" 
      />

      <div className="card" style={{ marginBottom: '2rem', borderTop: '3px solid var(--accent)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '500', color: 'var(--accent)' }}>
          Session Status
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: sessionStatus?.gateway_status?.ready ? 'var(--success)' : 'var(--text-muted)',
            boxShadow: sessionStatus?.gateway_status?.ready ? '0 0 8px var(--success)' : 'none'
          }}></div>
          <span style={{ fontWeight: '500' }}>
            {sessionStatus?.gateway_status?.ready ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button onClick={startSession} disabled={loading || sessionStatus?.gateway_status?.ready}>
            {loading ? <><LoadingSpinner /> Starting...</> : 'Start Session'}
          </Button>
          <Button onClick={stopSession} disabled={loading || !sessionStatus?.gateway_status?.ready}>
            {loading ? <><LoadingSpinner /> Stopping...</> : 'Stop Session'}
          </Button>
          <Button onClick={checkStatus} disabled={loading}>
            Refresh Status
          </Button>
        </div>
      </div>
    </>
  )
}