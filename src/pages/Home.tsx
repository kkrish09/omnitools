import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Crown, Shield, Sparkles, Zap } from 'lucide-react'
import { GridList, GridListItem, Button, Link as AriaLink, TagGroup, Tag, TooltipTrigger, Tooltip } from 'react-aria-components'
import { CATEGORIES, TOOLS, searchTools, toolsByCategory, isPremiumTool } from '../lib/tools'
import { useMeta } from '../lib/utils'
import { FaqItem, ToastRegionWrapper, Divider, BreadcrumbNav, SearchInput } from '../components/rac'
import AdSlot from '../components/AdSlot'

const FAQS = [
  { q: 'Is OmniTools really free?', a: 'Yes — every tool is 100% free with no sign-up. Most tools are completely unlimited. Premium tools give free users 1 use per day; Pro ($6/month) unlocks unlimited access. The project is also open source under MIT.' },
  { q: 'Are my files uploaded to a server?', a: 'No. Every tool runs entirely inside your browser using Canvas, Web Crypto, and other Web APIs. Your code, data and files never leave your device.' },
  { q: 'What are premium tools?', a: 'Premium tools are advanced features like ER diagram builders, GraphQL schema editors, and CSS animation creators — the kind of tools developers normally pay $5-25/month for elsewhere. Free users get 1 use per day; Pro users get unlimited.' },
  { q: 'Can I self-host or contribute?', a: 'Yes — the entire project is MIT-licensed on GitHub. Clone it, run npm install && npm run dev, and start hacking. PRs welcome!' },
  { q: 'Can I use OmniTools on my phone?', a: 'Absolutely. The whole site is responsive and installable as an app (PWA) from your browser menu.' },
]

