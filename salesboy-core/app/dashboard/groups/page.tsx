'use client'
import { useState, useEffect } from 'react'
import DashboardHeader from '@/app/components/DashboardHeader'
import { Button } from '@/app/components/ui/button'
import { LoadingSpinner } from '@/app/components/ui/loading'
import { useToast } from '@/app/components/ui/toast'

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/groups?user_id=00000000-0000-0000-0000-000000000001')
      const { data } = await res.json()
      setGroups(data || [])
    } catch (error) {
      showToast('Failed to fetch groups', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const toggleAutoReply = async (groupId: string, currentState: boolean) => {
    try {
      showToast(`Auto-reply ${!currentState ? 'enabled' : 'disabled'}`, 'success')
      setGroups(groups.map(g => 
        g.id === groupId ? { ...g, auto_reply: !currentState } : g
      ))
    } catch (error) {
      showToast('Failed to update group settings', 'error')
    }
  }

  return (
    <>
      <DashboardHeader title="WhatsApp Groups" description="Manage group auto-reply settings" />
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Groups</h2>
          <Button onClick={fetchGroups} disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Refresh'}
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <LoadingSpinner />
            <p style={{ marginTop: '1rem' }}>Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No groups found. Make sure your WhatsApp session is active.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {groups.map((group) => (
              <div key={group.id} style={{ 
                padding: '1rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{group.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {group.participants?.length || 0} participants
                  </div>
                </div>
                <Button 
                  onClick={() => toggleAutoReply(group.id, group.auto_reply)}
                  style={{ 
                    background: group.auto_reply ? 'var(--success)' : 'var(--border)',
                    minWidth: '120px'
                  }}
                >
                  {group.auto_reply ? 'Auto-Reply ON' : 'Auto-Reply OFF'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
