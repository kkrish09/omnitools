import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, Moon, Search, Sun, Wrench, X } from 'lucide-react'
import { CATEGORIES, TOOLS } from '../lib/tools'
import { SITE } from '../lib/config'

const NAV = [
  { to: '/c/pdf', label: 'PDF' },
  { to: '/c/image', label: 'Image' },
  { to: '/c/text', label: 'Text' },
  { to: '/c/dev', label: 'Developer' },
  { to: '/c/calc', label: 'Calculators' },
  { to: '/c/ai', label: 'AI Tools' },
]

export default function Layout() {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <Wrench className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg tracking-tight">Omni<span className="text-indigo-500">Tools</span></span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <form
            className="relative ml-auto hidden w-56 md:block"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/?q=${encodeURIComponent(q)}`)
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${TOOLS.length} tools…`}
              className="input pl-9"
            />
          </form>

          <button onClick={toggleTheme} aria-label="Toggle theme" className="btn-secondary ml-auto px-2.5 md:ml-0">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/premium" className="btn-primary hidden md:inline-flex">
            Go Pro
          </Link>
          <button className="btn-secondary px-2.5 lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-zinc-200 bg-white px-4 pb-4 pt-2 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((c) => (
                <Link key={c.id} to={`/c/${c.id}`} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  {c.label}
                </Link>
              ))}
              <Link to="/premium" className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-500">
                Go Pro →
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2 font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Wrench className="h-4 w-4" />
              </span>
              OmniTools
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{SITE.tagline} Fast, private, no sign-up.</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-zinc-400">
              Made with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> — runs entirely in your browser.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Categories</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link to={`/c/${c.id}`} className="hover:text-indigo-500">{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link to="/premium" className="hover:text-indigo-500">Premium</Link></li>
              <li><Link to="/guides" className="hover:text-indigo-500">Guides</Link></li>
              <li><Link to="/about" className="hover:text-indigo-500">About</Link></li>
              <li><a href={`mailto:${SITE.contactEmail}`} className="hover:text-indigo-500">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link to="/privacy" className="hover:text-indigo-500">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-500">Terms of Service</Link></li>
            </ul>
            {SITE.newsletterEndpoint && (
              <form
                className="mt-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const email = new FormData(form).get('email')
                  if (email) {
                    await fetch(SITE.newsletterEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
                    form.reset()
                    alert('Subscribed! Check your inbox.')
                  }
                }}
              >
                <label className="label">Get new tools weekly</label>
                <div className="flex gap-2">
                  <input name="email" type="email" required placeholder="you@email.com" className="input" />
                  <button className="btn-primary shrink-0">Join</button>
                </div>
              </form>
            )}
          </div>
        </div>
        <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
