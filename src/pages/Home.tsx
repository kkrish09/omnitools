import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Crown, Shield, Sparkles, Zap } from 'lucide-react'
import { GridList, GridListItem, Button, Link as AriaLink } from 'react-aria-components'
import { CATEGORIES, TOOLS, searchTools, toolsByCategory } from '../lib/tools'
import { SITE } from '../lib/config'
import { useMeta } from '../lib/utils'
import { FaqItem } from '../components/rac'
import AdSlot from '../components/AdSlot'

const FAQS = [
  { q: 'Is this actually free?', a: 'Yes. All browser tools are free, no sign-up. Premium tools give free users 1 use/day; Pro ($6/mo) unlocks everything.' },
  { q: 'Do my files get uploaded?', a: 'No. Everything runs in your browser. We literally cannot see your files.' },
  { q: 'What are premium tools?', a: 'ER diagram builders, GraphQL schema editors, CSS animation tools — stuff devs usually pay $5-25/mo for elsewhere.' },
  { q: 'Can I self-host?', a: 'Yep. MIT licensed on GitHub. Clone, npm install, npm run dev.' },
]

export default function Home() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const results = q ? searchTools(q) : null
  const premiumCount = TOOLS.filter((t) => t.premium).length

  useMeta(
    q ? `Search: ${q} — ${SITE.name}` : `${SITE.name} — ${TOOLS.length} Developer Tools`,
    SITE.description,
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-16)' }} className="page-enter">

      {/* ===== HERO — dark, minimal, specific ===== */}
      <section style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--color-bg-dark)',
        padding: 'var(--sp-20) var(--sp-6)',
        textAlign: 'center',
        color: 'white',
        overflow: 'hidden',
      }}>
        <h1 style={{
          maxWidth: '42rem',
          margin: '0 auto',
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          JSON broken? Regex confusing?<br />
          <span style={{ color: 'var(--accent-4)' }}>
            41 tools that actually work.
          </span>
        </h1>
        <p style={{
          maxWidth: '32rem',
          margin: 'var(--sp-4) auto 0',
          color: 'rgba(255,255,255,.6)',
          fontSize: 'var(--text-base)',
          lineHeight: 1.6,
        }}>
          No signup. No file uploads. Everything runs in your browser.
        </p>
        <div style={{ marginTop: 'var(--sp-8)', display: 'flex', justifyContent: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <a href="#categories">
            <Button data-variant="primary" style={{ background: 'white', color: 'var(--color-bg-dark)', borderColor: 'white', fontWeight: 600 }}>
              Browse tools
            </Button>
          </a>
          <Link to="/premium" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,.2)', color: 'rgba(255,255,255,.8)', background: 'transparent' }}>
              See Pro plans
            </button>
          </Link>
        </div>
        <div style={{
          marginTop: 'var(--sp-10)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
          gap: 'var(--sp-6)',
          fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,.4)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}><Zap size={13} /> {TOOLS.length} tools</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}><Crown size={13} /> {premiumCount} premium</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}><Shield size={13} /> Files stay on your device</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}><Sparkles size={13} /> Open source (MIT)</span>
        </div>
      </section>

      <AdSlot slot="1111111111" className="min-h-[90px]" />

      {/* ===== SEARCH RESULTS (when query present) ===== */}
      {results ? (
        <section>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--sp-6)' }}>
            {results.length} result{results.length === 1 ? '' : 's'} for "{q}"
          </h2>
          {results.length === 0 ? (
            <div style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-4)' }}>
                No tools match that. Try one of these:
              </p>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['json', 'regex', 'uuid', 'qr', 'color', 'jwt', 'base64', 'yaml'].map((s) => (
                  <Link key={s} to={`/?q=${s}`} style={{ textDecoration: 'none' }}>
                    <span style={{
                      padding: 'var(--sp-1) var(--sp-3)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                      background: 'var(--color-surface-sunken)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                    }}>{s}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <GridList aria-label="Search results" style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {results.map((t) => (
                <GridListItem key={t.id} id={t.id}>
                  <Link to={`/t/${t.id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      <t.icon size={20} style={{ color: 'var(--color-primary)' }} />
                      {t.premium && <span style={{ background: 'var(--color-warning)', color: '#000', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '9px', fontWeight: 700 }}>PRO</span>}
                    </div>
                    <h3 style={{ marginTop: 'var(--sp-3)', fontWeight: 600, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-heading)' }}>{t.name}</h3>
                    <p style={{ marginTop: 'var(--sp-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{t.blurb}</p>
                  </Link>
                </GridListItem>
              ))}
            </GridList>
          )}
        </section>
      ) : (
        <>
          {/* ===== CATEGORIES — primary navigation ===== */}
          <section id="categories">
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>Browse by category</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-8)' }}>
              Pick a category to see its tools.
            </p>
            <GridList aria-label="Categories" style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {CATEGORIES.map((c) => {
                const count = toolsByCategory(c.id).length
                return (
                  <GridListItem key={c.id} id={c.id}>
                    <Link to={`/c/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--sp-3)',
                        minHeight: '140px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {/* Colored accent strip */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: c.gradient,
                        }} />
                        {/* Icon */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: 'var(--radius-md)',
                          background: `${c.gradient}18`,
                          color: c.gradient,
                        }}>
                          <c.icon size={20} className="category-icon" />
                        </span>
                        {/* Text */}
                        <div>
                          <h3 style={{
                            fontWeight: 700,
                            fontSize: 'var(--text-base)',
                            fontFamily: 'var(--font-heading)',
                            marginBottom: 'var(--sp-1)',
                          }}>{c.label}</h3>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            {count} tool{count !== 1 ? 's' : ''} — {c.tagline}
                          </p>
                        </div>
                        <ArrowRight size={14} style={{ position: 'absolute', right: 'var(--sp-4)', top: 'var(--sp-5)', color: 'var(--color-text-tertiary)' }} />
                      </div>
                    </Link>
                  </GridListItem>
                )
              })}
            </GridList>
          </section>

          {/* ===== PREMIUM — small inline mention, not a section ===== */}
          <section style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-warning)',
            padding: 'var(--sp-6) var(--sp-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--sp-4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <Crown size={20} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Need more?</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginLeft: 'var(--sp-2)' }}>
                  Pro gives unlimited access to {premiumCount} advanced tools and 100 AI generations/day.
                </span>
              </div>
            </div>
            <Link to="/premium" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Button data-variant="primary" style={{ fontSize: 'var(--text-xs)', padding: 'var(--sp-1) var(--sp-4)' }}>
                See plans →
              </Button>
            </Link>
          </section>

          {/* ===== FAQ — compact, bottom ===== */}
          <section style={{ maxWidth: '40rem', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--sp-6)', textAlign: 'center' }}>FAQ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {FAQS.map((f) => <FaqItem key={f.q} question={f.q} answer={f.a} />)}
            </div>
          </section>

          {/* FAQ structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: FAQS.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              }),
            }}
          />
        </>
      )}
    </div>
  )
}
