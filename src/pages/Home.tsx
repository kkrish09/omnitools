import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search, Shield, Sparkles, Zap } from 'lucide-react'
import { CATEGORIES, TOOLS, searchTools, toolsByCategory } from '../lib/tools'
import { useMeta } from '../lib/utils'
import AdSlot from '../components/AdSlot'

const FAQS = [
  {
    q: 'Is OmniTools really free?',
    a: 'Yes — every tool on this site is 100% free with no sign-up. The project is supported by ads and an optional Pro plan for power users.',
  },
  {
    q: 'Are my files uploaded to a server?',
    a: 'No. All PDF, image, text and developer tools run entirely inside your browser using modern web technology. Your files never leave your device.',
  },
  {
    q: 'How do the AI tools work?',
    a: 'AI tools send your prompt to a serverless AI endpoint and return the result. Free users get 1 AI generation per day; Pro gets 200 per day.',
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
    q ? `Search: ${q} — OmniTools` : 'OmniTools — 30 Free Online Tools: PDF, Image, Text, AI & More',
    'Every tool you need in one place: merge & split PDFs, compress images, generate QR codes, count words and use free AI writing tools. No sign-up required.',
  )

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-16 text-center text-white dark:border-zinc-800">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Every tool you need.<br />
          <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">One free website.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-indigo-100">
          Merge PDFs, compress images, generate QR codes, count words, convert units and create content with AI — fast,
          private and completely free.
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
            placeholder="Search for a tool… e.g. merge pdf"
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
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-300" /> Files never leave your device</span>
          <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-pink-300" /> Free AI included</span>
        </div>
      </section>

      <AdSlot slot="1111111111" className="min-h-[90px]" />

      {results ? (
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            {results.length} result{results.length === 1 ? '' : 's'} for “{q}”
          </h2>
          {results.length === 0 ? (
            <p className="text-zinc-500">
              Nothing found. Try “pdf”, “image”, “qr”, “password”, or{' '}
              <Link to="/" className="text-indigo-500 underline">browse all tools</Link>.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((t) => (
                <Link key={t.id} to={`/t/${t.id}`} className="card group p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700">
                  <t.icon className="h-7 w-7 text-indigo-500" />
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
                  <ArrowRight className="absolute right-4 top-5 h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-zinc-600" />
                </Link>
              ))}
            </div>
          </section>

          {/* All tools */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">All tools</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {searchTools('').map((t) => {
                const cat = CATEGORIES.find((c) => c.id === t.category)!
                return (
                  <Link key={t.id} to={`/t/${t.id}`} className="card group flex items-start gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700">
                    <span className={`shrink-0 rounded-lg bg-gradient-to-br p-2 text-white ${cat.gradient}`}>
                      <t.icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold group-hover:text-indigo-500">{t.name}</span>
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
          <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-10 text-center dark:border-indigo-900 dark:from-indigo-950/40 dark:to-violet-950/40">
            <Sparkles className="mx-auto h-8 w-8 text-indigo-500" />
            <h2 className="mt-3 text-2xl font-bold">Love the free tools? Go Pro.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-300">
              Unlimited browser tools stay free forever. Pro adds 200 daily AI generations, batch processing and zero ads — from $6/month.
            </p>
            <Link to="/premium" className="btn-primary mt-5">See plans</Link>
          </section>
        </>
      )}
    </div>
  )
}
