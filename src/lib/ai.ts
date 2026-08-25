export interface AiResult {
  text: string
}

export async function callAi(opts: { system: string; user: string; maxTokens?: number }): Promise<AiResult> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(opts),
  })

  let data: { text?: string; error?: string } = {}
  try {
    data = await res.json()
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('AUTH_REQUIRED')
    }
    if (res.status === 429) {
      throw new Error('LIMIT_REACHED')
    }
    throw new Error(data.error || `AI request failed (${res.status})`)
  }

  return { text: data.text ?? '' }
}
