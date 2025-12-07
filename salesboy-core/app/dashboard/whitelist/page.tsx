'use client'
import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'

export default function WhitelistPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [whitelist, setWhitelist] = useState<string[]>([])
  const { showToast } = useToast()

  const addNumber = () => {
    if (phoneNumber && !whitelist.includes(phoneNumber)) {
      setWhitelist([...whitelist, phoneNumber])
      setPhoneNumber('')
      showToast('Phone number added', 'success')
    }
  }

  const removeNumber = (number: string) => {
    setWhitelist(whitelist.filter(n => n !== number))
    showToast('Phone number removed', 'info')
  }

  return (
    <>
      <DashboardHeader 
        title="Whitelist" 
        description="Manage allowed phone numbers" 
      />

      <div className="card" style={{ marginBottom: '2rem', borderTop: '3px solid var(--accent)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '500', color: 'var(--accent)' }}>
          Add Phone Number
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+234XXXXXXXXXX"
            style={{ flex: 1 }}
          />
          <Button onClick={addNumber}>Add</Button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '500' }}>
          Whitelisted Numbers ({whitelist.length})
        </h2>
        {whitelist.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No numbers added yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {whitelist.map((number, i) => (
              <div key={i} style={{ 
                padding: '1rem', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '8px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderLeft: '3px solid var(--accent)'
              }}>
                <span style={{ fontWeight: '500' }}>{number}</span>
                <Button onClick={() => removeNumber(number)}>Remove</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}