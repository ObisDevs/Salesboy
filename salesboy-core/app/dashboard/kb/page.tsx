'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/kb/list')
      const { data } = await res.json()
      console.log('KB files:', data)
      setFiles(data || [])
    } catch (error) {
      console.error('Fetch files error:', error)
    }
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/kb/upload', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) {
        const error = await res.json()
        alert('Upload failed: ' + error.error)
      } else {
        await fetchFiles()
      }
    } catch (error) {
      alert('Upload failed')
    }
    setUploading(false)
    e.target.value = ''
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return
    await fetch(`/api/kb/delete?id=${id}`, { method: 'DELETE' })
    fetchFiles()
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <>
      <DashboardHeader title="Knowledge Base" description="Upload documents for AI context" />
      
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            id="file-upload"
            type="file"
            onChange={uploadFile}
            accept=".pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()} 
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {files.map((file) => (
            <div key={file.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500' }}>{file.filename}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {(file.file_size / 1024).toFixed(2)} KB • {file.status}
                </div>
              </div>
              <Button onClick={() => deleteFile(file.id)} style={{ background: '#dc2626' }}>Delete</Button>
            </div>
          ))}
          {files.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No documents uploaded yet.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
