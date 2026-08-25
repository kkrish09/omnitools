import { useEffect, useRef } from 'react'
import { SITE } from '../lib/config'

/**
 * Ad slot. Renders a real AdSense unit once SITE.adsenseClient is set in config.ts,
 * a dashed placeholder when ?debugads=1 (for layout checks), and nothing otherwise.
 */
export default function AdSlot({ slot = '0000000000', format = 'auto', className = '' }: { slot?: string; format?: string; className?: string }) {
  const ref = useRef<HTMLModElement>(null)
  const debug = typeof window !== 'undefined' && window.location.search.includes('debugads')

  useEffect(() => {
    if (!SITE.adsenseClient || !ref.current) return
    try {
      // @ts-expect-error - adsbygoogle injected by AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* script not loaded yet */
    }
  }, [])

  if (!SITE.adsenseClient) {
    if (!debug) return null
    return (
      <div className={`flex min-h-[90px] items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-xs uppercase tracking-widest text-zinc-400 dark:border-zinc-700 ${className}`}>
        Ad space — set adsenseClient in src/lib/config.ts
      </div>
    )
  }

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${className}`}
      data-ad-client={SITE.adsenseClient}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
