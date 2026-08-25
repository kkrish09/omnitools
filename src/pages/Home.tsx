import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Crown, Search, Shield, Sparkles, Zap } from 'lucide-react'
import { CATEGORIES, TOOLS, searchTools, toolsByCategory, isPremiumTool } from '../lib/tools'
import { useMeta } from '../lib/utils'
import AdSlot from '../components/AdSlot'

const FAQS = [
  {
    q: 'Is OmniTools really free?',
    a: 'Yes — every tool is 100% free with no sign-up. Most tools are completely unlimited. Premium tools give free users 1 use per day; Pro ($6/month) unlocks unlimited access. The project is also open source under MIT.',
  },
  {
    q: 'Are my files uploaded to a server?',
    a: 'No. Every tool runs entirely inside your browser using Canvas, Web Crypto, and other Web APIs. Your code, data and files never leave your device.',
  },
  {
    q: 'What are premium tools?',
    a: 'Premium tools are advanced features like ER diagram builders, GraphQL schema editors, and CSS animation creators — the kind of tools developers normally pay $5-25/month for elsewhere. Free users get 1 use per day; Pro users get unlimited.',
  },
  {
    q: 'Can I self-host or contribute?',
    a: 'Yes — the entire project is MIT-licensed on GitHub. Clone it, run npm install && npm run dev, and start hacking. PRs welcome!',
  },
  {
    q: 'Can I use OmniTools on my phone?',
    a: 'Absolutely. The whole site is responsive and installable as an app (PWA) from your browser menu.',
  },
]

export default function Home() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const results = q ? searchTools(q) : null
  useMeta(
    q ? `Search: ${q} — OmniTools` : `OmniTools — ${TOOLS.length} Free Developer Tools`,
    'Everything a developer needs: JSON formatter, YAML/CSV converter, regex tester, JWT decoder, ER diagrams, GraphQL builder and more. All client-side, zero uploads.',
  )

  const freeTools = TOOLS.filter((t) => !t.premium)
  const premiumTools = TOOLS.filter((t) => t.premium)

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-16 text-center text-white dark:border-zinc-800">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Everything a dev needs.<br />
          <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">{TOOLS.length} free tools.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-indigo-100">
          Format JSON, build ER diagrams, design APIs, generate UUIDs, test regex, create CSS animations and more —
          fast, private and mostly free. Nothing leaves your browser.
        </p>
        <form
          action="/"
          className="relative mx-auto mt-8 max-w-md"
          onSubmit={(e) => e.preventDefault()}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search for a tool… e.g. regex, yaml, erd"
            className="w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-zinc-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            onChange={(e) => {
              const url = new URL(window.location.href)
              if (e.target.value) url.searchParams.set('q', e.target.value)
              else url.searchParams.delete('q')
              window.history.replaceState(null, '', url)
            }}
          />
        </form>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-indigo-100">
          <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-300" /> {TOOLS.length} tools</span>
          <span className="flex items-center gap-1.5"><Crown className="h-4 w-4 text-amber-300" /> {premiumTools.length} premium tools</span>
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-300" /> Nothing leaves your browser</span>
          <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-pink-300" /> Open source (MIT)</span>
        </div>
      </section>

      <AdSlot slot="1111111111" className="min-h-[90px]" />

      {results ? (
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            {results.length} result{results.length === 1 ? '' : 's'} for "{q}"
          </h2>
          {results.length === 0 ? (
            <p className="text-zinc-500">
              Nothing found. Try "json", "regex", "jwt", "erd", or{' '}
              <Link to="/" className="text-indigo-500 underline">browse all tools</Link>.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((t) => (
                <Link key={t.id} to={`/t/${t.id}`} className="card group p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700">
                  <div className="flex items-center gap-2">
                    <t.icon className="h-7 w-7 text-indigo-500" />
                    {t.premium && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">PRO</span>}
                  </div>
                  <h3 className="mt-3 font-semibold group-hover:text-indigo-500">{t.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t.blurb}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Categories */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">Browse by category</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to={`/c/${c.id}`}
                  className="card group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white`}>
                    <c.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-semibold group-hover:text-indigo-500">{c.label}</h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{toolsByCategory(c.id).length} tools · {c.tagline}</p>
                  {c.id === 'premium' && <span className="absolute right-4 top-5 text-amber-500"><Crown className="h-4 w-4" /></span>}
                  <ArrowRight className="absolute right-4 top-5 h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-zinc-600" />
                </Link>
              ))}
            </div>
          </section>

          {/* Premium tools highlight */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Crown className="h-6 w-6 text-amber-500" />
              <h2 className="text-2xl font-bold">Premium Tools</h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">1 free use/day</span>
            </div>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">Advanced tools developers normally pay $5-25/month for. Free users get 1 use per day; Pro gets unlimited.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {premiumTools.map((t) => (
                <Link key={t.id} to={`/t/${t.id}`} className="card group border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30">
                  <div className="flex items-center gap-2">
                    <t.icon className="h-6 w-6 text-amber-600" />
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <h3 className="mt-3 font-semibold group-hover:text-amber-600">{t.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t.blurb}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* All tools */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">All {TOOLS.length} tools</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {searchTools('').map((t) => {
                const cat = CATEGORIES.find((c) => c.id === t.category)!
                return (
                  <Link key={t.id} to={`/t/${t.id}`} className="card group flex items-start gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700">
                    <span className={`shrink-0 rounded-lg bg-gradient-to-br p-2 text-white ${cat.gradient}`}>
                      <t.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="block font-semibold group-hover:text-indigo-500">{t.name}</span>
                        {t.premium && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">PRO</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">{t.blurb}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* FAQ */}
          <section className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-2xl font-bold">Frequently asked questions</h2>
            <div className="space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="card group p-5 open:border-indigo-300 dark:open:border-indigo-700">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    <span className="mr-2 inline-block text-indigo-500 transition-transform group-open:rotate-90">›</span>
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* FAQ structured data for search engines */}
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
          <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-10 text-center dark:border-amber-800 dark:from-amber-950/40 dark:to-orange-950/40">
            <Crown className="mx-auto h-8 w-8 text-amber-500" />
            <h2 className="mt-3 text-2xl font-bold">Need more than 1 use/day?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-300">
              Pro gives you <strong>unlimited access</strong> to all {premiumTools.length} premium tools, {100} AI generations per day, and zero ads — from $6/month.
            </p>
            <Link to="/premium" className="btn-primary mt-5 bg-amber-600 hover:bg-amber-500">See plans</Link>
          </section>
        </>
      )}
    </div>
  )
}
