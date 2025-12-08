'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'
import { LoadingSpinner } from '@/app/components/ui/loading'

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<{ url: string, name: string, type: string } | null>(null)
  const { showToast } = useToast()

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/kb/list')
      const { data } = await res.json()
      setFiles(data || [])
    } catch (error) {
      showToast('Failed to fetch files', 'error')
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadRes = await fetch('/api/kb/upload', {
        method: 'POST',
        body: formData
      })
      const uploadResult = await uploadRes.json()
      if (!uploadRes.ok) {
        showToast('Upload failed: ' + uploadResult.error, 'error')
        return
      }

      showToast('✅ Document uploaded! Processing in background...', 'success')
      await fetchFiles()
    } catch (error) {
      showToast('Upload failed', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this file and its embeddings?')) return
    try {
      const res = await fetch(`/api/kb/delete?id=${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) {
        showToast('Delete failed: ' + result.error, 'error')
      } else {
        showToast('File deleted', 'success')
        await fetchFiles()
      }
    } catch (error) {
      showToast('Failed to delete file', 'error')
    }
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
            {uploading ? <><LoadingSpinner /> Uploading...</> : 'Upload Document'}
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <LoadingSpinner />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading files...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {files.map((file) => (
            <div key={file.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500' }}>{file.filename}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {(file.file_size / 1024).toFixed(2)} KB • 
                  <span style={{ 
                    color: file.status === 'embedded' ? '#10b981' : file.status === 'failed' ? '#ef4444' : '#f59e0b',
                    fontWeight: '500'
                  }}>
                    {file.status === 'embedded' ? '✓ Embedded' : file.status === 'failed' ? '✗ Failed' : '⏳ ' + file.status}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {file.status !== 'embedded' && (
                  <Button onClick={async () => {
                    try {
                      const res = await fetch('/api/kb/trigger-embed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ file_id: file.id })
                      })
                      const result = await res.json()
                      if (!res.ok) {
                        showToast(result.error || 'Failed to trigger embedding', 'error')
                        return
                      }
                      showToast('Embedding triggered', 'success')
                      setTimeout(fetchFiles, 2000)
                    } catch (error) {
                      showToast('Failed to trigger embedding', 'error')
                    }
                  }}>Embed</Button>
                )}
                <Button onClick={() => deleteFile(file.id)} style={{ background: '#dc2626' }}>Delete</Button>
              </div>
            </div>
          ))}
            {files.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No documents uploaded yet.
              </div>
            )}
          </div>
        )}
      </div>

      {preview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setPreview(null)}>
          <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', maxWidth: '90%', maxHeight: '90%', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>{preview.name}</h3>
              <Button onClick={() => setPreview(null)}>Close</Button>
            </div>
            {preview.type?.includes('image') ? (
              <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/knowledge-base/${preview.url}`} alt={preview.name} style={{ maxWidth: '100%' }} />
            ) : preview.type?.includes('text') ? (
              <iframe src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/knowledge-base/${preview.url}`} style={{ width: '100%', height: '500px', border: 'none' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Preview not available for this file type</p>
                <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/knowledge-base/${preview.url}`} target="_blank" style={{ color: 'var(--accent)' }}>Download File</a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
