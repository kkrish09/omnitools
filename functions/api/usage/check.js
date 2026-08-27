import { getSql, getUser, json } from '../../db/helpers.js'

const LIMITS = { premium: 1, ai: 1 }

export async function onRequestGet({ request, env }) {
  const user = await getUser(request, env)
  if (!user) return json({ error: 'Auth required' }, 401)

  const url = new URL(request.url)
  const toolType = url.searchParams.get('toolType') || 'premium'
  const sql = getSql(env)
  const today = new Date().toISOString().slice(0, 10)

  const planRows = await sql`SELECT plan FROM users WHERE id = ${user.userId} LIMIT 1`
  const isPro = planRows.length > 0 && planRows[0].plan === 'pro'

  if (isPro) return json({ usesLeft: 999, isPro: true, used: 0, limit: 999 })

  const rows = await sql`SELECT count FROM usage WHERE user_id = ${user.userId} AND tool_type = ${toolType} AND date = ${today} LIMIT 1`
  const used = rows.length > 0 ? rows[0].count : 0
  const limit = LIMITS[toolType] || 1
  return json({ usesLeft: Math.max(0, limit - used), isPro: false, used, limit })
}
