import { useState, useCallback } from 'react'

interface UsageState {
  usesLeft: number | null // null = loading
  isPro: boolean
  loading: boolean
}

export function useServerUsage(toolType: string) {
  const [state, setState] = useState<UsageState>({ usesLeft: null, isPro: false, loading: true })

  const check = useCallback(async () => {
    try {
      const res = await fetch(`/api/usage/check?toolType=${toolType}`, { credentials: 'same-origin' })
      if (!res.ok) {
        setState({ usesLeft: 0, isPro: false, loading: false })
        return
      }
      const data = await res.json()
      setState({ usesLeft: data.usesLeft, isPro: data.isPro, loading: false })
    } catch {
      setState({ usesLeft: 0, isPro: false, loading: false })
    }
  }, [toolType])

  const record = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/usage/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ toolType }),
      })
      const data = await res.json()
      if (!res.ok) {
        setState({ usesLeft: 0, isPro: data.isPro || false, loading: false })
        return false
      }
      setState({ usesLeft: data.usesLeft, isPro: data.isPro, loading: false })
      return true
    } catch {
      return false
    }
  }, [toolType])

  return { ...state, check, record }
}
