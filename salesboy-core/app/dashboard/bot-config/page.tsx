'use client'
import { useState, useEffect } from 'react'
import DashboardHeader from '@/app/components/DashboardHeader'
import { Button } from '@/app/components/ui/button'
import { LoadingSpinner } from '@/app/components/ui/loading'
import { useToast } from '@/app/components/ui/toast'

export default function BotConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetch('/api/bot-config')
      .then(r => r.json())
      .then(d => {
        setConfig(d.data)
        setLoading(false)
      })
      .catch(() => {
        showToast('Failed to load config', 'error')
        setLoading(false)
      })
  }, [])

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/bot-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (!res.ok) throw new Error('Failed to save')
      showToast('Configuration saved successfully', 'success')
    } catch (error) {
      showToast('Failed to save configuration', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
    return (
      <>
        <DashboardHeader title="Bot Configuration" description="Configure AI behavior" />
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <LoadingSpinner />
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title="Bot Configuration" description="Configure AI behavior and responses" />
      
      <div className="card">
        <form onSubmit={saveConfig}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              System Prompt
            </label>
            <textarea
              value={config.system_prompt || ''}
              onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
              rows={8}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border)', 
                background: 'var(--bg-primary)',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
              placeholder="You are a friendly AI sales assistant for a Nigerian business. Be warm, professional, and helpful. Use Nigerian expressions naturally."
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Define how the AI should behave and respond to customers
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Model
              </label>
              <select
                value={config.model || 'mistral-small-latest'}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border)', 
                  background: 'var(--bg-primary)' 
                }}
              >
                <option value="mistral-small-latest">Mistral Small (Primary)</option>
                <option value="mistral-medium-latest">Mistral Medium</option>
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Groq)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Temperature: {config.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature ?? 0.7}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Lower = focused, Higher = creative
              </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Max Tokens
              </label>
              <input
                type="number"
                value={config.max_tokens || 500}
                onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                min="100"
                max="2000"
                step="50"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border)', 
                  background: 'var(--bg-primary)' 
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Maximum response length
              </p>
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? <><LoadingSpinner /> Saving...</> : 'Save Configuration'}
          </Button>
        </form>
      </div>
    </>
  )
}
