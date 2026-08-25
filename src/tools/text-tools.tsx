import { useState } from 'react'
import { TextArea } from '../components/ui'

/* ===== Case Converter ===== */

function wordize(s: string): string[] {
  return s.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^a-zA-Z0-9]+/).filter(Boolean)
}

const CASES: { label: string; fn: (s: string) => string }[] = [
  { label: 'UPPERCASE', fn: (s) => s.toUpperCase() },
  { label: 'lowercase', fn: (s) => s.toLowerCase() },
  { label: 'Title Case', fn: (s) => s.toLowerCase().replace(/\w\S*/g, (w) => w[0]!.toUpperCase() + w.slice(1)) },
  { label: 'Sentence case', fn: (s) => s.toLowerCase().replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase()) },
  { label: 'camelCase', fn: (s) => wordize(s).map((w, i) => (i === 0 ? w.toLowerCase() : w[0]!.toUpperCase() + w.slice(1).toLowerCase())).join('') },
  { label: 'PascalCase', fn: (s) => wordize(s).map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join('') },
  { label: 'snake_case', fn: (s) => wordize(s).map((w) => w.toLowerCase()).join('_') },
  { label: 'kebab-case', fn: (s) => wordize(s).map((w) => w.toLowerCase()).join('-') },
  { label: 'CONSTANT_CASE', fn: (s) => wordize(s).map((w) => w.toUpperCase()).join('_') },
  { label: 'aLtErNaTiNg', fn: (s) => [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join('') },
  { label: 'iNVERSE cASE', fn: (s) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('') },
]

export function CaseConverter() {
  const [text, setText] = useState('')
  const [active, setActive] = useState<number | null>(null)
  return (
    <div className="space-y-4">
      <TextArea value={text} onChange={(e) => { setText(e.target.value); setActive(null) }} placeholder="Type or paste text…" className="min-h-32" />
      <div className="flex flex-wrap gap-2">
        {CASES.map((c, i) => <button key={c.label} className={active === i ? 'btn-primary px-3 py-1.5' : 'btn-secondary px-3 py-1.5'} onClick={() => { setText(c.fn(text)); setActive(i) }}>{c.label}</button>)}
      </div>
      {text && <div className="space-y-3"><TextArea readOnly value={text} className="min-h-32 bg-zinc-50 dark:bg-zinc-800" onFocus={(e) => e.currentTarget.select()} /></div>}
    </div>
  )
}

/* ===== Text Diff Checker ===== */

type DiffLine = { t: 'same' | 'add' | 'del'; s: string }

function diffLines(a: string[], b: string[]): DiffLine[] {
  const n = a.length; const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1]! + 1 : Math.max(dp[i + 1][j]!, dp[i][j + 1]!)
  const out: DiffLine[] = []; let i = 0; let j = 0
  while (i < n && j < m) { if (a[i] === b[j]) { out.push({ t: 'same', s: a[i]! }); i++; j++ } else if (dp[i + 1][j]! >= dp[i][j + 1]!) { out.push({ t: 'del', s: a[i]! }); i++ } else { out.push({ t: 'add', s: b[j]! }); j++ } }
  while (i < n) { out.push({ t: 'del', s: a[i]! }); i++ }
  while (j < m) { out.push({ t: 'add', s: b[j]! }); j++ }
  return out
}

export function TextDiff() {
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [result, setResult] = useState<DiffLine[] | null>(null)
  const tooBig = a.split('\n').length > 1200 || b.split('\n').length > 1200
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="label">Original</span><TextArea value={a} onChange={(e) => setA(e.target.value)} placeholder="Paste original text…" className="min-h-40 font-mono text-xs" /></div>
        <div><span className="label">Changed</span><TextArea value={b} onChange={(e) => setB(e.target.value)} placeholder="Paste changed text…" className="min-h-40 font-mono text-xs" /></div>
      </div>
      <button className="btn-primary" disabled={!a || !b || tooBig} onClick={() => setResult(diffLines(a.split('\n'), b.split('\n')))}>Compare texts</button>
      {tooBig && <p className="text-sm text-red-500">Please keep each side under 1,200 lines.</p>}
      {result && (
        <>
          <div className="flex gap-3 text-sm">
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">+{result.filter((r) => r.t === 'add').length} added</span>
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700 dark:bg-red-950 dark:text-red-400">−{result.filter((r) => r.t === 'del').length} removed</span>
            <button className="ml-auto btn-secondary px-3 py-1" onClick={() => setResult(null)}>Clear</button>
          </div>
          <div className="card overflow-hidden font-mono text-xs leading-relaxed">
            {result.map((l, idx) => <div key={idx} className={l.t === 'add' ? 'bg-emerald-50 px-4 py-0.5 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : l.t === 'del' ? 'bg-red-50 px-4 py-0.5 text-red-600 line-through decoration-red-300 dark:bg-red-950/60 dark:text-red-300' : 'px-4 py-0.5 text-zinc-500'}>{l.s || '\u00A0'}</div>)}
          </div>
        </>
      )}
    </div>
  )
}
