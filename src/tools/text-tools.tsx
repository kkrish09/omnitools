import { useMemo, useState } from 'react'
import { copyText } from '../lib/utils'
import { CopyButton, Stat, TextArea } from '../components/ui'

/* ---------------- Word Counter ---------------- */

const STOPWORDS = new Set('the a an and or but if then else for to of in on at by with from as is are was were be been being it its this that these those you your we our they their he she his her i me my not no do does did have has had will would can could should about into over after under more most some such only than also very just'.split(' '))

export function WordCounter() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/) : []
    const sentences = (text.match(/[.!?]+(\s|$)/g) ?? []).length
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length
    const counts = new Map<string, number>()
    for (const w of words) {
      const k = w.toLowerCase().replace(/[^a-z0-9']/g, '')
      if (k.length >= 3 && !STOPWORDS.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1)
    }
    const keywords = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    return {
      words: words.length,
      chars: text.length,
      noSpaces: text.replace(/\s/g, '').length,
      sentences,
      paragraphs,
      readMin: Math.max(words.length ? 1 : 0, Math.round(words.length / 200)),
      speakMin: Math.max(words.length ? 1 : 0, Math.round(words.length / 130)),
      keywords,
    }
  }, [text])

  return (
    <div className="space-y-4">
      <TextArea value={text} onChange={(e) => setText(e.target.value)} placeholder="Start typing or paste your text…" className="min-h-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Words" value={stats.words.toLocaleString()} />
        <Stat label="Characters" value={stats.chars.toLocaleString()} />
        <Stat label="No spaces" value={stats.noSpaces.toLocaleString()} />
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Paragraphs" value={stats.paragraphs} />
        <Stat label="Reading time" value={`${stats.readMin} min`} />
        <Stat label="Speaking time" value={`${stats.speakMin} min`} />
        <Stat label="Avg word len" value={stats.words ? (stats.noSpaces / stats.words).toFixed(1) : '0'} />
      </div>
      {stats.keywords.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold">Top keywords</h3>
          <div className="flex flex-wrap gap-2">
            {stats.keywords.map(([word, count]) => (
              <span key={word} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                {word} · {count} ({Math.round((count / Math.max(1, stats.words)) * 100)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Case Converter ---------------- */

function wordize(s: string): string[] {
  return s.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^a-zA-Z0-9]+/).filter(Boolean)
}

const CASES: { label: string; fn: (s: string) => string }[] = [
  { label: 'UPPERCASE', fn: (s) => s.toUpperCase() },
  { label: 'lowercase', fn: (s) => s.toLowerCase() },
  { label: 'Title Case', fn: (s) => s.toLowerCase().replace(/\w\S*/g, (w) => w[0]!.toUpperCase() + w.slice(1)) },
  {
    label: 'Sentence case',
    fn: (s) =>
      s.toLowerCase().replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase()),
  },
  { label: 'camelCase', fn: (s) => wordize(s).map((w, i) => (i === 0 ? w.toLowerCase() : w[0]!.toUpperCase() + w.slice(1).toLowerCase())).join('') },
  { label: 'PascalCase', fn: (s) => wordize(s).map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join('') },
  { label: 'snake_case', fn: (s) => wordize(s).map((w) => w.toLowerCase()).join('_') },
  { label: 'kebab-case', fn: (s) => wordize(s).map((w) => w.toLowerCase()).join('-') },
  { label: 'CONSTANT_CASE', fn: (s) => wordize(s).map((w) => w.toUpperCase()).join('_') },
  { label: 'aLtErNaTiNg', fn: (s) => [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join('') },
  {
    label: 'iNVERSE cASE',
    fn: (s) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
  },
]

export function CaseConverter() {
  const [text, setText] = useState('')
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <TextArea value={text} onChange={(e) => { setText(e.target.value); setActive(null) }} placeholder="Type or paste text…" className="min-h-32" />
      <div className="flex flex-wrap gap-2">
        {CASES.map((c, i) => (
          <button
            key={c.label}
            className={active === i ? 'btn-primary px-3 py-1.5' : 'btn-secondary px-3 py-1.5'}
            onClick={() => { setText(c.fn(text)); setActive(i) }}
          >
            {c.label}
          </button>
        ))}
      </div>
      {text && (
        <div className="space-y-3">
          <TextArea readOnly value={text} className="min-h-32 bg-zinc-50 dark:bg-zinc-800" onFocus={(e) => e.currentTarget.select()} />
          <CopyButton text={text} label="Copy result" className="btn-primary" />
        </div>
      )}
    </div>
  )
}

/* ---------------- Text Diff Checker ---------------- */

type DiffLine = { t: 'same' | 'add' | 'del'; s: string }

function diffLines(a: string[], b: string[]): DiffLine[] {
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1]! + 1 : Math.max(dp[i + 1][j]!, dp[i][j + 1]!)
  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ t: 'same', s: a[i]! }); i++; j++ }
    else if (dp[i + 1][j]! >= dp[i][j + 1]!) { out.push({ t: 'del', s: a[i]! }); i++ }
    else { out.push({ t: 'add', s: b[j]! }); j++ }
  }
  while (i < n) { out.push({ t: 'del', s: a[i]! }); i++ }
  while (j < m) { out.push({ t: 'add', s: b[j]! }); j++ }
  return out
}

