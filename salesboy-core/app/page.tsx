import Link from 'next/link'
import ThemeToggle from './components/ThemeToggle'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Salesboy AI
            </h1>
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/product" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>Product</Link>
            <Link href="/pricing" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>Pricing</Link>
            <Link href="/about" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>About</Link>
            <ThemeToggle />
            <Link href="/login">
              <button className="btn" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Login</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            WhatsApp AI Automation
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Transform your Nigerian business with intelligent WhatsApp automation powered by advanced AI and RAG technology
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/signup">
              <button className="btn" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>Get Started</button>
            </Link>
            <Link href="/product">
              <button style={{ fontSize: '1.1rem', padding: '0.75rem 2rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}>Learn More</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
    </div>
  )
}