'use client'
import { useState, useEffect } from 'react'
import DashboardHeader from '@/app/components/DashboardHeader'

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])

  const fetchLogs = async () => {
    const res = await fetch('/api/logs')
    const { data } = await res.json()
    setLogs(data || [])
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <DashboardHeader title="Message Logs" description="View conversation history" />
      
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {logs.map((log) => (
            <div key={log.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500', color: log.direction === 'incoming' ? 'var(--accent)' : 'var(--success)' }}>
                  {log.direction === 'incoming' ? '← Incoming' : '→ Outgoing'}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {log.from_number}
              </div>
              <div>{log.message_body}</div>
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No messages yet.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
