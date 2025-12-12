'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [cached, setCached] = useState<string[]>([])

  useEffect(() => {
    // Check initial connection status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/'
    } else {
      window.location.reload()
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-primary)'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '500px'
        }}
      >
        {/* Offline Icon */}
        <div
          style={{
            fontSize: '5rem',
            marginBottom: '2rem',
            animation: 'pulse 2s infinite'
          }}
        >
          📡
        </div>

        {!isOnline ? (
          <>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}
            >
              You're Offline
            </h1>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}
            >
              We couldn't connect to the internet. Some features may be limited, but you can still access cached content.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <button
                onClick={handleRetry}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                🔄 Retry Connection
              </button>
              <Link href="/">
                <button
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  🏠 Home
                </button>
              </Link>
            </div>

            <div
              style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                textAlign: 'left'
              }}
            >
              <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>💡 What you can do:</p>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>View cached dashboard data</li>
                <li>Check your bot configuration</li>
                <li>Review message history</li>
                <li>Access knowledge base (cached)</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: 'var(--success)',
                marginBottom: '1rem'
              }}
            >
              You're Back Online! ✓
            </h1>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                marginBottom: '2rem'
              }}
            >
              Reconnecting to SALES-UP...
            </p>
            <div
              style={{
                display: 'inline-block',
                animation: 'spin 1s linear infinite'
              }}
            >
              ⚙️
            </div>
          </>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
