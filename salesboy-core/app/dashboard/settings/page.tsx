'use client'
import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'

export default function SettingsPage() {
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful business assistant.')
  const [temperature, setTemperature] = useState(0.7)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const saveSettings = async () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Settings saved successfully', 'success')
    }, 1000)
  }

  return (
    <>
      <DashboardHeader 
        title="Bot Settings" 
        description="Configure AI behavior and responses" 
      />

      <div className="card" style={{ marginBottom: '2rem', borderTop: '3px solid var(--accent)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '500', color: 'var(--accent)' }}>
          System Prompt
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Define how the AI should behave and respond
        </p>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="input"
          rows={6}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '500', color: 'var(--accent)' }}>
          Model Settings
        </h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Temperature: {temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Lower values make responses more focused, higher values more creative
          </p>
        </div>
      </div>

      <Button onClick={saveSettings} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </>
  )
}