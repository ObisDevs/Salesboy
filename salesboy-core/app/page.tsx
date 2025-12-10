import Link from 'next/link'
import ThemeToggle from './components/ThemeToggle'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Salesboy AI
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
              WhatsApp Business Automation
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '500' }}>SYSTEM STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
              <span style={{ fontWeight: '500' }}>Core Backend</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
              <span style={{ fontWeight: '500' }}>AI Pipeline</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
              <span style={{ fontWeight: '500' }}>RAG System</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
              <span style={{ fontWeight: '500' }}>Gateway</span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '500' }}>FEATURES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <span>WhatsApp Webhook Handler</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <span>RAG with Pinecone</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <span>Intent Classification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <span>Knowledge Base APIs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <span>Session Management</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <span>Task Forwarding</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: '500' }}>METRICS</div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>100%</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Uptime</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>v1.0</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Version</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '500' }}>Ready to Start</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Access your dashboard to manage WhatsApp sessions and AI settings
          </p>
          <Link href="/dashboard">
            <button className="btn" style={{ fontSize: '1rem' }}>
              Open Dashboard
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p>API Endpoint: /api/webhook/whatsapp</p>
        </div>
      </div>
    </div>
  )
}