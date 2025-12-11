'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LoadingSpinner } from '../components/ui/loading'
import { useToast } from '../components/ui/toast'
import BackButton from '../components/BackButton'

function PaymentContent() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  useEffect(() => {
    const cancelled = searchParams.get('cancelled')
    if (cancelled === 'true') {
      showToast('Payment was cancelled. You can try again when ready.', 'error')
      router.replace('/payment')
    }
  }, [searchParams, router, showToast])

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: 'agent_pro' })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      window.location.href = data.authorization_url
    } catch (error: any) {
      showToast(error.message || 'Payment failed', 'error')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} className="md:p-8">
      <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <BackButton href="/" label="Back to Home" />
        </div>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }} className="md:text-2xl">
            Complete Your Subscription
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }} className="md:text-base">
            Subscribe to Agent Pro to access your dashboard and start automating your WhatsApp business
          </p>
        </div>

        <div style={{ 
          border: '2px solid var(--accent)', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          background: 'var(--bg-secondary)'
        }} className="md:p-8">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Agent Pro
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '0.5rem' }}>
            ₦25,000
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>per month</p>
          
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Includes:
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                <span>WhatsApp Business Integration</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                <span>AI-Powered Responses</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                <span>RAG Knowledge Base</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                <span>Product Catalog Integration</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>✓</span>
                <span>Email & Meeting Automation</span>
              </li>
            </ul>
          </div>
        </div>

        <button 
          onClick={handlePayment}
          disabled={loading}
          className="btn"
          style={{ 
            width: '100%', 
            fontSize: '1.1rem', 
            padding: '0.75rem',
            marginBottom: '1rem'
          }}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              <span style={{ marginLeft: '0.5rem' }}>Processing...</span>
            </>
          ) : (
            'Pay with Paystack'
          )}
        </button>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Secure payment powered by Paystack. Cancel anytime.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/pricing" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}>
            View All Plans
          </Link>
          <Link href="/about#contact" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}>
            Contact Support
          </Link>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Having payment issues?
          </p>
          <a href="mailto:obisdev@gmail.com" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
            📧 obisdev@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>}>
      <PaymentContent />
    </Suspense>
  )
}
