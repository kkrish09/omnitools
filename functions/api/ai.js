import { getSql, getUser, json } from '../db/helpers.js'

export async function onRequestPost({ request, env }) {
  const user = await getUser(request)
  if (!user) return json({ error: 'Authentication required. Please log in.' }, 401)

  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON body' }, 400) }

  const prompt = typeof body?.user === 'string' ? body.user : ''
  const system = typeof body?.system === 'string' ? body.system : ''
  if (!prompt) return json({ error: 'Missing prompt' }, 400)

  const sql = getSql(env)
  const today = new Date().toISOString().slice(0, 10)

  const planRows = await sql`SELECT plan FROM users WHERE id = ${user.userId} LIMIT 1`
  const isPro = planRows.length > 0 && planRows[0].plan === 'pro'

  if (!isPro) {
    const rows = await sql`SELECT id, count FROM usage WHERE user_id = ${user.userId} AND tool_type = 'ai' AND date = ${today} LIMIT 1`
    const used = rows.length > 0 ? rows[0].count : 0
    if (used >= 1) return json({ error: 'Daily AI limit reached (1/day free). Upgrade to Pro for 100/day.' }, 429)

    if (rows.length > 0) {
      await sql`UPDATE usage SET count = ${used + 1} WHERE id = ${rows[0].id}`
    } else {
      await sql`INSERT INTO usage (id, user_id, tool_type, date, count) VALUES (${crypto.randomUUID()}, ${user.userId}, 'ai', ${today}, 1)`
    }
  }

  const account = env.CLOUDFLARE_ACCOUNT_ID
  const token = env.CLOUDFLARE_AI_TOKEN
  if (!account || !token) return json({ error: 'AI is not configured yet.' }, 503)

  const model = env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct'
  const messages = []
  if (system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: prompt.slice(0, 16000) })

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, max_tokens: Math.min(Number(body.maxTokens) || 1000, 2000) }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.success === false) {
      const msg = (Array.isArray(data.errors) && data.errors[0]?.message) || `Workers AI request failed (${res.status})`
      return json({ error: msg }, res.ok ? 500 : res.status)
    }

    const text = typeof data.result === 'string' ? data.result : data.result?.response || ''
    return json({ text })
  } catch (e) {
    return json({ error: 'Upstream AI request failed: ' + (e?.message || e) }, 502)
  }
}

export async function onRequestGet() {
  return json({ ok: true, endpoint: '/api/ai', method: 'POST' })
}
