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
  const [uploadingProducts, setUploadingProducts] = useState(false)
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

  const uploadProductCatalog = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingProducts(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData
      })
      const result = await res.json()
      if (!res.ok) {
        showToast('Upload failed: ' + result.error, 'error')
        return
      }
      showToast(result.message, 'success')
    } catch (error) {
      showToast('Upload failed', 'error')
    } finally {
      setUploadingProducts(false)
      e.target.value = ''
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

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>Business Information</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Add your business details so the AI can represent your company properly and handle email requests correctly.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={config.business_name || ''}
                  onChange={(e) => setConfig({ ...config, business_name: e.target.value })}
                  placeholder="e.g. Johnson & Associates"
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--bg-primary)' 
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Business Email
                </label>
                <input
                  type="email"
                  value={config.business_email || ''}
                  onChange={(e) => setConfig({ ...config, business_email: e.target.value })}
                  placeholder="e.g. info@johnsonassociates.com"
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--bg-primary)' 
                  }}
                />
              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              The AI will use this information to represent your business and handle email notifications properly.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>Product Catalog</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Upload a CSV file with your products so the AI can provide pricing and product information.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                id="product-upload"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={uploadProductCatalog}
                disabled={uploadingProducts}
              />
              <Button 
                onClick={() => document.getElementById('product-upload')?.click()}
                disabled={uploadingProducts}
                style={{ background: 'var(--accent)' }}
              >
                {uploadingProducts ? <><LoadingSpinner /> Uploading...</> : 'Upload CSV'}
              </Button>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              CSV format: name, price, description, category, sku, in_stock
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
