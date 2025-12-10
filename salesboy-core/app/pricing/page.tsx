import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'

export default function PricingPage() {
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
            <Link href="/pricing" style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: '500' }}>Pricing</Link>
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
              Simple, Transparent Pricing
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Choose the plan that fits your Nigerian business needs
            </p>
          </div>

          {/* Pricing Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {/* Agent Pro Plan */}
            <div className="card" style={{ position: 'relative', border: '2px solid var(--accent)' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '0.25rem 1rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600' }}>
                MOST POPULAR
              </div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Agent Pro
                </h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                  ₦25,000
                </div>
                <p style={{ color: 'var(--text-muted)' }}>per month</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Everything you need to get started:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>WhatsApp Business Integration</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>AI-Powered Responses</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>RAG Knowledge Base (Up to 100 documents)</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>Intent Classification & Routing</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>Product Catalog Integration</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>Email Automation</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>Meeting Booking Automation</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>Order Processing</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>Group Message Filtering</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>Dashboard Analytics</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                    <span>24/7 Email Support</span>
                  </li>
                </ul>
              </div>

              <Link href="/signup">
                <button className="btn" style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}>
                  Start Your Trial
                </button>
              </Link>
            </div>

            {/* Agent Max Plan - Coming Soon */}
            <div className="card" style={{ opacity: 0.7, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-muted)', color: 'white', padding: '0.25rem 1rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600' }}>
                COMING SOON
              </div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Agent Max
                </h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  ₦45,000
                </div>
                <p style={{ color: 'var(--text-muted)' }}>per month</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Everything in Agent Pro, plus:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>Unlimited Documents in Knowledge Base</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>Advanced Sales Analytics</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>Lead Scoring & Tracking</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>HMAC Encryption & Advanced Security</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>Multi-User Access Control</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>Early Access to New Features</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>CRM Integration (Salesforce, HubSpot)</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>Custom Workflow Integrations</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>✓</span>
                    <span>Priority Phone Support</span>
                  </li>
                </ul>
              </div>

              <Link href="/about#contact">
                <button style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem', background: 'var(--text-muted)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Contact Us
                </button>
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '2rem', color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  How does the payment work?
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  We use Paystack for secure monthly billing. Your subscription automatically renews each month.
                </p>
              </div>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Can I cancel anytime?
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period.
                </p>
              </div>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Is there a free trial?
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Yes, we offer a 7-day free trial so you can test all features before committing to a paid plan.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Need a Custom Solution?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Contact us for enterprise pricing and custom integrations for your business
            </p>
            <Link href="/about#contact">
              <button className="btn" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}