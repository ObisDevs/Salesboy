'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'
import { whitelistSchema } from '@/lib/validation'

export default function WhitelistPage() {
  const [whitelist, setWhitelist] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ phone_number: '', name: '', notes: '' })
  const [errors, setErrors] = useState<any>({})
  const { showToast } = useToast()

  const fetchWhitelist = async () => {
    const res = await fetch('/api/whitelist')
    const { data } = await res.json()
    setWhitelist(data || [])
  }

  const addNumber = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      whitelistSchema.parse({ phone_number: formData.phone_number, label: formData.name })
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
      await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setFormData({ phone_number: '', name: '', notes: '' })
      setShowForm(false)
      fetchWhitelist()
      showToast('Number added successfully', 'success')
    } catch (error) {
      showToast('Failed to add number', 'error')
    } finally {
      setLoading(false)
    }
  }

  const removeNumber = async (id: string) => {
    if (!confirm('Remove this number?')) return
    try {
      await fetch(`/api/whitelist?id=${id}`, { method: 'DELETE' })
      fetchWhitelist()
      showToast('Number removed', 'success')
    } catch (error) {
      showToast('Failed to remove number', 'error')
    }
  }

  useEffect(() => {
    fetchWhitelist()
  }, [])

  return (
    <>
      <DashboardHeader title="Whitelist" description="Manage approved phone numbers" />
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Phone Numbers</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Number'}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={addNumber} style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <input
              type="text"
              placeholder="Phone Number (e.g., 2349058653283@c.us)"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              required
              style={{ width: '100%', padding: '0.75rem', marginBottom: '0.25rem', borderRadius: '6px', border: `1px solid ${errors.phone_number ? 'var(--error)' : 'var(--border)'}`, background: 'var(--bg-primary)' }}
            />
            {errors.phone_number && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{errors.phone_number}</p>}
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)' }}
            />
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', minHeight: '80px' }}
            />
            <Button type="submit" disabled={loading}>Add to Whitelist</Button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {whitelist.map((item) => (
            <div key={item.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500' }}>{item.name || 'Unnamed'}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.phone_number}</div>
                {item.notes && <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.notes}</div>}
              </div>
              <Button onClick={() => removeNumber(item.id)} style={{ background: '#dc2626' }}>Remove</Button>
            </div>
          ))}
          {whitelist.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No numbers in whitelist. Add one to get started.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
