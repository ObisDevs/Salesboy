'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '@/app/components/ui/loading'

function PaymentCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference')
      
      if (!reference) {
        setStatus('error')
        setMessage('Payment reference not found')
        return
      }

      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference })
        })

        const data = await res.json()

        if (res.ok && data.success) {
          setStatus('success')
          setMessage('Payment successful! Redirecting to dashboard...')
          setTimeout(() => router.push('/dashboard'), 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Payment verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Failed to verify payment')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        {status === 'loading' && (
          <>
            <LoadingSpinner />
            <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
              Verifying Payment
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
              Payment Successful!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {message}
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="btn"
              style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--error)' }}>
              Payment Failed
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => router.push('/pricing')}
                className="btn"
                style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                Try Again
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                style={{ 
                  fontSize: '1rem', 
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)'
                }}
              >
                Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}