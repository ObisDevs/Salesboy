'use client'
import { useState } from 'react'
import { Input } from '@/app/components/ui/input'
import DashboardHeader from '@/app/components/DashboardHeader'

export default function LogsPage() {
  const [search, setSearch] = useState('')
  const logs: any[] = []

  return (
    <>
      <DashboardHeader 
        title="Activity Logs" 
        description="View chat and audit logs" 
      />

      <div className="card" style={{ marginBottom: '2rem' }}>
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs..."
        />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '500', color: 'var(--accent)' }}>
          Recent Activity
        </h2>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No logs available</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>{log.type}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{log.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}