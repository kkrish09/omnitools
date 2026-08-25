import { Link } from 'react-router-dom'
import { Check, Rocket, X } from 'lucide-react'
import { SITE, AI_PRO_DAILY_LIMIT } from '../lib/config'
import { useMeta } from '../lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    blurb: 'Everything most people need.',
    cta: 'Use any tool',
    to: '/',
    highlight: false,
    features: [
      ['All browser tools', true],
      ['1 AI generation per day', true],
      ['Ad-supported experience', true],
      [`${AI_PRO_DAILY_LIMIT} AI generations / day`, false],
      ['Batch processing & large files', false],
      ['Zero ads', false],
    ],
  },
  {
    name: 'Pro',
    price: '$6',
    period: '/month',
    blurb: 'For creators and daily users.',
    cta: 'Get Pro',
    to: SITE.stripeLinks.pro,
    highlight: true,
    features: [
      ['All browser tools', true],
      [`${AI_PRO_DAILY_LIMIT} AI generations every day`, true],
      ['Zero ads, forever', true],
      ['Batch processing & large files', true],
      ['Priority new-tool requests', true],
      ['Cancel anytime', true],
    ],
  },
]

export default function Premium() {
  useMeta('Premium — More AI & Zero Ads | OmniTools', 'Upgrade to OmniTools Pro for more AI generations, batch processing and a completely ad-free experience.')
  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Rocket className="h-3.5 w-3.5" /> Support the project
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Go Pro</h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-500 dark:text-zinc-400">
          Every browser tool stays free forever. Pro unlocks plenty of daily AI generations, removes ads and keeps the servers humming.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`card relative flex flex-col p-6 ${p.highlight ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
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
              <a href={p.to as string} target="_blank" rel="noreferrer" className={`mt-6 ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                {p.cta}
              </a>
            ) : p.highlight ? (
              <button disabled className="btn-primary mt-6">Checkout coming soon</button>
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
