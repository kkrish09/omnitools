import { Suspense, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCategory, getTool, toolsByCategory } from '../lib/tools'
import { TOOL_COMPONENTS } from '../lib/toolComponents'
import { useMeta } from '../lib/utils'
import AdSlot from '../components/AdSlot'
import ErrorBoundary from '../components/ErrorBoundary'
import { Spinner } from '../components/ui'
import { NotFound } from './StaticPages'

const STEPS: Record<string, [string, string, string]> = {
  pdf: ['Drop your files', 'They are processed privately in your browser', 'Download the result instantly'],
  image: ['Upload or drop your image', 'Adjust the settings to taste', 'Download the processed file'],
  text: ['Paste or type your text', 'See live results as you type', 'Copy the output anywhere'],
  design: ['Pick a starting color or style', 'Tweak until it looks perfect', 'Copy the CSS or values'],
  dev: ['Provide your input', 'The tool works locally in your browser', 'Copy or download the output'],
  calc: ['Enter your numbers', 'Results update instantly', 'Nothing is stored or sent anywhere'],
  ai: ['Describe what you need', 'AI generates the result in seconds', 'Copy and refine as you like'],
}

export default function ToolPage() {
  const { id } = useParams()
  const tool = getTool(id ?? '')
  useMeta(
    tool ? `${tool.name} — Free Online Tool | OmniTools` : 'Not found — OmniTools',
    tool ? `${tool.blurb} 100% free, no sign-up required.` : undefined,
  )

  const Component = useMemo(() => (tool ? TOOL_COMPONENTS[tool.id] : undefined), [tool])

  if (!tool || !Component) return <NotFound />
  const category = getCategory(tool.category)!
  const related = toolsByCategory(tool.category).filter((t) => t.id !== tool.id).slice(0, 4)
  const steps = STEPS[tool.category]

  return (
    <div>
      <nav className="mb-4 text-sm text-zinc-500">
        <Link to="/" className="hover:text-indigo-500">Home</Link> /{' '}
        <Link to={`/c/${category.id}`} className="hover:text-indigo-500">{category.label}</Link> /{' '}
        <span className="text-zinc-400">{tool.name}</span>
      </nav>

      <div className="mb-6 flex items-start gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} text-white`}>
          <tool.icon className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{tool.name}</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{tool.blurb}</p>
        </div>
      </div>

      <AdSlot slot="2222222222" format="horizontal" className="mb-6 min-h-[90px]" />

      <Suspense
        fallback={
          <div className="card flex items-center justify-center gap-3 p-16 text-zinc-500">
            <Spinner /> Loading tool…
          </div>
        }
      >
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: `${tool.name} — OmniTools`,
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any (web browser)',
            url: `https://omnitoolsapp.pages.dev/t/${tool.id}`,
            description: tool.blurb,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
    />

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s} className="card p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              {i + 1}
            </span>
            <p className="mt-3 text-sm font-medium">{s}</p>
          </div>
        ))}
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">More {category.label.toLowerCase()}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => (
              <Link key={t.id} to={`/t/${t.id}`} className="card group p-4 transition-all hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700">
                <t.icon className="h-5 w-5 text-indigo-500" />
                <span className="mt-2 block text-sm font-semibold group-hover:text-indigo-500">{t.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
