import Link from 'next/link'
import ThemeToggle from './components/ThemeToggle'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Salesboy AI
            </h1>
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }} className="nav-links">
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
      <style jsx>{`
        @media (max-width: 640px) {
          .nav-links {
            gap: 0.5rem !important;
            font-size: 0.875rem;
          }
        }
      `}</style>

      {/* Retro Text */}
      <div style={{ padding: '1rem 1rem' }} className="retro-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="hero-grid">
          <div style={{ overflow: 'hidden' }}>
            <div className="retro-text">WHATSAPP SALES<br/>ASSISTANT</div>
          </div>
          <div></div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ padding: '0 1rem', position: 'relative', overflow: 'hidden' }} className="hero-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="hero-grid">
          <div style={{ textAlign: 'left' }} className="hero-content">
            <h1 className="hero-title">
              Smart Business Automation
            </h1>
            <p className="hero-description">
              Transform your Nigerian business with intelligent WhatsApp automation powered by advanced AI and RAG technology
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} className="hero-buttons">
              <Link href="/signup">
                <button className="btn hero-btn">Get Started</button>
              </Link>
              <Link href="/product">
                <button className="hero-btn-secondary">Learn More</button>
              </Link>
            </div>
          </div>
          
          {/* Laptop Chat Simulation */}
          <div className="laptop-animation" style={{ display: 'none' }}>
            <div className="laptop-container">
              <div className="laptop-screen">
                <div className="browser-header">
                  <div style={{ display: 'flex', gap: '0.3rem', padding: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
                  </div>
                </div>
                
                {/* QR Code Scanning Phase */}
                <div className="qr-scan-phase">
                  <div className="qr-container">
                    <div className="qr-code">
                      <div className="qr-corner qr-tl"></div>
                      <div className="qr-corner qr-tr"></div>
                      <div className="qr-corner qr-bl"></div>
                      <div className="qr-pattern"></div>
                    </div>
                    <div className="phone-scan">📱</div>
                  </div>
                  <div className="scan-text">Scan QR code with WhatsApp</div>
                </div>
                
                {/* Success Check */}
                <div className="success-phase">
                  <div className="success-check">✓</div>
                  <div className="success-text">Connected!</div>
                </div>
                
                {/* Chat Window */}
                <div className="chat-window">
                  <div className="message customer-msg msg-1">
                    <div className="message-bubble customer-bubble">Hi! I'm interested in your products</div>
                  </div>
                  <div className="typing-indicator typing-1">
                    <div className="typing-bubble">
                      <div className="typing-dots"><span></span><span></span><span></span></div>
                    </div>
                  </div>
                  <div className="message ai-msg msg-2">
                    <div className="message-bubble ai-bubble">Hello! I'd be happy to help you find the perfect product. What are you looking for?</div>
                  </div>
                  <div className="message customer-msg msg-3">
                    <div className="message-bubble customer-bubble">I need a laptop for my business. What's available?</div>
                  </div>
                  <div className="typing-indicator typing-2">
                    <div className="typing-bubble">
                      <div className="typing-dots"><span></span><span></span><span></span></div>
                    </div>
                  </div>
                  <div className="message ai-msg msg-4">
                    <div className="message-bubble ai-bubble">We have excellent business laptops! The Dell Inspiron 15 (₦450,000) and HP ProBook 14 (₦380,000) are popular choices.</div>
                  </div>
                </div>
              </div>
              <div className="laptop-base"></div>
            </div>
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