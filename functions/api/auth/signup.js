import { getSql, hashPassword, createToken, setSessionCookie, json } from '../../db/helpers.js'

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''
  const name = (body.name || '').trim()

  if (!email || !email.includes('@')) return json({ error: 'Valid email required' }, 400)
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)

  try {
    // Debug: check what we get
    const dbUrl = env.DATABASE_URL
    if (!dbUrl) return json({ error: 'DATABASE_URL not set in env' }, 500)
    
    const sql = getSql(env)
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    if (existing.length > 0) return json({ error: 'An account with this email already exists' }, 409)

    const id = crypto.randomUUID()
    const passwordHash = await hashPassword(password)

    await sql`INSERT INTO users (id, email, name, password_hash) VALUES (${id}, ${email}, ${name || email.split('@')[0]}, ${passwordHash})`

    const token = await createToken(id, email)
    return json(
      { ok: true, user: { id, email, name: name || email.split('@')[0] } },
      200,
      { 'Set-Cookie': setSessionCookie(token) },
    )
  } catch (e) {
    return json({ error: 'Server error: ' + (e?.message || String(e)), stack: e?.stack?.slice(0, 300) }, 500)
  }
}
