'use client'
import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'

export default function KnowledgeBasePage() {
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', 'current-user')

    try {
      const res = await fetch('/api/kb/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      await fetch('/api/kb/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: data.file_id })
      })

      await fetch('/api/kb/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: data.file_id })
      })

      showToast('Document uploaded successfully', 'success')
    } catch (error) {
      showToast('Failed to upload document', 'error')
    }
    setUploading(false)
  }

  return (
    <>
      <DashboardHeader 
        title="Knowledge Base" 
        description="Upload and manage documents for AI training" 
      />

      <div className="card" style={{ borderTop: '3px solid var(--accent)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '500', color: 'var(--accent)' }}>
          Upload Document
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Supported formats: PDF, DOCX, TXT
        </p>
        <Input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && (
          <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>
            Processing document...
          </p>
        )}
      </div>
    </>
  )
}