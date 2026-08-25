import { Suspense, useEffect, useMemo, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Crown, Lock, Zap, LogIn } from 'lucide-react'
import { getCategory, getTool, isPremiumTool, toolsByCategory } from '../lib/tools'
import { TOOL_COMPONENTS } from '../lib/toolComponents'
import { useMeta } from '../lib/utils'
import { useAuth } from '../lib/auth'
import { useServerUsage } from '../lib/usage'
import AdSlot from '../components/AdSlot'
import ErrorBoundary from '../components/ErrorBoundary'
import { Spinner } from '../components/ui'
import { NotFound } from './StaticPages'

const STEPS: Record<string, [string, string, string]> = {
  code: ['Provide your input', 'The tool works locally in your browser', 'Copy or download the output'],
  encode: ['Paste or drop your data', 'Encode or decode instantly', 'Copy the result'],
  generate: ['Configure your options', 'Generate with one click', 'Copy or download the output'],
  devref: ['Enter your values', 'Results update in real-time', 'Copy or save the output'],
  design: ['Pick a starting color or style', 'Tweak until it looks perfect', 'Copy the CSS or values'],
  premium: ['Provide your input', 'Click Generate to process', 'Copy or download the output'],
  text: ['Paste or type your text', 'See live results as you type', 'Copy the output anywhere'],
}

function AuthRequiredGate() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
        <LogIn className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-extrabold">Account required</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        This is a premium tool. Create a free account to use it (1 use/day) or go Pro for unlimited access.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link to="/signup" className="btn-primary">Create free account</Link>
        <Link to="/login" className="btn-secondary">Already have an account? Log in</Link>
      </div>
    </div>
  )
}

function PremiumGate({ onUse, usesLeft }: { onUse: () => void; usesLeft: number }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
        <Lock className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-extrabold">Premium Tool</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Free accounts get <strong>1 use per day</strong>. Pro users get <strong>unlimited access</strong>.
      </p>
      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Uses remaining today: {usesLeft}</p>
      <div className="mt-6 flex flex-col gap-3">
        <button onClick={onUse} className="btn-primary bg-amber-600 hover:bg-amber-500">
          <Zap className="h-4 w-4" /> Use free (1/day)
        </button>
        <Link to="/premium" className="btn-secondary">
          <Crown className="h-4 w-4" /> Get Pro — unlimited
        </Link>
      </div>
    </div>
  )
}

export default function ToolPage() {
  const { id } = useParams()
  const tool = getTool(id ?? '')
  useMeta(
    tool ? `${tool.name} — Free Online Tool | OmniTools` : 'Not found — OmniTools',
    tool ? `${tool.blurb} 100% free, no sign-up required.` : undefined,
  )

  const Component = useMemo(() => (tool ? TOOL_COMPONENTS[tool.id] : undefined), [tool])
  const premium = isPremiumTool(tool?.id ?? '')
  const { user, loading: authLoading } = useAuth()
  const { usesLeft, isPro, loading: usageLoading, check, record } = useServerUsage('premium')

  // Load usage for premium tools
  useEffect(() => {
    if (premium && user) check()
  }, [premium, user, check])

  const hasAccount = !!user
  const hasAccess = !premium || (hasAccount && (isPro || (usesLeft !== null && usesLeft > 0)))

  const handleUse = useCallback(async () => {
    const ok = await record()
    // Access granted — component will render on next re-render
  }, [record])

  if (!tool || !Component) return <NotFound />
  const category = getCategory(tool.category)!
  const related = toolsByCategory(tool.category).filter((t) => t.id !== tool.id).slice(0, 4)
  const steps = STEPS[tool.category] || STEPS.code

  // Loading state
  if (premium && (authLoading || usageLoading)) {
    return (
      <div className="card flex items-center justify-center gap-3 p-16 text-zinc-500">
        <Spinner /> Checking access…
      </div>
    )
  }

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
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">{tool.name}</h1>
            {premium && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300"><Crown className="h-3 w-3" /> Premium</span>}
          </div>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{tool.blurb}</p>
        </div>
      </div>

      <AdSlot slot="2222222222" format="horizontal" className="mb-6 min-h-[90px]" />

      {premium && !hasAccount ? (
        <AuthRequiredGate />
      ) : premium && !hasAccess ? (
        <PremiumGate onUse={handleUse} usesLeft={usesLeft ?? 0} />
      ) : (
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
      )}

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
            offers: { '@type': 'Offer', price: premium ? '6' : '0', priceCurrency: 'USD' },
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
                {isPremiumTool(t.id) && <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">PRO</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
