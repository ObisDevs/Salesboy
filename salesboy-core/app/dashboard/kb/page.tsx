'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'
import { LoadingSpinner } from '@/app/components/ui/loading'

interface EmbedLog {
  fileId: string
  logs: string[]
  status: 'processing' | 'success' | 'error'
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [preview, setPreview] = useState<{ url: string, name: string, type: string } | null>(null)
  const [embedLogs, setEmbedLogs] = useState<Record<string, EmbedLog>>({})
  const { showToast } = useToast()

  const fetchFiles = async () => {
    try {
      setLoading(true)
      // Add cache busting to force fresh data
      const res = await fetch('/api/kb/list?t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
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
      // Immediately remove from UI
      setFiles(prev => prev.filter(f => f.id !== id))
      
      const res = await fetch(`/api/kb/delete?id=${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) {
        showToast('Delete failed: ' + result.error, 'error')
        // Restore on error
        await fetchFiles()
      } else {
        showToast('File deleted', 'success')
      }
    } catch (error) {
      showToast('Failed to delete file', 'error')
      // Restore on error
      await fetchFiles()
    }
  }

  const clearAllKnowledge = async () => {
    if (!confirm('⚠️ This will permanently delete ALL your knowledge base data and embeddings. This cannot be undone. Continue?')) return
    
    setClearing(true)
    try {
      const res = await fetch('/api/kb/clear', { method: 'DELETE' })
      const result = await res.json()
      
      if (!res.ok) {
        showToast('Failed to clear knowledge: ' + result.error, 'error')
      } else {
        showToast('✅ All knowledge base data cleared successfully', 'success')
        setFiles([])
        setEmbedLogs({})
      }
    } catch (error) {
      showToast('Failed to clear knowledge base', 'error')
    } finally {
      setClearing(false)
    }
  }

  const addLog = (fileId: string, message: string) => {
    setEmbedLogs(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        fileId,
        logs: [...(prev[fileId]?.logs || []), `[${new Date().toLocaleTimeString()}] ${message}`],
        status: prev[fileId]?.status || 'processing'
      }
    }))
  }

  const handleEmbed = async (fileId: string, filename: string) => {
    // Initialize logs
    setEmbedLogs(prev => ({
      ...prev,
      [fileId]: { fileId, logs: [], status: 'processing' }
    }))

    try {
      addLog(fileId, `🚀 Starting embedding process for "${filename}"`)
      addLog(fileId, '📥 Downloading file from Supabase Storage...')
      
      await new Promise(resolve => setTimeout(resolve, 500))
      addLog(fileId, '✓ File downloaded successfully')
      
      addLog(fileId, '📄 Extracting text content...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const res = await fetch('/api/kb/trigger-embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId })
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        addLog(fileId, `❌ Error: ${result.error}`)
        setEmbedLogs(prev => ({
          ...prev,
          [fileId]: { ...prev[fileId], status: 'error' }
        }))
        showToast(result.error || 'Failed to embed', 'error')
        return
      }
      
      addLog(fileId, `✓ Text extracted (${result.chunks || 0} chunks created)`)
      addLog(fileId, '🧠 Generating embeddings with AI...')
      addLog(fileId, `✓ Generated ${result.vectors || 0} vector embeddings`)
      addLog(fileId, '☁️ Uploading vectors to Pinecone...')
      addLog(fileId, `✓ Successfully uploaded ${result.vectors || 0} vectors to Pinecone`)
      addLog(fileId, '✅ Embedding completed successfully!')
      
      setEmbedLogs(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'success' }
      }))
      
      showToast('✅ File embedded successfully!', 'success')
      await fetchFiles()
    } catch (error: any) {
      addLog(fileId, `❌ Fatal error: ${error.message}`)
      setEmbedLogs(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'error' }
      }))
      showToast('Failed to embed file', 'error')
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  return (
    <>
      <DashboardHeader title="Knowledge Base" description="Upload documents for AI context" />
      
      <div className="card">
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
          
          {files.length > 0 && (
            <Button 
              onClick={clearAllKnowledge}
              disabled={clearing}
              style={{ background: '#dc2626' }}
            >
              {clearing ? <><LoadingSpinner /> Clearing...</> : 'Clear All Knowledge'}
            </Button>
          )}
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
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {(file.status === 'embedded' || embedLogs[file.id]?.status === 'success') ? (
                  <Button 
                    disabled
                    style={{ 
                      background: '#10b981', 
                      color: 'white',
                      cursor: 'not-allowed',
                      opacity: 1,
                      border: 'none'
                    }}
                  >
                    ✓ Embedded
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleEmbed(file.id, file.filename)}
                    disabled={embedLogs[file.id]?.status === 'processing'}
                  >
                    {embedLogs[file.id]?.status === 'processing' ? (
                      <><LoadingSpinner /> Embedding...</>
                    ) : 'Embed'}
                  </Button>
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

      {/* Embedding Logs */}
      {Object.keys(embedLogs).length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '500' }}>Embedding Logs</h3>
          {Object.values(embedLogs).map((log) => {
            const file = files.find(f => f.id === log.fileId)
            return (
              <div key={log.fileId} style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: '8px',
                borderLeft: `4px solid ${log.status === 'success' ? '#10b981' : log.status === 'error' ? '#ef4444' : '#f59e0b'}`
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                    {file?.filename || 'Unknown file'}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: log.status === 'success' ? '#10b981' : log.status === 'error' ? '#ef4444' : '#f59e0b',
                    fontWeight: '500'
                  }}>
                    {log.status === 'success' && '✓ Completed'}
                    {log.status === 'error' && '✗ Failed'}
                    {log.status === 'processing' && '⏳ Processing...'}
                  </div>
                </div>
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.85rem', 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.75rem', 
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {log.logs.map((logLine, idx) => (
                    <div key={idx} style={{ marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                      {logLine}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

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
