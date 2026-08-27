import { getSql, verifyPassword, createToken, setSessionCookie, json } from '../../db/helpers.js'

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''
  if (!email || !password) return json({ error: 'Email and password required' }, 400)

  const sql = getSql(env)
  const found = await sql`SELECT id, email, name, password_hash FROM users WHERE email = ${email} LIMIT 1`
  if (found.length === 0) return json({ error: 'Invalid email or password' }, 401)

  const user = found[0]
  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return json({ error: 'Invalid email or password' }, 401)

  const token = await createToken(env, user.id, user.email)
  return json(
    { ok: true, user: { id: user.id, email: user.email, name: user.name } },
    200,
    { 'Set-Cookie': setSessionCookie(token) },
  )
}
