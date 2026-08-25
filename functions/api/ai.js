// Cloudflare Pages Function: POST /api/ai
// Proxies prompts to Cloudflare Workers AI (free tier).
//
// Required environment variables (set in Pages → Settings → Environment variables):
//   CLOUDFLARE_ACCOUNT_ID   – your Cloudflare account ID
//   CLOUDFLARE_AI_TOKEN     – API token with "Workers AI Run" permission

const json = (obj, status) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const user = typeof body?.user === 'string' ? body.user : ''
  const system = typeof body?.system === 'string' ? body.system : ''
  if (!user) return json({ error: 'Missing prompt' }, 400)

  const account = env.CLOUDFLARE_ACCOUNT_ID
  const token = env.CLOUDFLARE_AI_TOKEN
  if (!account || !token) {
    return json(
      {
        error:
          'AI is not configured yet. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_TOKEN environment variables in your Cloudflare Pages settings (see README).',
      },
      503,
    )
  }

  const model = env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct'
  const messages = []
  if (system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: user.slice(0, 16000) })

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        max_tokens: Math.min(Number(body.maxTokens) || 1000, 2000),
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.success === false) {
      const msg =
        (Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) ||
        `Workers AI request failed (${res.status})`
      return json({ error: msg }, res.ok ? 500 : res.status)
    }

    const text =
      typeof data.result === 'string'
        ? data.result
        : data.result && data.result.response
          ? data.result.response
          : ''
    return json({ text })
  } catch (e) {
    return json({ error: 'Upstream AI request failed: ' + (e && e.message) }, 502)
  }
}

export async function onRequestGet() {
  return json({ ok: true, endpoint: '/api/ai', method: 'POST', fields: ['system', 'user', 'maxTokens'] })
}
