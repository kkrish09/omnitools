import { Link } from 'react-router-dom'
import { Check, Crown, X } from 'lucide-react'
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
      [`${premiumCount} premium tools — ${PREMIUM_DAILY_LIMIT} use/day each`, true],
      ['Ad-supported', true],
      [`Up to ${AI_PRO_DAILY_LIMIT} AI generations / day`, false],
      ['Unlimited premium access', false],
      ['Zero ads', false],
    ],
  },
  {
    name: 'Pro',
    price: '$6',
    period: '/month',
    blurb: 'For daily developers who want it all.',
    cta: 'Get Pro',
    to: SITE.stripeLinks.pro,
    highlight: true,
    features: [
      [`All ${freeCount} free tools — unlimited`, true],
      [`${AI_PRO_DAILY_LIMIT} AI generations every day`, true],
      [`All ${premiumCount} premium tools — unlimited`, true],
      ['Zero ads', true],
      ['Cancel anytime', true],
    ],
  },
]

export default function Premium() {
  useMeta('Pro Plans — OmniTools', `Upgrade for unlimited premium tools, ${AI_PRO_DAILY_LIMIT} daily AI generations and zero ads.`)

  const premiumTools = TOOLS.filter((t) => t.premium)

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto' }} className="page-enter">

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-1)',
          padding: 'var(--sp-1) var(--sp-3)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)', fontWeight: 600,
          background: 'var(--color-surface-sunken)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
        }}>
          <Crown size={12} /> Support the project
        </span>
        <h1 style={{
          marginTop: 'var(--sp-4)',
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-4xl)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}>Go Pro</h1>
        <p style={{
          marginTop: 'var(--sp-3)',
          maxWidth: '30rem',
          margin: 'var(--sp-3) auto 0',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
        }}>
          All {freeCount} base tools stay free. Pro unlocks unlimited {premiumCount} premium tools, {AI_PRO_DAILY_LIMIT} AI generations/day, and zero ads.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gap: 'var(--sp-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {PLANS.map((p) => (
          <div key={p.name} style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column',
            padding: 'var(--sp-8)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-surface)',
            border: p.highlight ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            boxShadow: p.highlight ? 'var(--shadow-lg)' : 'none',
          }}>
            {p.highlight && (
              <span style={{
                position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)',
                padding: 'var(--sp-1) var(--sp-3)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)', fontWeight: 700,
                background: 'var(--color-primary)',
                color: 'white',
              }}>Most popular</span>
            )}
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-lg)', fontWeight: 700,
            }}>{p.name}</h2>
            <div style={{ marginTop: 'var(--sp-3)', display: 'flex', alignItems: 'baseline', gap: 'var(--sp-1)' }}>
              <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{p.price}</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>{p.period}</span>
            </div>
            <p style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{p.blurb}</p>

            <ul style={{ marginTop: 'var(--sp-6)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', listStyle: 'none' }}>
              {p.features.map(([label, has]) => (
                <li key={label as string} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
                  fontSize: 'var(--text-sm)',
                  color: has ? 'var(--color-text)' : 'var(--color-text-tertiary)',
                }}>
                  {has ? <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> : <X size={16} style={{ flexShrink: 0, opacity: 0.4 }} />}
                  {label}
                </li>
              ))}
            </ul>

            {p.to ? (
              <a href={p.to as string} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', marginTop: 'var(--sp-6)' }}>
                <button className={p.highlight ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%' }}>
                  {p.cta}
                </button>
              </a>
            ) : p.highlight ? (
              <button disabled className="btn-primary" style={{ width: '100%', marginTop: 'var(--sp-6)', opacity: 0.5 }}>
                Checkout not live yet
              </button>
            ) : (
              <Link to="/" style={{ textDecoration: 'none', marginTop: 'var(--sp-6)' }}>
                <button className="btn-secondary" style={{ width: '100%' }}>{p.cta}</button>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Premium tools preview */}
      <div style={{
        marginTop: 'var(--sp-12)',
        padding: 'var(--sp-6)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-raised)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
          <Crown size={18} style={{ color: 'var(--color-warning)' }} />
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Premium tools included</h2>
        </div>
        <div style={{ display: 'grid', gap: 'var(--sp-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {premiumTools.map((t) => (
            <Link key={t.id} to={`/t/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-surface)',
                transition: 'border-color var(--duration-fast) var(--ease)',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
              >
                <t.icon size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                <div>
                  <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{t.name}</span>
                  <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{t.blurb}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
          Free users get {PREMIUM_DAILY_LIMIT} use/day per tool. Pro = unlimited.
        </p>
      </div>

      {!SITE.stripeLinks.pro && (
        <div role="status" style={{
          marginTop: 'var(--sp-6)',
          padding: 'var(--sp-3) var(--sp-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-warning)',
          background: 'var(--color-surface-sunken)',
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          Pro checkout isn't live yet. When payments are enabled, Pro will remove the daily use limits and
          unlock all {premiumCount} premium tools. Questions?{' '}
          <a href={`mailto:${SITE.contactEmail}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            Email us
          </a>.
        </div>
      )}

      <p style={{ marginTop: 'var(--sp-8)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
        Questions? <a href={`mailto:${SITE.contactEmail}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Email us</a>. Cancel anytime.
      </p>
    </div>
  )
}
