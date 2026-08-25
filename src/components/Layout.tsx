import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Crown, Heart, LogOut, Menu, Moon, Sun, User, Wrench, X } from 'lucide-react'
import { Toolbar, TooltipTrigger, Tooltip, Button } from 'react-aria-components'
import { CATEGORIES, TOOLS } from '../lib/tools'
import { SITE } from '../lib/config'
import { useAuth } from '../lib/auth'
import { SearchInput, ToastRegionWrapper } from './rac'

const NAV = [
  { to: '/c/code', label: 'Code' },
  { to: '/c/encode', label: 'Encode' },
  { to: '/c/generate', label: 'Generate' },
  { to: '/c/devref', label: 'Reference' },
  { to: '/c/design', label: 'Design' },
  { to: '/c/premium', label: 'Premium', icon: Crown },
  { to: '/c/text', label: 'Text' },
]

export default function Layout() {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, logout } = useAuth()
  const searchRef = useRef<HTMLInputElement>(null)

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('ot-theme', next ? 'dark' : 'light')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid var(--border)',
        background: dark ? 'rgba(9,9,11,.8)' : 'rgba(255,255,255,.8)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto', height: '4rem',
          display: 'flex', alignItems: 'center', gap: 'var(--sp-4)',
          padding: '0 var(--sp-4)',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontWeight: 700, textDecoration: 'none', color: 'var(--text)' }}>
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-5), #7c3aed)',
              color: 'white',
            }}>
              <Wrench size={18} />
            </span>
            <span style={{ fontSize: 'var(--text-lg)', letterSpacing: '-0.02em' }}>
              Omni<span style={{ color: 'var(--accent-5)' }}>Tools</span>
            </span>
          </Link>

          {/* Nav — hidden on mobile */}
          <Toolbar aria-label="Main navigation" style={{
            display: 'none', gap: 'var(--sp-1)', marginLeft: 'var(--sp-2)',
          }} className="lg:!flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                style={({ isActive }) => ({
                  padding: 'var(--sp-2) var(--sp-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-6)' : 'var(--text-secondary)',
                  background: isActive ? (dark ? 'var(--accent-9)' : 'var(--accent-0)') : 'transparent',
                  transition: 'all 100ms ease',
                })}
              >
                {n.label}
              </NavLink>
            ))}
          </Toolbar>

          {/* Search */}
          <div style={{ position: 'relative', marginLeft: 'auto', width: '16rem' }} className="hidden md:block">
            <SearchInput
              placeholder={`Search ${TOOLS.length} tools...`}
              value={q}
              onChange={setQ}
              onSubmit={(v) => navigate(`/?q=${encodeURIComponent(v)}`)}
              inputRef={searchRef}
              aria-label="Search tools"
            />
          </div>

          {/* Theme toggle */}
          <TooltipTrigger>
            <Button
              onPress={toggleTheme}
              aria-label="Toggle theme"
              data-variant="ghost"
              style={{ padding: 'var(--sp-2)', minWidth: '36px' }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Tooltip>{dark ? 'Light mode' : 'Dark mode'}</Tooltip>
          </TooltipTrigger>

          {/* Auth buttons */}
          {!loading && (
            user ? (
              <div style={{ display: 'none', alignItems: 'center', gap: 'var(--sp-2)' }} className="md:!flex">
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                  <User size={14} />
                  {user.email}
                </span>
                <TooltipTrigger>
                  <Button onPress={() => { logout(); navigate('/') }} data-variant="ghost" style={{ padding: 'var(--sp-2)' }}>
                    <LogOut size={14} />
                  </Button>
                  <Tooltip>Log out</Tooltip>
                </TooltipTrigger>
              </div>
            ) : (
              <div style={{ display: 'none', gap: 'var(--sp-2)' }} className="md:!flex">
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button data-variant="ghost" style={{ padding: 'var(--sp-1) var(--sp-3)', fontSize: 'var(--text-xs)' }}>Log in</Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <Button data-variant="primary" style={{ padding: 'var(--sp-1) var(--sp-3)', fontSize: 'var(--text-xs)' }}>Sign up</Button>
                </Link>
              </div>
            )
          )}

          {/* Pro badge */}
          <Link to="/premium" style={{ textDecoration: 'none' }} className="hidden md:block">
            <Button data-variant="primary" style={{ padding: 'var(--sp-1) var(--sp-3)', fontSize: 'var(--text-xs)', background: 'var(--accent-6)' }}>Go Pro</Button>
          </Link>

          {/* Mobile menu */}
          <Button
            onPress={() => setOpen(!open)}
            aria-label="Menu"
            data-variant="ghost"
            className="lg:hidden"
            style={{ padding: 'var(--sp-2)' }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: 'var(--sp-4)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-1)',
          }}>
            {CATEGORIES.map((c) => (
              <Link key={c.id} to={`/c/${c.id}`} style={{
                padding: 'var(--sp-2) var(--sp-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                textDecoration: 'none',
                color: 'var(--text)',
              }}>
                {c.label}
              </Link>
            ))}
            <Link to="/premium" style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--accent-5)', textDecoration: 'none' }}>
              Go Pro →
            </Link>
            {!loading && (
              user ? (
                <button onClick={() => { logout(); navigate('/') }} style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--danger)', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                  Log out ({user.email})
                </button>
              ) : (
                <>
                  <Link to="/login" style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', color: 'var(--text)' }}>Log in</Link>
                  <Link to="/signup" style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--accent-5)', textDecoration: 'none' }}>Sign up</Link>
                </>
              )
            )}
          </div>
        )}
      </header>

      {/* Main */}
      <main style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', flex: 1, padding: 'var(--sp-8) var(--sp-4)' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          display: 'grid', gap: 'var(--sp-8)', padding: 'var(--sp-12) var(--sp-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontWeight: 700, marginBottom: 'var(--sp-3)' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--accent-5), #7c3aed)', color: 'white',
              }}>
                <Wrench size={14} />
              </span>
              OmniTools
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{SITE.tagline} Fast, private, no sign-up for free tools.</p>
            <p style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
              Made with <Heart size={12} style={{ fill: 'var(--danger)', color: 'var(--danger)' }} /> — runs entirely in your browser.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.id}><Link to={`/c/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{c.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              <li><Link to="/premium" style={{ textDecoration: 'none', color: 'inherit' }}>Premium</Link></li>
              <li><Link to="/guides" style={{ textDecoration: 'none', color: 'inherit' }}>Guides</Link></li>
              <li><Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>About</Link></li>
              <li><a href={`mailto:${SITE.contactEmail}`} style={{ textDecoration: 'none', color: 'inherit' }}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              <li><Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--sp-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </footer>

      {/* Global toast region */}
      <ToastRegionWrapper />
    </div>
  )
}
