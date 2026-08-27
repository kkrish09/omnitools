// Direct Neon SQL-over-HTTP executor — zero npm deps, works in Pages Functions

export function getSql(env) {
  const connectionString = env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL not set')

  // Parse host from connection string
  const hostMatch = connectionString.match(/@([^/]+)/)
  if (!hostMatch) throw new Error('Cannot parse host from DATABASE_URL')
  const host = hostMatch[1]

  return async function sql(strings, ...values) {
    let query = ''
    const params = []
    for (let i = 0; i < strings.length; i++) {
      query += strings[i]
      if (i < values.length) {
        params.push(values[i])
        query += `$${params.length}`
      }
    }

    const res = await fetch(`https://${host}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'neon-connection-string': connectionString,
      },
      body: JSON.stringify({ query, params }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`SQL error ${res.status}: ${text.slice(0, 200)}`)
    }

    const data = await res.json()
    return data.rows || []
  }
}

// --- Password hashing (Web Crypto PBKDF2) ---

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, keyMaterial, 256,
  )
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)))
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, keyMaterial, 256,
  )
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('') === hashHex
}

// --- JWT using Web Crypto HMAC ---

const ALG = { name: 'HMAC', hash: 'SHA-256' }

// DEV-ONLY fallback so local development (where there is no Pages env) keeps
// signing/verifying sessions. This value is NOT secret and MUST NOT be used in
// production: the deployed environment must set JWT_SECRET (see report). Do not
// put a real production secret here.
const DEV_JWT_SECRET = 'omnitools-dev-secret-change-me'

async function getKey(env) {
  const secret = (env && env.JWT_SECRET) || DEV_JWT_SECRET
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), ALG, false, ['sign', 'verify'])
}

function base64url(input) {
  let binary
  if (typeof input === 'string') {
    binary = input
  } else {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
    let str = ''
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i])
    }
    binary = str
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

export async function createToken(env, userId, email) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const payload = base64url(JSON.stringify({ userId, email, iat: now, exp: now + 7 * 24 * 3600 }))
  const data = `${header}.${payload}`
  const sig = await crypto.subtle.sign('HMAC', await getKey(env), new TextEncoder().encode(data))
  return `${data}.${base64url(sig)}`
}

export async function verifyToken(env, token) {
  try {
    const [header, payload, sig] = token.split('.')
    if (!header || !payload || !sig) return null
    const valid = await crypto.subtle.verify('HMAC', await getKey(env), base64urlDecode(sig), new TextEncoder().encode(`${header}.${payload}`))
    if (!valid) return null
    const data = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)))
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null
    return data
  } catch {
    return null
  }
}

// --- Cookie helpers ---

const COOKIE_NAME = 'ot_session'

export function setSessionCookie(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

export function getSessionToken(request) {
  const cookie = request.headers.get('Cookie') || ''
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

export async function getUser(request, env) {
  const token = getSessionToken(request)
  if (!token) return null
  return await verifyToken(env, token)
}

export function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}
