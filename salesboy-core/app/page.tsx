import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="brutalist-border" style={{ padding: '2rem', marginBottom: '2rem', background: '#000' }}>
          <h1 style={{ fontSize: '3rem', color: '#00ff00', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            SALESBOY AI
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#ffd700' }}>
            WhatsApp Business Automation System
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div className="brutalist-border" style={{ padding: '1.5rem', background: '#1a1a1a' }}>
            <h2 style={{ color: '#ffd700', marginBottom: '1rem', fontSize: '1.5rem' }}>SYSTEM STATUS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff00' }}>■</span>
                <span>Core Backend: RUNNING</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff00' }}>■</span>
                <span>AI Pipeline: READY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff00' }}>■</span>
                <span>RAG System: ACTIVE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff00' }}>■</span>
                <span>Gateway: CONNECTED</span>
              </div>
            </div>
          </div>

          <div className="brutalist-border" style={{ padding: '1.5rem', background: '#1a1a1a' }}>
            <h2 style={{ color: '#ffd700', marginBottom: '1rem', fontSize: '1.5rem' }}>MILESTONE 3</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div>▸ WhatsApp Webhook Handler</div>
              <div>▸ RAG Pipeline with Pinecone</div>
              <div>▸ Intent Classification</div>
              <div>▸ Knowledge Base APIs</div>
              <div>▸ Session Management</div>
              <div>▸ Task Forwarding to n8n</div>
            </div>
          </div>
        </div>

        <div className="brutalist-border" style={{ padding: '2rem', background: '#1a1a1a', textAlign: 'center' }}>
          <Link href="/dashboard">
            <button className="brutalist-button" style={{ fontSize: '1.2rem' }}>
              ENTER DASHBOARD
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
          <p>API: /api/webhook/whatsapp | VERSION: 1.0.0</p>
        </div>
      </div>
    </div>
  )
}