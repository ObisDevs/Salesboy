'use client'
import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      
      // Show prompt after 3 seconds on first visit
      const hasSeenPrompt = localStorage.getItem('installPromptDismissed')
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowPrompt(true)
          localStorage.setItem('installPromptDismissed', 'true')
        }, 3000)
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('✅ App installed successfully')
      setIsInstalled(true)
    } else {
      console.log('❌ App installation declined')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (isInstalled || !showPrompt || !isInstallable) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1rem',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 50,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div style={{ marginBottom: '0.75rem' }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '0.25rem'
        }}>
          📱 Install SALES-UP
        </h3>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}>
          Add SALES-UP to your home screen for quick access and offline support.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem'
      }}>
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '0.6rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1,
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            padding: '0.6rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Later
        </button>
      </div>
    </div>
  )
}
