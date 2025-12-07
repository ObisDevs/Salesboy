export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
          🤖 Salesboy AI
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          WhatsApp AI Assistant for Nigerian Businesses
        </p>
        
        <div style={{ 
          background: '#f7fafc', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>
            ✅ System Status
          </h2>
          <div style={{ textAlign: 'left', fontSize: '0.95rem' }}>
            <p>✅ Core Backend: <strong>Running</strong></p>
            <p>✅ AI Pipeline: <strong>Ready</strong></p>
            <p>✅ RAG System: <strong>Active</strong></p>
            <p>✅ Gateway Integration: <strong>Connected</strong></p>
          </div>
        </div>

        <div style={{ 
          background: '#edf2f7', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>
            📊 Milestone 3 Complete
          </h2>
          <div style={{ textAlign: 'left', fontSize: '0.9rem', color: '#555' }}>
            <p>✅ WhatsApp Webhook Handler</p>
            <p>✅ RAG Pipeline with Pinecone</p>
            <p>✅ Intent Classification</p>
            <p>✅ Knowledge Base APIs</p>
            <p>✅ Session Management</p>
            <p>✅ Task Forwarding to n8n</p>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#888' }}>
          <p>API Endpoints: /api/webhook/whatsapp</p>
          <p>Version: 1.0.0 | Milestone 3</p>
        </div>
      </div>
    </div>
  )
}