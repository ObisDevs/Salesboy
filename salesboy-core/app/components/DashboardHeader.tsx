import ThemeToggle from './ThemeToggle'

interface DashboardHeaderProps {
  title: string
  description: string
}

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid var(--border)'
    }}>
      <div>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          marginBottom: '0.25rem',
          background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {title}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <ThemeToggle />
    </div>
  )
}