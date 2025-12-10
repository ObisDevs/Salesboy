import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser-client'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Overview', icon: '◆' },
    { href: '/dashboard/sessions', label: 'Sessions', icon: '◇' },
    { href: '/dashboard/kb', label: 'Knowledge Base', icon: '◈' },
    { href: '/dashboard/products', label: 'Products', icon: '◊' },
    { href: '/dashboard/groups', label: 'Groups', icon: '◉' },
    { href: '/dashboard/whitelist', label: 'Whitelist', icon: '◎' },
    { href: '/dashboard/logs', label: 'Logs', icon: '◐' },
    { href: '/dashboard/bot-config', label: 'Bot Config', icon: '◑' },
    { href: '/dashboard/settings', label: 'Settings', icon: '◒' },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div style={{ 
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }} className="block md:hidden">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--accent)' }}>
              Salesboy AI
            </h2>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
          className="md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{ 
        width: '240px', 
        background: 'var(--bg-secondary)', 
        borderRight: '1px solid var(--border)', 
        padding: '2rem 1rem',
        minHeight: '100vh',
        position: mobileMenuOpen ? 'fixed' : 'static',
        top: 0,
        left: mobileMenuOpen ? 0 : '-240px',
        zIndex: 50,
        transition: 'left 0.3s ease'
      }} className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--accent)' }}>
              Salesboy AI
            </h2>
          </Link>
        </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
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
        <button
          onClick={handleLogout}
          style={{
            color: 'var(--text-muted)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'transparent',
            fontWeight: '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            marginTop: '1rem',
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem'
          }}
        >
          <span style={{ color: '#dc2626' }}>◓</span>
          Logout
        </button>
      </nav>
    </aside>
    </>
  )
}