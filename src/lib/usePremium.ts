import { useState, useCallback } from 'react'
import { PREMIUM_DAILY_LIMIT } from './config'

const PREMIUM_USAGE_KEY = 'ot_premium_usage'
const PRO_KEY = 'ot_pro'

interface PremiumUsage {
  date: string
  count: number
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function readUsage(): PremiumUsage {
  try {
    const raw = localStorage.getItem(PREMIUM_USAGE_KEY)
    if (raw) {
      const u = JSON.parse(raw) as PremiumUsage
      if (u.date === today()) return u
    }
  } catch { /* ignore */ }
  return { date: today(), count: 0 }
}

function writeUsage(u: PremiumUsage): void {
  try {
    localStorage.setItem(PREMIUM_USAGE_KEY, JSON.stringify(u))
  } catch { /* ignore */ }
}

export function isPro(): boolean {
  try {
    return localStorage.getItem(PRO_KEY) === 'true'
  } catch {
    return false
  }
}

export function setPro(val: boolean): void {
  try {
    if (val) localStorage.setItem(PRO_KEY, 'true')
    else localStorage.removeItem(PRO_KEY)
  } catch { /* ignore */ }
}

export function premiumUsesLeft(): number {
  if (isPro()) return Infinity
  return Math.max(0, PREMIUM_DAILY_LIMIT - readUsage().count)
}

export function recordPremiumUse(): void {
  if (isPro()) return
  const u = readUsage()
  writeUsage({ date: today(), count: u.count + 1 })
}

export function rollbackPremiumUse(): void {
  if (isPro()) return
  const u = readUsage()
  writeUsage({ date: today(), count: Math.max(0, u.count - 1) })
}

/** Hook that returns { usesLeft, consume, isPro, upgrade } for a premium tool. */
export function usePremiumTool() {
  const [usesLeft, setUsesLeft] = useState(() => premiumUsesLeft())
  const [pro, setProState] = useState(() => isPro())

  const consume = useCallback(() => {
    if (isPro()) return true // always allowed
    const left = premiumUsesLeft()
    if (left <= 0) return false
    recordPremiumUse()
    setUsesLeft(premiumUsesLeft())
    return true
  }, [])

  const rollback = useCallback(() => {
    rollbackPremiumUse()
    setUsesLeft(premiumUsesLeft())
  }, [])

  return { usesLeft, consume, rollback, isPro: pro }
}
