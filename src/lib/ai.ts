import { AI_FREE_DAILY_LIMIT } from './config'

const USAGE_KEY = 'ot_ai_usage'

interface Usage {
  date: string
  count: number
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function readUsage(): Usage {
  try {
    const raw = localStorage.getItem(USAGE_KEY)
    if (raw) {
      const u = JSON.parse(raw) as Usage
      if (u.date === today()) return u
    }
  } catch {
    /* ignore */
  }
  return { date: today(), count: 0 }
}

function writeUsage(u: Usage): void {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(u))
  } catch {
    /* ignore */
  }
}

export function aiUsesLeft(): number {
  return Math.max(0, AI_FREE_DAILY_LIMIT - readUsage().count)
}

function recordUse(): void {
  const u = readUsage()
  writeUsage({ date: today(), count: u.count + 1 })
}

/** Give the user their generation back if the request failed (no unfair loss). */
function rollbackUse(): void {
  const u = readUsage()
  writeUsage({ date: today(), count: Math.max(0, u.count - 1) })
}

export interface AiResult {
  text: string
}

export async function callAi(opts: { system: string; user: string; maxTokens?: number }): Promise<AiResult> {
  if (aiUsesLeft() <= 0) {
    throw new Error('LIMIT_REACHED')
  }
  recordUse()
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    })
    let data: { text?: string; error?: string } = {}
    try {
      data = await res.json()
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      throw new Error(data.error || `AI request failed (${res.status})`)
    }
    return { text: data.text ?? '' }
  } catch (e) {
    rollbackUse()
    throw e
  }
}
