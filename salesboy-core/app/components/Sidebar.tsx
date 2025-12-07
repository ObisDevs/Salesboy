import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Overview', icon: '◆' },
    { href: '/dashboard/sessions', label: 'Sessions', icon: '◇' },
    { href: '/dashboard/kb', label: 'Knowledge Base', icon: '◈' },
    { href: '/dashboard/whitelist', label: 'Whitelist', icon: '◉' },
    { href: '/dashboard/logs', label: 'Logs', icon: '◎' },
    { href: '/dashboard/settings', label: 'Settings', icon: '◐' },
  ]

  return (
    <aside style={{ 
      width: '240px', 
      background: 'var(--bg-secondary)', 
      borderRight: '1px solid var(--border)', 
      padding: '2rem 1rem',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--accent)' }}>
          Salesboy AI
        </h2>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                fontWeight: isActive ? '500' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent'
              }}
            >
              <span style={{ color: 'var(--accent)' }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}