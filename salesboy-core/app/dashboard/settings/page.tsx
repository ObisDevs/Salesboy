 'use client'
import { useState, useEffect, useRef } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'
import { profileSchema } from '@/lib/validation'
import { LoadingSpinner } from '@/app/components/ui/loading'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser-client'

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', phone_number: '', email: '' })
  const [webhooks, setWebhooks] = useState({ n8n_kb_webhook: '', intent_webhook_url: '' })
  const [savingWebhooks, setSavingWebhooks] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function setupAuth() {
      try {
        // Use onAuthStateChange to properly detect session changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: any, session: any) => {
            console.log('Auth state changed:', { event, hasSession: !!session })

            if (!session) {
              console.log('No session - user not authenticated')
              setAuthenticated(false)
              setLoading(false)
              return
            }

            console.log('Session found:', session.user.email)
            setAuthenticated(true)

            // Fetch settings data
            try {
              const pRes = await fetch('/api/profile', { credentials: 'include' })
              const profileData = await pRes.json()
              setProfile(profileData.data || {})

              const wRes = await fetch('/api/settings/webhooks', { credentials: 'include' })
              const webhooksData = await wRes.json()
              setWebhooks(webhooksData.data || {})
            } catch (err) {
              console.error('Error fetching settings data:', err)
            } finally {
              setLoading(false)
            }
          }
        )

        return () => subscription.unsubscribe()
      } catch (err) {
        console.error('Settings auth setup error:', err)
        setLoading(false)
      }
    }

    const unsubscribe = setupAuth()
    return () => {
      unsubscribe?.then(fn => fn?.())
    }
  }, [])

  if (authenticated === false) {
    return (
      <>
        <DashboardHeader title="Settings" description="Please sign in" />
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ marginBottom: '1rem' }}>You are not signed in. Please log in to access settings.</p>
          <Button onClick={() => (window.location.href = '/login')}>Go to Login</Button>
        </div>
      </>
    )
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      profileSchema.parse(profile)
    } catch (err: any) {
      const fieldErrors: any = {}
      err.errors?.forEach((e: any) => {
        fieldErrors[e.path[0]] = e.message
      })
      setErrors(fieldErrors)
      showToast('Please fix validation errors', 'error')
      return
    }
    
    setLoading(true)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      showToast('Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DashboardHeader title="Settings" description="Configure your profile" />
      
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '500' }}>Profile Settings</h2>
        <form onSubmit={saveProfile}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Full Name</label>
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: `1px solid ${errors.full_name ? 'var(--error)' : 'var(--border)'}`, background: 'var(--bg-primary)' }}
            />
            {errors.full_name && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.full_name}</p>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Phone Number</label>
            <input
              type="text"
              value={profile.phone_number || ''}
              onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: `1px solid ${errors.phone_number ? 'var(--error)' : 'var(--border)'}`, background: 'var(--bg-primary)' }}
            />
            {errors.phone_number && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.phone_number}</p>}
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              value={profile.email || ''}
              disabled
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', opacity: 0.6 }}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <><LoadingSpinner /> Saving...</> : 'Save Changes'}
          </Button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '500' }}>n8n Integration</h2>
        <form onSubmit={async (e) => {
          e.preventDefault()
          setSavingWebhooks(true)
          try {
            await fetch('/api/settings/webhooks', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhooks)
            })
            showToast('Webhook settings saved', 'success')
          } catch (error) {
            showToast('Failed to save webhook settings', 'error')
          } finally {
            setSavingWebhooks(false)
          }
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Knowledge Base Processing Webhook
            </label>
            <input
              type="url"
              value={webhooks.n8n_kb_webhook || ''}
              onChange={(e) => setWebhooks({ ...webhooks, n8n_kb_webhook: e.target.value })}
              placeholder="https://your-n8n.com/webhook/kb-process"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              n8n webhook URL for automatic document processing and embedding
            </p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Intent Webhook URL (optional)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                value={webhooks.intent_webhook_url || ''}
                onChange={(e) => setWebhooks({ ...webhooks, intent_webhook_url: e.target.value })}
                placeholder="https://your-service.com/ai-intent"
                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
              <button type="button" className="btn" onClick={() => {
                try {
                  navigator.clipboard.writeText(webhooks.intent_webhook_url || '')
                  showToast('Webhook URL copied to clipboard', 'success')
                } catch (err) {
                  showToast('Failed to copy webhook URL', 'error')
                }
              }}>Copy</button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Optional: when an incoming message is classified as a Task (e.g. send_email), Salesboy will POST the intent payload here.
            </p>
          </div>
          <Button type="submit" disabled={savingWebhooks}>
            {savingWebhooks ? <><LoadingSpinner /> Saving...</> : 'Save Webhook Settings'}
          </Button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '500' }}>Contact Developer</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Need help with your Salesboy AI setup? Have questions or feedback?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a 
            href="mailto:obisdev@gmail.com" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--accent)', 
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📧</span>
            <span style={{ fontWeight: '500' }}>obisdev@gmail.com</span>
          </a>
        </div>
      </div>
    </>
  )
}
