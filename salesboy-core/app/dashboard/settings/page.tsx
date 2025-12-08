'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'
import { profileSchema } from '@/lib/validation'
import { LoadingSpinner } from '@/app/components/ui/loading'

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', phone_number: '', email: '' })
  const [webhooks, setWebhooks] = useState({ n8n_kb_webhook: '' })
  const [savingWebhooks, setSavingWebhooks] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const { showToast } = useToast()

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => setProfile(d.data || {}))
    fetch('/api/settings/webhooks').then(r => r.json()).then(d => setWebhooks(d.data || {}))
  }, [])

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
          <Button type="submit" disabled={savingWebhooks}>
            {savingWebhooks ? <><LoadingSpinner /> Saving...</> : 'Save Webhook Settings'}
          </Button>
        </form>
      </div>
    </>
  )
}
