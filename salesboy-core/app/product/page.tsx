import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'

export default function ProductPage() {
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
            <Link href="/product" style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: '500' }}>Product</Link>
            <Link href="/pricing" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>Pricing</Link>
            <Link href="/about" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>About</Link>
            <ThemeToggle />
            <Link href="/login">
              <button className="btn" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Login</button>
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Intelligent WhatsApp Automation
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Powered by advanced AI and RAG technology to transform your Nigerian business communications
            </p>
          </div>

          {/* Features Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🤖 AI-Powered Responses
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Advanced language models understand customer queries and provide intelligent, contextual responses in real-time.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                📚 RAG Knowledge Base
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Upload your business documents and let AI retrieve accurate information to answer customer questions.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🎯 Intent Classification
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Automatically classify customer messages and route them to appropriate workflows or human agents.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🛍️ Product Catalog Integration
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Seamlessly integrate your product catalog for instant pricing and availability information.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                📧 Email & Meeting Automation
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Automatically send emails and schedule meetings based on customer interactions.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🔒 Enterprise Security
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                HMAC encryption, secure data handling, and user isolation ensure your business data stays protected.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '2rem', color: 'var(--text-primary)' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>1️⃣</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Connect WhatsApp</h3>
                <p style={{ color: 'var(--text-muted)' }}>Scan QR code to connect your WhatsApp Business account</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>2️⃣</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Upload Knowledge</h3>
                <p style={{ color: 'var(--text-muted)' }}>Add your business documents and product catalog</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>3️⃣</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>AI Automation</h3>
                <p style={{ color: 'var(--text-muted)' }}>Let AI handle customer queries automatically</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Ready to Transform Your Business?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Join Nigerian businesses already using Salesboy AI to automate their WhatsApp communications
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/signup">
                <button className="btn" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>Start Free Trial</button>
              </Link>
              <Link href="/pricing">
                <button style={{ fontSize: '1.1rem', padding: '0.75rem 2rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}>View Pricing</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}