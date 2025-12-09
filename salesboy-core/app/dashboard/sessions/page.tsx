'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { LoadingSpinner } from '@/app/components/ui/loading'

export default function SessionsPage() {
  const [sessionStatus, setSessionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startSession = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'current-user' })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to start session')
      } else {
        checkStatus()
        // Start listening for QR code
        listenForQR()
      }
    } catch (error: any) {
      setError(error.message || 'Network error')
      console.error(error)
    }
    setLoading(false)
  }

  const stopSession = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sessions/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'current-user' })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to stop session')
      } else {
        setSessionStatus(null)
        setQrCode('')
        stopAutoRefresh()
      }
    } catch (error: any) {
      setError(error.message || 'Network error')
      console.error(error)
    }
    setLoading(false)
  }

  const disconnectSession = async () => {
    if (!confirm('Are you sure you want to disconnect this WhatsApp session?')) {
      return
    }
    await stopSession()
  }

  const startAutoRefresh = () => {
    stopAutoRefresh()
    intervalRef.current = setInterval(() => {
      checkStatus()
    }, 8000) // Check every 8 seconds (reduced polling frequency to avoid gateway rate limits)
  }

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
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

  const listenForQR = async () => {
    try {
      const res = await fetch('/api/sessions/status?user_id=current-user')
      const data = await res.json()
      if (data.gateway_status?.qr) {
        setQrCode(data.gateway_status.qr)
      }
    } catch (error) {
      console.error('QR fetch error:', error)
    }
  }

  useEffect(() => {
    checkStatus()
    startAutoRefresh()
    
    return () => {
      stopAutoRefresh()
    }
  }, [])

  useEffect(() => {
    if (sessionStatus?.gateway_status?.exists && !sessionStatus?.gateway_status?.ready) {
      listenForQR()
    }
  }, [sessionStatus])

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
        {error && (
          <div style={{ padding: '1rem', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', marginBottom: '1rem', color: '#c00' }}>
            {error}
          </div>
        )}
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
        {sessionStatus && (
          <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: '500' }}>Gateway Status:</div>
              <div>{sessionStatus.gateway_status?.exists ? '✅ Connected' : '❌ Not Connected'}</div>
              
              <div style={{ fontWeight: '500' }}>Ready:</div>
              <div>{sessionStatus.gateway_status?.ready ? '✅ Yes' : '⏳ Waiting'}</div>
              
              {sessionStatus.db_status && (
                <>
                  <div style={{ fontWeight: '500' }}>DB Status:</div>
                  <div>{sessionStatus.db_status.status}</div>
                </>
              )}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {!sessionStatus?.gateway_status?.exists ? (
            <Button onClick={startSession} disabled={loading}>
              {loading ? <><LoadingSpinner /> Starting...</> : 'Start Session'}
            </Button>
          ) : (
            <>
              {sessionStatus?.gateway_status?.ready ? (
                <Button onClick={disconnectSession} disabled={loading} style={{ background: '#dc2626' }}>
                  {loading ? <><LoadingSpinner /> Disconnecting...</> : 'Disconnect Session'}
                </Button>
              ) : (
                <Button onClick={stopSession} disabled={loading}>
                  {loading ? <><LoadingSpinner /> Stopping...</> : 'Cancel Session'}
                </Button>
              )}
            </>
          )}
          <Button onClick={checkStatus} disabled={loading}>
            Refresh Status
          </Button>
        </div>
      </div>

      {qrCode && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '500', color: 'var(--accent)' }}>
              Scan QR Code
            </h2>
            <Button onClick={() => setQrCode('')} style={{ background: '#6b7280' }}>Hide QR</Button>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Open WhatsApp on your phone and scan this QR code
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={qrCode} alt="WhatsApp QR Code" style={{ maxWidth: '300px', border: '2px solid var(--border)', borderRadius: '8px' }} />
          </div>
        </div>
      )}
    </>
  )
}