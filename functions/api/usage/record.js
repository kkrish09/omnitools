import { getSql, getUser, json } from '../../db/helpers.js'

const LIMITS = { premium: 1, ai: 1 }

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env)
  if (!user) return json({ error: 'Auth required' }, 401)

  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const toolType = body.toolType || 'premium'
  const sql = getSql(env)
  const today = new Date().toISOString().slice(0, 10)

  const planRows = await sql`SELECT plan FROM users WHERE id = ${user.userId} LIMIT 1`
  const isPro = planRows.length > 0 && planRows[0].plan === 'pro'

  if (isPro) return json({ ok: true, usesLeft: 999, isPro: true })

  const limit = LIMITS[toolType] || 1
  const rows = await sql`SELECT id, count FROM usage WHERE user_id = ${user.userId} AND tool_type = ${toolType} AND date = ${today} LIMIT 1`
  const current = rows.length > 0 ? rows[0].count : 0

  if (current >= limit) return json({ error: 'Daily limit reached. Upgrade to Pro.', usesLeft: 0 }, 429)

  if (rows.length > 0) {
    await sql`UPDATE usage SET count = ${current + 1} WHERE id = ${rows[0].id}`
  } else {
    await sql`INSERT INTO usage (id, user_id, tool_type, date, count) VALUES (${crypto.randomUUID()}, ${user.userId}, ${toolType}, ${today}, 1)`
  }

  return json({ ok: true, usesLeft: limit - current - 1, isPro: false })
}
