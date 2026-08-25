import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface User {
  userId: string
  email: string
}

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, login: async () => {}, signup: async () => {}, logout: async () => {} })

export function useAuth() {
  return useContext(Ctx)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    setUser(data.user)
  }, [])

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Signup failed')
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    setUser(null)
  }, [])

  return <Ctx.Provider value={{ user, loading, login, signup, logout }}>{children}</Ctx.Provider>
}
