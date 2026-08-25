import { useState, type ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { callAi, aiUsesLeft } from '../lib/ai'
import { AI_FREE_DAILY_LIMIT, AI_PRO_DAILY_LIMIT } from '../lib/config'
import { CopyButton, ErrorNote, Spinner, TextArea } from '../components/ui'

const CONFIG_HELP = (
  <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
    <p className="font-semibold">AI isn't configured on this deployment yet.</p>
    <p className="mt-1">
      It runs on Cloudflare Workers AI's free tier. Add the <code>CLOUDFLARE_ACCOUNT_ID</code> and{' '}
      <code>CLOUDFLARE_AI_TOKEN</code> environment variables in your Cloudflare Pages settings — see the README for a
      2-minute walkthrough.
    </p>
  </div>
)

interface AiShellProps {
  controls?: ReactNode
  buildPrompt: (input: string) => { system: string; user: string }
  actionLabel: string
  placeholder: string
}

function AiShell({ controls, buildPrompt, actionLabel, placeholder }: AiShellProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [left, setLeft] = useState(aiUsesLeft())

  async function run() {
    if (!input.trim()) {
      setError('Enter some text first.')
      return
    }
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const p = buildPrompt(input)
      const res = await callAi({ ...p, maxTokens: 1200 })
      setOutput(res.text.trim())
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg === 'LIMIT_REACHED' ? '' : msg)
    } finally {
      setLoading(false)
      setLeft(aiUsesLeft())
    }
  }

  return (
    <div className="space-y-4">
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} className="min-h-40" />
      {controls}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={loading || left <= 0} onClick={run}>
          {loading ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Generating…' : actionLabel}
        </button>
        <span className="text-xs text-zinc-400">
          {left} free AI generation{left === 1 ? '' : 's'} left today (of {AI_FREE_DAILY_LIMIT})
        </span>
      </div>

      {error && !loading && (error.includes('not configured') || error.includes('503')) && CONFIG_HELP}
      {error && !loading && !(error.includes('not configured') || error.includes('503')) && <ErrorNote>{error}</ErrorNote>}
      {left <= 0 && !loading && !error.includes('not configured') && (
        <ErrorNote>
          You've used your {AI_FREE_DAILY_LIMIT === 1 ? 'free AI generation' : `${AI_FREE_DAILY_LIMIT} free AI generations`} for today — they reset at midnight. Need more right now?{' '}
          <a href="/premium" className="font-semibold underline">Upgrade to Pro</a> for {AI_PRO_DAILY_LIMIT} AI generations every day.
        </ErrorNote>
      )}

      {(output || loading) && (
        <div className="space-y-3">
          <div className="card whitespace-pre-wrap p-5 text-sm leading-relaxed">
            {loading ? (
              <span className="flex items-center gap-2 text-zinc-500"><Spinner className="h-4 w-4" /> Thinking…</span>
            ) : (
              output
            )}
          </div>
          {!loading && output && (
            <div className="flex gap-2">
              <CopyButton text={output} label="Copy result" className="btn-primary" />
              <button className="btn-secondary" onClick={run}>↻ Regenerate</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------------- Summarizer ---------------- */

export function AiSummarizer() {
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium')
  const [style, setStyle] = useState<'paragraph' | 'bullets'>('paragraph')

  return (
    <AiShell
      actionLabel="Summarize"
      placeholder="Paste an article, email, report or paper to summarize…"
      controls={
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="label">Length</span>
            <select className="input" value={length} onChange={(e) => setLength(e.target.value as typeof length)}>
              <option value="short">Short (1–2 sentences)</option>
              <option value="medium">Medium (short paragraph)</option>
              <option value="detailed">Detailed (key points)</option>
            </select>
          </div>
          <div>
            <span className="label">Format</span>
            <select className="input" value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
              <option value="paragraph">Paragraph</option>
              <option value="bullets">Bullet points</option>
            </select>
          </div>
        </div>
      }
      buildPrompt={(input) => ({
        system:
          'You are an expert summarizer. Produce clear, faithful summaries without inventing facts. Respond with only the summary.',
        user: `Summarize the following text as ${length === 'short' ? '1–2 crisp sentences' : length === 'medium' ? 'a short paragraph' : 'a detailed set of key points'}${style === 'bullets' ? ', formatted as markdown bullet points starting each line with "- "' : ''}:\n\n"""${input.slice(0, 12000)}"""`,
      })}
    />
  )
}

/* ---------------- Paraphraser ---------------- */

export function AiParaphraser() {
  const [tone, setTone] = useState('standard')
  return (
    <AiShell
      actionLabel="Paraphrase"
      placeholder="Paste the text you want rewritten…"
      controls={
        <div>
          <span className="label">Tone</span>
          <select className="input max-w-xs" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="standard">Standard</option>
            <option value="formal">Formal / professional</option>
            <option value="casual">Casual / friendly</option>
            <option value="concise">Concise (shorter)</option>
            <option value="simple">Simple English</option>
          </select>
        </div>
      }
      buildPrompt={(input) => ({
        system:
          'You are a skilled editor. Rewrite the given text in the requested tone while preserving its exact meaning. Keep roughly the same format. Respond with only the rewritten text.',
        user: `Paraphrase the following text in a ${tone} tone:\n\n"""${input.slice(0, 8000)}"""`,
      })}
    />
  )
}

/* ---------------- Blog Title Generator ---------------- */

export function AiTitleGenerator() {
  return (
    <AiShell
      actionLabel="Generate titles"
      placeholder="Enter your topic… e.g. home coffee brewing"
      controls={
        <p className="text-xs text-zinc-400">Tip: include the keyword you want to rank for. You'll get 10 varied, SEO-friendly headlines.</p>
      }
      buildPrompt={(input) => ({
        system: 'You are an SEO copywriter who writes clickable but honest blog headlines.',
        user: `Generate exactly 10 numbered, varied blog post titles about: "${input}". Mix listicles, how-tos, questions and year-based titles. Keep each under 65 characters where possible.`,
      })}
    />
  )
}

/* ---------------- Product Description Writer ---------------- */

export function AiProductDescription() {
  const [name, setName] = useState('')
  const [features, setFeatures] = useState('')
  const [tone, setTone] = useState('persuasive')

  return (
    <AiShell
      actionLabel="Write description"
      placeholder="Product features, one per line… e.g. 12-hour battery life"
      controls={
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="label">Product name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aurora Desk Lamp" />
          </div>
          <div>
            <span className="label">Tone</span>
            <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="persuasive">Persuasive</option>
              <option value="luxury">Luxury / premium</option>
              <option value="playful">Playful</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <span className="label">Key features</span>
            <TextArea value={features} onChange={(e) => setFeatures(e.target.value)} className="min-h-24" />
          </div>
        </div>
      }
      buildPrompt={() => ({
        system: 'You are an e-commerce conversion copywriter.',
        user: `Write a product description (~120 words) for "${name}" in a ${tone} tone. Features:\n${features}\n\nLead with benefits, weave in the features naturally, and end with a short call to action. Respond with only the description.`,
      })}
    />
  )
}
