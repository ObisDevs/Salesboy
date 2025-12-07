export function LoadingSpinner() {
  return (
    <div style={{ 
      display: 'inline-block', 
      width: '20px', 
      height: '20px', 
      border: '3px solid var(--border)', 
      borderTop: '3px solid var(--accent)', 
      borderRadius: '50%', 
      animation: 'spin 1s linear infinite' 
    }} />
  )
}

export function LoadingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid var(--border)', 
        borderTop: '4px solid var(--accent)', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  )
}