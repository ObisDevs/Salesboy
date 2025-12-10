'use client'
import { useState, useEffect } from 'react'
import DashboardHeader from '@/app/components/DashboardHeader'
import { Button } from '@/app/components/ui/button'
import { LoadingSpinner } from '@/app/components/ui/loading'
import { useToast } from '@/app/components/ui/toast'

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [masterEnabled, setMasterEnabled] = useState(false)
  const { showToast } = useToast()

  const fetchGroups = async () => {
    try {
      setLoading(true)
      
      // Fetch groups and bot config
      const [groupsRes, configRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/bot-config')
      ])
      
      const { data: groupsData } = await groupsRes.json()
      const { data: configData } = await configRes.json()
      
      setGroups(groupsData || [])
      setMasterEnabled(configData?.reply_to_groups || false)
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
    if (!masterEnabled && !currentState) {
      showToast('Enable group replies in Bot Config first', 'error')
      return
    }
    
    try {
      const res = await fetch('/api/groups/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, auto_reply: !currentState })
      })
      
      if (!res.ok) throw new Error('Failed to update')
      
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
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Groups</h2>
            <Button onClick={fetchGroups} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Refresh'}
            </Button>
          </div>
          
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: masterEnabled ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
            borderRadius: '6px',
            border: `1px solid ${masterEnabled ? 'var(--success)' : 'var(--border)'}`,
            fontSize: '0.875rem'
          }}>
            <span style={{ fontWeight: '500' }}>Master Group Replies: </span>
            <span style={{ color: masterEnabled ? 'var(--success)' : 'var(--text-muted)' }}>
              {masterEnabled ? 'Enabled' : 'Disabled'}
            </span>
            {!masterEnabled && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                (Enable in Bot Config to control individual groups)
              </span>
            )}
          </div>
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
                <div style={{ position: 'relative' }}>
                  <Button 
                    onClick={() => toggleAutoReply(group.id, group.auto_reply || false)}
                    disabled={!masterEnabled && !group.auto_reply}
                    style={{ 
                      background: group.auto_reply ? 'var(--success)' : 'var(--border)',
                      minWidth: '120px',
                      opacity: !masterEnabled && !group.auto_reply ? 0.5 : 1
                    }}
                    title={!masterEnabled ? 'Enable group replies in Bot Config first' : ''}
                  >
                    {group.auto_reply ? 'Auto-Reply ON' : 'Auto-Reply OFF'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