export function TextDiff() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [result, setResult] = useState<DiffLine[] | null>(null)

  const tooBig = a.split('\n').length > 1200 || b.split('\n').length > 1200

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Original</span>
          <TextArea value={a} onChange={(e) => setA(e.target.value)} placeholder="Paste original text…" className="min-h-40 font-mono text-xs" />
        </div>
        <div>
          <span className="label">Changed</span>
          <TextArea value={b} onChange={(e) => setB(e.target.value)} placeholder="Paste changed text…" className="min-h-40 font-mono text-xs" />
        </div>
      </div>
      <button className="btn-primary" disabled={!a || !b || tooBig} onClick={() => setResult(diffLines(a.split('\n'), b.split('\n')))}>
        Compare texts
      </button>
      {tooBig && <p className="text-sm text-red-500">Please keep each side under 1,200 lines.</p>}
      {result && (
        <>
          <div className="flex gap-3 text-sm">
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              +{result.filter((r) => r.t === 'add').length} added
            </span>
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
              −{result.filter((r) => r.t === 'del').length} removed
            </span>
            <button className="ml-auto btn-secondary px-3 py-1" onClick={() => setResult(null)}>Clear</button>
          </div>
          <div className="card overflow-hidden font-mono text-xs leading-relaxed">
            {result.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.t === 'add'
                    ? 'bg-emerald-50 px-4 py-0.5 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : l.t === 'del'
                      ? 'bg-red-50 px-4 py-0.5 text-red-600 line-through decoration-red-300 dark:bg-red-950/60 dark:text-red-300'
                      : 'px-4 py-0.5 text-zinc-500 dark:text-zinc-500'
                }
              >
                {l.s || '\u00A0'}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- Lorem Ipsum Generator ---------------- */

const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function randSentence(minW: number, maxW: number): string {
  const n = minW + Math.floor(Math.random() * (maxW - minW))
  const words = Array.from({ length: n }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)])
  const s = words.join(' ')
  return s[0]!.toUpperCase() + s.slice(1) + '.'
}

export function LoremIpsum() {
  const [count, setCount] = useState(3)
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [classicStart, setClassicStart] = useState(true)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const CLASSIC = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

  function generate() {
    let out = ''
    if (unit === 'paragraphs') {
      const paras: string[] = []
      for (let p = 0; p < count; p++) {
        const nSent = 3 + Math.floor(Math.random() * 4)
        const sentences = Array.from({ length: nSent }, () => randSentence(8, 18))
        if (p === 0 && classicStart) sentences[0] = CLASSIC
        paras.push(sentences.join(' '))
      }
      out = paras.join('\n\n')
    } else if (unit === 'sentences') {
      const arr = Array.from({ length: count }, () => randSentence(8, 18))
      if (classicStart) arr[0] = CLASSIC
      out = arr.join(' ')
    } else {
      out = Array.from({ length: count }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(' ')
      if (out) out = out[0]!.toUpperCase() + out.slice(1) + '.'
    }
    setOutput(out)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <span className="label">Amount</span>
          <input type="number" min={1} max={100} className="input" value={count} onChange={(e) => setCount(Math.min(100, Math.max(1, +e.target.value)))} />
        </div>
        <div>
          <span className="label">Unit</span>
          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)}>
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>
        <label className="flex items-end gap-2 pb-2.5 text-sm font-medium">
          <input type="checkbox" checked={classicStart} onChange={(e) => setClassicStart(e.target.checked)} className="accent-indigo-600" />
          Start with “Lorem ipsum…”
        </label>
      </div>
      <button className="btn-primary" onClick={generate}>Generate</button>
      {output && (
        <div className="space-y-3">
          <TextArea readOnly value={output} className="min-h-56 bg-zinc-50 dark:bg-zinc-800" />
          <div className="flex gap-2">
            <CopyButton text={output} label="Copy text" className="btn-primary" />
            <button
              className="btn-secondary"
              onClick={async () => { await copyText(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            >
              {copied ? 'Copied!' : 'Copy again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Slug Generator ---------------- */

export function SlugGenerator() {
  const [title, setTitle] = useState('')
  const [sep, setSep] = useState<'-' | '_'>('-')

  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, sep)
    .replace(new RegExp(`\\${sep}{2,}`, 'g'), sep)
    .replace(new RegExp(`^\\${sep}|\\${sep}$`, 'g'), '')

  return (
    <div className="space-y-4">
      <div>
        <span className="label">Page title / headline</span>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="10 Best Coffee Shops in Melbourne (2026)" />
      </div>
      <div className="flex items-center gap-4">
        <span className="label mb-0">Separator</span>
        {(['-', '_'] as const).map((s) => (
          <label key={s} className="flex items-center gap-1.5 font-mono text-sm">
            <input type="radio" checked={sep === s} onChange={() => setSep(s)} className="accent-indigo-600" /> {s}
          </label>
        ))}
      </div>
      <div className="card p-5">
        <span className="label">Slug ({slug.length} chars)</span>
        <p className="break-all font-mono text-lg">{slug || <span className="text-zinc-400">your-slug-appears-here</span>}</p>
      </div>
      <div className="card p-5">
        <span className="label">URL-encoded</span>
        <p className="break-all font-mono text-sm text-zinc-500 dark:text-zinc-400">{encodeURIComponent(slug) || '—'}</p>
      </div>
      {slug && <CopyButton text={slug} label="Copy slug" className="btn-primary" />}
    </div>
  )
}
