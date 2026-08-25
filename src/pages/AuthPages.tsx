import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useMeta } from '../lib/utils'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useMeta('Log In — OmniTools', 'Log in to your OmniTools account.')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-500">Log in to access premium tools and AI.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
        <div>
          <span className="label">Email</span>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <span className="label">Password</span>
          <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={8} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Don't have an account?{' '}
        <Link to="/signup" className="text-indigo-500 underline">Sign up free</Link>
      </p>
    </div>
  )
}

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useMeta('Sign Up — OmniTools', 'Create a free OmniTools account for premium tools and AI.')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signup(email, password, name)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-500">Free — unlocks premium tools (1/day) and AI (1/day).</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
        <div>
          <span className="label">Name</span>
          <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" />
        </div>
        <div>
          <span className="label">Email</span>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <span className="label">Password</span>
          <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" minLength={8} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-500 underline">Log in</Link>
      </p>
    </div>
  )
}
