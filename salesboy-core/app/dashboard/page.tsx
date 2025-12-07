'use client'
import DashboardHeader from '../components/DashboardHeader'
import { Button } from '../components/ui/button'

export default function Dashboard() {
  return (
    <>
      <DashboardHeader 
        title="Dashboard" 
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
          <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--accent)' }}>0</div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--success)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
            DOCUMENTS
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--success)' }}>0</div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
            MESSAGES TODAY
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--accent)' }}>0</div>
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
          <Button>Start Session</Button>
          <Button>Upload Document</Button>
          <Button>View Logs</Button>
          <Button>Configure Bot</Button>
        </div>
      </div>
    </>
  )
}