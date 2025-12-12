'use client'
import { useState, useEffect } from 'react'

// Helper: convert base64 URL-safe VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function NotificationPrompt() {
  const [isSupported, setIsSupported] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Check if browser supports notifications and service workers
    const supported = 'Notification' in window && 'serviceWorker' in navigator
    setIsSupported(supported)

    if (supported) {
      setIsEnabled(Notification.permission === 'granted')

      // Show notification prompt after user spends some time on dashboard
      const timer = setTimeout(() => {
        const hasSeen = localStorage.getItem('notificationPromptDismissed')
        if (!hasSeen && Notification.permission === 'default') {
          setShowPrompt(true)
        }
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  const handleEnable = async () => {
    if (!isSupported) return

    try {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        setIsEnabled(true)
        localStorage.setItem('notificationPromptDismissed', 'true')
        
        // Subscribe to push notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready
          if (registration.pushManager) {
            try {
              const vapidKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '') as string
              const applicationServerKey = urlBase64ToUint8Array(vapidKey)

              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
              })

              // Save subscription to backend
              await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
              })

              console.log('✅ Push notifications enabled')
              new Notification('SALES-UP', {
                body: 'Push notifications enabled! You\'ll receive updates about important events.',
                icon: '/icons/icon-192x192.svg',
                badge: '/icons/icon-192x192.svg'
              })
            } catch (err) {
              console.error('Failed to subscribe to push:', err)
            }
          }
        }
      }

      setShowPrompt(false)
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('notificationPromptDismissed', 'true')
  }

  if (!isSupported || !showPrompt || isEnabled) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1rem',
        maxWidth: '350px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 40,
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
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
          🔔 Enable Notifications
        </h3>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}>
          Get notified about customer inquiries, tasks, and important updates.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem'
      }}>
        <button
          onClick={handleEnable}
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
          Enable
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
          Not Now
        </button>
      </div>
    </div>
  )
}
