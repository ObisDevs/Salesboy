export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <aside style={{ width: '250px', background: '#1a1a1a', borderRight: '4px solid #00ff00', padding: '2rem 1rem' }}>
        <h2 style={{ color: '#ffd700', marginBottom: '2rem', fontSize: '1.5rem' }}>MENU</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a href="/dashboard" style={{ color: '#00ff00', textDecoration: 'none', padding: '0.5rem', border: '2px solid #00ff00' }}>
            OVERVIEW
          </a>
          <a href="/dashboard/sessions" style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem' }}>
            SESSIONS
          </a>
          <a href="/dashboard/knowledge" style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem' }}>
            KNOWLEDGE BASE
          </a>
          <a href="/dashboard/whitelist" style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem' }}>
            WHITELIST
          </a>
          <a href="/dashboard/logs" style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem' }}>
            LOGS
          </a>
          <a href="/dashboard/settings" style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem' }}>
            SETTINGS
          </a>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '2rem' }}>
        <div className="brutalist-border" style={{ padding: '2rem', marginBottom: '2rem', background: '#1a1a1a' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#00ff00', marginBottom: '0.5rem' }}>DASHBOARD</h1>
          <p style={{ color: '#ffd700' }}>System Overview</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div className="brutalist-border" style={{ padding: '1.5rem', background: '#1a1a1a' }}>
            <div style={{ fontSize: '3rem', color: '#00ff00', marginBottom: '0.5rem' }}>0</div>
            <div style={{ color: '#ffd700', fontSize: '1.2rem' }}>ACTIVE SESSIONS</div>
          </div>

          <div className="brutalist-border" style={{ padding: '1.5rem', background: '#1a1a1a' }}>
            <div style={{ fontSize: '3rem', color: '#00ff00', marginBottom: '0.5rem' }}>0</div>
            <div style={{ color: '#ffd700', fontSize: '1.2rem' }}>DOCUMENTS</div>
          </div>

          <div className="brutalist-border" style={{ padding: '1.5rem', background: '#1a1a1a' }}>
            <div style={{ fontSize: '3rem', color: '#00ff00', marginBottom: '0.5rem' }}>0</div>
            <div style={{ color: '#ffd700', fontSize: '1.2rem' }}>MESSAGES TODAY</div>
          </div>

          <div className="brutalist-border" style={{ padding: '1.5rem', background: '#1a1a1a' }}>
            <div style={{ fontSize: '3rem', color: '#00ff00', marginBottom: '0.5rem' }}>100%</div>
            <div style={{ color: '#ffd700', fontSize: '1.2rem' }}>UPTIME</div>
          </div>
        </div>

        <div className="brutalist-border" style={{ padding: '2rem', background: '#1a1a1a' }}>
          <h2 style={{ color: '#ffd700', marginBottom: '1rem', fontSize: '1.5rem' }}>QUICK ACTIONS</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="brutalist-button">START SESSION</button>
            <button className="brutalist-button">UPLOAD DOCUMENT</button>
            <button className="brutalist-button">VIEW LOGS</button>
            <button className="brutalist-button">CONFIGURE BOT</button>
          </div>
        </div>
      </main>
    </div>
  )
}