import { Link } from 'react-router-dom'
import { Check, Crown, Rocket, X } from 'lucide-react'
import { SITE, AI_PRO_DAILY_LIMIT, AI_FREE_DAILY_LIMIT, PREMIUM_DAILY_LIMIT } from '../lib/config'
import { TOOLS } from '../lib/tools'
import { useMeta } from '../lib/utils'

const premiumCount = TOOLS.filter((t) => t.premium).length
const freeCount = TOOLS.filter((t) => !t.premium).length

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    blurb: 'Everything most developers need.',
    cta: 'Use any tool',
    to: '/',
    highlight: false,
    features: [
      [`${freeCount} free tools — unlimited use`, true],
      [`${AI_FREE_DAILY_LIMIT} AI generation per day`, true],
      [`${premiumCount} premium tools — ${PREMIUM_DAILY_LIMIT} use per day each`, true],
      ['Ad-supported experience', true],
      [`Up to ${AI_PRO_DAILY_LIMIT} AI generations / day`, false],
      ['Unlimited premium tool access', false],
      ['Zero ads', false],
    ],
  },
  {
    name: 'Pro',
    price: '$6',
    period: '/month',
    blurb: 'For power users and daily developers.',
    cta: 'Get Pro',
    to: SITE.stripeLinks.pro,
    highlight: true,
    features: [
      [`All ${freeCount} free tools — unlimited`, true],
      [`${AI_PRO_DAILY_LIMIT} AI generations every day`, true],
      [`All ${premiumCount} premium tools — unlimited`, true],
      ['Zero ads, forever', true],
      ['Priority new-tool requests', true],
      ['Cancel anytime', true],
    ],
  },
]

export default function Premium() {
  useMeta('Pro Plans — More AI & Premium Tools | OmniTools', `Upgrade to OmniTools Pro for unlimited premium tools, ${AI_PRO_DAILY_LIMIT} daily AI generations and zero ads.`)
  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <Rocket className="h-3.5 w-3.5" /> Support the project
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Go Pro</h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-500 dark:text-zinc-400">
          All {freeCount} base tools stay free forever. Pro unlocks unlimited access to {premiumCount} premium tools, plenty of AI generations, and removes ads.
        </p>
      </div>

      {/* Premium tools preview */}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="font-bold">Premium tools included with Pro</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOOLS.filter((t) => t.premium).map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white p-3 dark:bg-zinc-800">
              <t.icon className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t.blurb}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500">Free users get {PREMIUM_DAILY_LIMIT} use per day on each premium tool. Pro users get unlimited.</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`card relative flex flex-col p-6 ${p.highlight ? 'border-amber-500 ring-2 ring-amber-500/20' : ''}`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-bold">{p.name}</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">{p.price}</span>
              <span className="text-sm text-zinc-500">{p.period}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{p.blurb}</p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {p.features.map(([label, has]) => (
                <li key={label as string} className={`flex items-center gap-2 ${has ? '' : 'text-zinc-400 dark:text-zinc-600'}`}>
                  {has ? <Check className="h-4 w-4 shrink-0 text-emerald-500" /> : <X className="h-4 w-4 shrink-0" />}
                  {label}
                </li>
              ))}
            </ul>
            {p.to ? (
              <a href={p.to as string} target="_blank" rel="noreferrer" className={`mt-6 ${p.highlight ? 'btn-primary bg-amber-600 hover:bg-amber-500' : 'btn-secondary'}`}>
                {p.cta}
              </a>
            ) : p.highlight ? (
              <button disabled className="btn-primary mt-6 bg-amber-600">Checkout coming soon</button>
            ) : (
              <Link to="/" className="btn-secondary mt-6">{p.cta}</Link>
            )}
          </div>
        ))}
      </div>

      {!SITE.stripeLinks.pro && (
        <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Checkout activates automatically once a Stripe payment link is added in <code>src/lib/config.ts</code>.
        </p>
      )}

      <p className="mt-8 text-center text-sm text-zinc-500">
        Questions? <a href={`mailto:${SITE.contactEmail}`} className="text-indigo-500 underline">Email us</a>. Cancel anytime.
      </p>
    </div>
  )
}