export default function Home() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const results = q ? searchTools(q) : null
  useMeta(
    q ? `Search: ${q} — OmniTools` : `OmniTools — ${TOOLS.length} Free Developer Tools`,
    'Everything a developer needs: JSON formatter, YAML/CSV converter, regex tester, ER diagrams, GraphQL builder and more. All client-side, zero uploads.',
  )

  const freeTools = TOOLS.filter((t) => !t.premium)
  const premiumTools = TOOLS.filter((t) => t.premium)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-16)' }}>
      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--accent-6), #7c3aed, #a855f7)',
        padding: 'var(--sp-16) var(--sp-6)',
        textAlign: 'center', color: 'white',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '-5rem', top: '-5rem', width: '16rem', height: '16rem', borderRadius: '50%', background: 'rgba(255,255,255,.08)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', right: '-4rem', bottom: '-6rem', width: '18rem', height: '18rem', borderRadius: '50%', background: 'rgba(236,72,153,.15)', filter: 'blur(60px)' }} />
        </div>
        <h1 style={{ maxWidth: '40rem', margin: '0 auto', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Everything a dev needs.<br />
          <span style={{ background: 'linear-gradient(to right, #fcd34d, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {TOOLS.length} free tools.
          </span>
        </h1>
        <p style={{ maxWidth: '36rem', margin: 'var(--sp-4) auto 0', color: 'rgba(255,255,255,.8)', fontSize: 'var(--text-base)', lineHeight: 1.7 }}>
          Format JSON, build ER diagrams, design APIs, generate UUIDs, test regex, create CSS animations and more —
          fast, private and mostly free. Nothing leaves your browser.
        </p>
        <div style={{ position: 'relative', maxWidth: '28rem', margin: 'var(--sp-8) auto 0' }}>
          <SearchInput
            placeholder="Search for a tool… e.g. regex, yaml, erd"
            value={q}
            onChange={(v: string) => {
              const url = new URL(window.location.href)
              if (v) url.searchParams.set('q', v)
              else url.searchParams.delete('q')
              window.history.replaceState(null, '', url)
            }}
            onSubmit={(v: string) => window.location.href = `/?q=${encodeURIComponent(v)}`}
            aria-label="Search tools"
          />
        </div>
        <div style={{
          marginTop: 'var(--sp-6)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
          gap: 'var(--sp-6)',
          fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,.8)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}><Zap size={16} style={{ color: '#fcd34d' }} /> {TOOLS.length} tools</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}><Crown size={16} style={{ color: '#fcd34d' }} /> {premiumTools.length} premium</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}><Shield size={16} style={{ color: '#6ee7b7' }} /> Nothing leaves your browser</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}><Sparkles size={16} style={{ color: '#f9a8d4' }} /> Open source (MIT)</span>
        </div>
      </section>

      <AdSlot slot="1111111111" className="min-h-[90px]" />

      {results ? (
        <section>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--sp-6)' }}>
            {results.length} result{results.length === 1 ? '' : 's'} for "{q}"
          </h2>
          {results.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Nothing found. Try "json", "regex", "jwt", "erd", or{' '}
              <Link to="/" style={{ color: 'var(--accent-5)', textDecoration: 'underline' }}>browse all tools</Link>.
            </p>
          ) : (
            <GridList aria-label="Search results" style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {results.map((t) => (
                <GridListItem key={t.id} id={t.id}>
                  <Link to={`/t/${t.id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', transition: 'all 200ms ease', transform: 'translateY(0)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      <t.icon size={28} style={{ color: 'var(--accent-5)' }} />
                      {t.premium && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: 700 }}>PRO</span>}
                    </div>
                    <h3 style={{ marginTop: 'var(--sp-3)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</h3>
                    <p style={{ marginTop: 'var(--sp-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{t.blurb}</p>
                  </Link>
                </GridListItem>
              ))}
            </GridList>
          )}
        </section>
      ) : (
        <>
          {/* Categories */}
          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--sp-6)' }}>Browse by category</h2>
            <GridList aria-label="Categories" style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {CATEGORIES.map((c) => (
                <GridListItem key={c.id} id={c.id}>
                  <Link to={`/c/${c.id}`} className="card" style={{
                    display: 'block', textDecoration: 'none', color: 'inherit',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-lg)',
                      background: `linear-gradient(135deg, ${c.gradient.replace(',', ', ')})`,
                      color: 'white', marginBottom: 'var(--sp-3)',
                    }}>
                      <c.icon size={20} />
                    </span>
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{c.label}</h3>
                    <p style={{ marginTop: 'var(--sp-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {toolsByCategory(c.id).length} tools · {c.tagline}
                    </p>
                    <ArrowRight size={16} style={{ position: 'absolute', right: 'var(--sp-4)', top: 'var(--sp-5)', color: 'var(--text-tertiary)' }} />
                  </Link>
                </GridListItem>
              ))}
            </GridList>
          </section>

          {/* Premium tools */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
              <Crown size={24} style={{ color: '#f59e0b' }} />
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Premium Tools</h2>
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>1 free use/day</span>
            </div>
            <p style={{ marginBottom: 'var(--sp-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Advanced tools developers normally pay $5-25/month for elsewhere. Free users get 1 use per day; Pro gets unlimited.
            </p>
            <GridList aria-label="Premium tools" style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {premiumTools.map((t) => (
                <GridListItem key={t.id} id={t.id}>
                  <Link to={`/t/${t.id}`} className="card" style={{
                    display: 'block', textDecoration: 'none', color: 'inherit',
                    borderColor: '#fbbf24', background: 'linear-gradient(to bottom right, #fffbeb, #fff7ed)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      <t.icon size={24} style={{ color: '#d97706' }} />
                      <Crown size={14} style={{ color: '#fbbf24' }} />
                    </div>
                    <h3 style={{ marginTop: 'var(--sp-3)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</h3>
                    <p style={{ marginTop: 'var(--sp-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{t.blurb}</p>
                  </Link>
                </GridListItem>
              ))}
            </GridList>
          </section>

          {/* All tools */}
          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--sp-6)' }}>All {TOOLS.length} tools</h2>
            <GridList aria-label="All tools" style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {searchTools('').map((t) => {
                const cat = CATEGORIES.find((c) => c.id === t.category)!
                return (
                  <GridListItem key={t.id} id={t.id}>
                    <Link to={`/t/${t.id}`} className="card" style={{ display: 'flex', gap: 'var(--sp-4)', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)',
                        background: `linear-gradient(135deg, ${cat.gradient.replace(',', ', ')})`, color: 'white',
                      }}>
                        <t.icon size={18} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</span>
                          {t.premium && <span style={{ background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '9px', fontWeight: 700 }}>PRO</span>}
                        </span>
                        <span style={{ display: 'block', marginTop: '2px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{t.blurb}</span>
                      </span>
                    </Link>
                  </GridListItem>
                )
              })}
            </GridList>
          </section>

          {/* FAQ */}
          <section style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--sp-6)', textAlign: 'center' }}>Frequently asked questions</h2>
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

          {/* Premium CTA */}
          <section style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #fbbf24',
            background: 'linear-gradient(to bottom right, #fffbeb, #fff7ed)',
            padding: 'var(--sp-10)', textAlign: 'center',
          }}>
            <Crown size={32} style={{ color: '#f59e0b', margin: '0 auto var(--sp-3)' }} />
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Need more than 1 use/day?</h2>
            <p style={{ maxWidth: '28rem', margin: 'var(--sp-2) auto 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Pro gives you <strong>unlimited access</strong> to all {premiumTools.length} premium tools, {100} AI generations per day, and zero ads — from $6/month.
            </p>
            <Link to="/premium" style={{ textDecoration: 'none', marginTop: 'var(--sp-5)', display: 'inline-block' }}>
              <Button data-variant="primary" style={{ background: '#d97706', borderColor: '#d97706' }}>See plans</Button>
            </Link>
          </section>
        </>
      )}
    </div>
  )
}
