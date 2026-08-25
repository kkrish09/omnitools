import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Download, RefreshCw } from 'lucide-react'
import { copyText, downloadBlob } from '../lib/utils'
import { CopyButton, ErrorNote, FileDrop, Spinner, TextArea } from '../components/ui'

/* ===== SHARED ===== */

function OutputBox({ value, label = 'Output' }: { value: string; label?: string }) {
  return (
    <div className="space-y-2">
      <span className="label">{label}</span>
      <TextArea readOnly value={value} className="min-h-40 bg-zinc-50 font-mono text-xs dark:bg-zinc-800" onFocus={(e) => e.currentTarget.select()} />
      <div className="flex gap-2">
        <CopyButton text={value} label="Copy" className="btn-primary" />
        <button className="btn-secondary" onClick={() => downloadBlob(new Blob([value], { type: 'text/plain' }), 'output.txt')}>
          <Download className="h-4 w-4" /> Download
        </button>
      </div>
    </div>
  )
}

/* ===== JSON Formatter ===== */

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, val]) => [k, sortDeep(val)]))
  return v
}

export function JsonFormatter() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2')
  const [minify, setMinify] = useState(false)
  const [sortKeys, setSortKeys] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function run() {
    setError(''); setOutput('')
    try {
      let parsed: unknown = JSON.parse(input)
      if (sortKeys) parsed = sortDeep(parsed)
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent === 'tab' ? '\t' : Number(indent)))
    } catch (e) { setError(e instanceof Error ? e.message : 'Invalid JSON') }
  }

  return (
    <div className="space-y-4">
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder='Paste JSON… e.g. {"hello":"world"}' className="min-h-40 font-mono text-xs" />
      <div className="flex flex-wrap items-center gap-4">
        {!minify && (
          <select className="input w-28" value={indent} onChange={(e) => setIndent(e.target.value as typeof indent)}>
            <option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option>
          </select>
        )}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={minify} onChange={(e) => setMinify(e.target.checked)} className="accent-indigo-600" /> Minify</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="accent-indigo-600" /> Sort keys</label>
        <button className="btn-primary" disabled={!input.trim()} onClick={run}>Format</button>
      </div>
      {error && <ErrorNote><strong>Invalid JSON:</strong> {error}</ErrorNote>}
      {output && <OutputBox value={output} />}
    </div>
  )
}

/* ===== YAML ↔ JSON ===== */

export function YamlJson() {
  const [input, setInput] = useState('')
  const [dir, setDir] = useState<'y2j' | 'j2y'>('y2j')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  async function convert() {
    setError(''); setOutput('')
    try {
      const yaml = await import('yaml')
      if (dir === 'y2j') {
        const parsed = yaml.parse(input)
        setOutput(JSON.stringify(parsed, null, 2))
      } else {
        const parsed = JSON.parse(input)
        setOutput(yaml.stringify(parsed))
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Conversion failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={dir === 'y2j' ? 'btn-primary' : 'btn-secondary'} onClick={() => setDir('y2j')}>YAML → JSON</button>
        <button className={dir === 'j2y' ? 'btn-primary' : 'btn-secondary'} onClick={() => setDir('j2y')}>JSON → YAML</button>
      </div>
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={dir === 'y2j' ? 'Paste YAML…' : 'Paste JSON…'} className="min-h-40 font-mono text-xs" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <button className="btn-primary" disabled={!input.trim()} onClick={convert}>Convert</button>
      {output && <OutputBox value={output} />}
    </div>
  )
}

/* ===== CSV ↔ JSON ===== */

export function CsvJson() {
  const [input, setInput] = useState('')
  const [dir, setDir] = useState<'c2j' | 'j2c'>('c2j')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function convert() {
    setError(''); setOutput('')
    try {
      if (dir === 'c2j') {
        const lines = input.trim().split('\n').filter(Boolean)
        if (lines.length < 2) throw new Error('Need a header row and at least one data row')
        const headers = parseCsvLine(lines[0]!)
        const rows = lines.slice(1).map((line) => {
          const vals = parseCsvLine(line)
          return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
        })
        setOutput(JSON.stringify(rows, null, 2))
      } else {
        const arr = JSON.parse(input)
        if (!Array.isArray(arr) || !arr.length) throw new Error('Input must be a non-empty JSON array')
        const headers = [...new Set(arr.flatMap((r: Record<string, unknown>) => Object.keys(r)))]
        const csvLines = [headers.join(','), ...arr.map((r: Record<string, unknown>) => headers.map((h) => csvEscape(String(r[h] ?? ''))).join(','))]
        setOutput(csvLines.join('\n'))
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Conversion failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={dir === 'c2j' ? 'btn-primary' : 'btn-secondary'} onClick={() => setDir('c2j')}>CSV → JSON</button>
        <button className={dir === 'j2c' ? 'btn-primary' : 'btn-secondary'} onClick={() => setDir('j2c')}>JSON → CSV</button>
      </div>
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={dir === 'c2j' ? 'Paste CSV data…' : 'Paste JSON array…'} className="min-h-40 font-mono text-xs" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <button className="btn-primary" disabled={!input.trim()} onClick={convert}>Convert</button>
      {output && <OutputBox value={output} />}
    </div>
  )
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []; let cur = ''; let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (inQuote) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ } else if (c === '"') inQuote = false; else cur += c }
    else { if (c === '"') inQuote = true; else if (c === ',') { result.push(cur); cur = '' } else cur += c }
  }
  result.push(cur)
  return result
}

function csvEscape(s: string): string { return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s }

/* ===== XML Formatter ===== */

export function XmlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function format() {
    setError(''); setOutput('')
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, 'text/xml')
      if (doc.querySelector('parsererror')) throw new Error('Invalid XML')
      const serializer = new XMLSerializer()
      let xml = serializer.serializeToString(doc)
      // Basic indent
      let indent = 0
      xml = xml.replace(/(>)\s*(<)/g, '$1\n$2')
      const lines = xml.split('\n')
      const formatted = lines.map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return ''
        if (trimmed.startsWith('</')) indent--
        const result = '  '.repeat(Math.max(0, indent)) + trimmed
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.startsWith('<?')) indent++
        return result
      }).filter(Boolean)
      setOutput(formatted.join('\n'))
    } catch (e) { setError(e instanceof Error ? e.message : 'Invalid XML') }
  }

  return (
    <div className="space-y-4">
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste XML…" className="min-h-40 font-mono text-xs" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <button className="btn-primary" disabled={!input.trim()} onClick={format}>Format XML</button>
      {output && <OutputBox value={output} />}
    </div>
  )
}

/* ===== SQL Formatter ===== */

export function SqlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  function format() {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'AS', 'DISTINCT', 'UNION', 'UNION ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IN', 'NOT IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'ASC', 'DESC']
    let sql = input.replace(/\s+/g, ' ').trim()
    for (const kw of keywords) {
      const re = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi')
      sql = sql.replace(re, (m) => {
        const upper = m.toUpperCase()
        if (['AND', 'OR', 'ON', 'AS', 'IN', 'ASC', 'DESC'].includes(upper)) return '\n  ' + upper
        if (['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN'].includes(upper)) return '\n' + upper
        return '\n' + upper
      })
    }
    // Clean up extra indentation for subqueries
    setOutput(sql.trim())
  }

  return (
    <div className="space-y-4">
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste SQL query…" className="min-h-40 font-mono text-xs" />
      <button className="btn-primary" disabled={!input.trim()} onClick={format}>Format SQL</button>
      {output && <OutputBox value={output} />}
    </div>
  )
}

/* ===== Code Beautifier (CSS/JS/HTML) ===== */

export function CodeBeautifier() {
  const [input, setInput] = useState('')
  const [lang, setLang] = useState<'css' | 'js' | 'html'>('css')
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function run() {
    setError(''); setOutput('')
    try {
      if (mode === 'minify') {
        setOutput(input.replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').trim())
        return
      }
      // Basic beautify: add newlines after { and ;, before }, indent
      let result = input
      result = result.replace(/\s+/g, ' ')
      result = result.replace(/\{\s*/g, ' {\n')
      result = result.replace(/\}\s*/g, '\n}\n')
      if (lang === 'css') result = result.replace(/;\s*/g, ';\n')
      if (lang === 'js') result = result.replace(/;\s*/g, ';\n')
      // Indent
      let indent = 0
      const lines = result.split('\n').filter(Boolean)
      const formatted = lines.map((line) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('}')) indent--
        const r = '  '.repeat(Math.max(0, indent)) + trimmed
        if (trimmed.endsWith('{')) indent++
        return r
      })
      setOutput(formatted.join('\n'))
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['css', 'js', 'html'] as const).map((l) => <button key={l} className={lang === l ? 'btn-primary px-3 py-1.5 uppercase' : 'btn-secondary px-3 py-1.5 uppercase'} onClick={() => setLang(l)}>{l}</button>)}
        <div className="ml-auto flex gap-2">
          <button className={mode === 'beautify' ? 'btn-primary px-3 py-1.5' : 'btn-secondary px-3 py-1.5'} onClick={() => setMode('beautify')}>Beautify</button>
          <button className={mode === 'minify' ? 'btn-primary px-3 py-1.5' : 'btn-secondary px-3 py-1.5'} onClick={() => setMode('minify')}>Minify</button>
        </div>
      </div>
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Paste ${lang.toUpperCase()}…`} className="min-h-40 font-mono text-xs" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <button className="btn-primary" disabled={!input.trim()} onClick={run}>{mode === 'beautify' ? 'Beautify' : 'Minify'}</button>
      {output && <OutputBox value={output} />}
    </div>
  )
}

/* ===== Markdown Preview ===== */

export function MarkdownPreview() {
  const [md, setMd] = useState('# Hello World\n\nThis is **bold** and *italic*.\n\n```js\nconsole.log("hi")\n```\n\n- Item 1\n- Item 2\n\n> Blockquote\n\n[Link](https://example.com)')
  const [html, setHtml] = useState('')

  useEffect(() => {
    import('marked').then(({ marked }) => {
      marked.setOptions({ breaks: true, gfm: true })
      setHtml(marked.parse(md) as string)
    })
  }, [md])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <span className="label">Markdown</span>
        <TextArea value={md} onChange={(e) => setMd(e.target.value)} className="min-h-[400px] font-mono text-xs" />
      </div>
      <div>
        <span className="label">Preview</span>
        <div className="card min-h-[400px] overflow-auto p-5 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

/* ===== Regex Tester ===== */

export function RegexTester() {
  const [pattern, setPattern] = useState('\\d+')
  const [flags, setFlags] = useState('g')
  const [testStr, setTestStr] = useState('Hello 123 world 456')
  const [error, setError] = useState('')

  const matches = useMemo(() => {
    try {
      setError('')
      const re = new RegExp(pattern, flags)
      const all: { value: string; index: number }[] = []
      let m: RegExpExecArray | null
      if (flags.includes('g')) { while ((m = re.exec(testStr)) !== null) { all.push({ value: m[0], index: m.index }); if (!m[0]) re.lastIndex++ } }
      else { m = re.exec(testStr); if (m) all.push({ value: m[0], index: m.index }) }
      return all
    } catch (e) { setError(e instanceof Error ? e.message : 'Invalid regex'); return [] }
  }, [pattern, flags, testStr])

  const highlighted = useMemo(() => {
    if (!matches.length) return testStr
    let result = ''; let lastIdx = 0
    const sorted = [...matches].sort((a, b) => a.index - b.index)
    for (const m of sorted) {
      if (m.index < lastIdx) continue
      result += escapeHtml(testStr.slice(lastIdx, m.index))
      result += `<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">${escapeHtml(m.value)}</mark>`
      lastIdx = m.index + m.value.length
    }
    result += escapeHtml(testStr.slice(lastIdx))
    return result
  }, [matches, testStr])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[3fr_1fr]">
        <div>
          <span className="label">Pattern</span>
          <input className="input font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="\\d+" />
        </div>
        <div>
          <span className="label">Flags</span>
          <input className="input font-mono" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="g" />
        </div>
      </div>
      <TextArea value={testStr} onChange={(e) => setTestStr(e.target.value)} className="min-h-24 font-mono text-xs" placeholder="Test string…" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="card p-4">
        <span className="label">Highlighted matches ({matches.length})</span>
        <div className="mt-2 whitespace-pre-wrap font-mono text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
      {matches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {matches.map((m, i) => <span key={i} className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-xs dark:bg-indigo-950">"{m.value}" at {m.index}</span>)}
        </div>
      )}
    </div>
  )
}

function escapeHtml(s: string): string { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

/* ===== JWT Decoder ===== */

export function JwtDecoder() {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const result = useMemo(() => {
    if (!token.trim()) return null
    try {
      setError('')
      const parts = token.trim().split('.')
      if (parts.length < 2) throw new Error('Not a valid JWT')
      const header = JSON.parse(atob(parts[0]!.replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/')))
      const exp = payload.exp ? new Date(payload.exp * 1000) : null
      const iat = payload.iat ? new Date(payload.iat * 1000) : null
      return { header: JSON.stringify(header, null, 2), payload: JSON.stringify(payload, null, 2), exp, iat, isExpired: exp ? exp < new Date() : false }
    } catch (e) { setError(e instanceof Error ? e.message : 'Invalid JWT'); return null }
  }, [token])

  return (
    <div className="space-y-4">
      <TextArea value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste a JWT token…\neyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U" className="min-h-24 font-mono text-xs" />
      {error && <ErrorNote>{error}</ErrorNote>}
      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="card p-4">
              <span className="label">Header</span>
              <pre className="mt-1 overflow-auto font-mono text-xs">{result.header}</pre>
            </div>
            {result.exp && <p className={`text-xs font-semibold ${result.isExpired ? 'text-red-500' : 'text-emerald-500'}`}>{result.isExpired ? '⚠ Expired' : '✓ Valid'} — expires {result.exp.toLocaleString()}</p>}
            {result.iat && <p className="text-xs text-zinc-400">Issued: {result.iat.toLocaleString()}</p>}
          </div>
          <div className="card p-4">
            <span className="label">Payload</span>
            <pre className="mt-1 overflow-auto font-mono text-xs">{result.payload}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== Debug Log Formatter ===== */

export function DebugLog() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function prettify() {
    setError(''); setOutput('')
    try {
      // Try JSON first
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      return
    } catch { /* not JSON */ }
    // Try splitting common log formats
    const lines = input.split('\n')
    const result: string[] = []
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) { result.push(''); continue }
      // Try to find JSON embedded in log lines
      const jsonMatch = trimmed.match(/(\{.*\}|\[.*\])/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]!)
          const formatted = JSON.stringify(parsed, null, 2)
          const prefix = trimmed.slice(0, trimmed.indexOf(jsonMatch[1]!))
          result.push(prefix + formatted)
          continue
        } catch { /* not json in log */ }
      }
      // Prettify stack traces
      if (trimmed.match(/^\s*at\s/) || trimmed.match(/^\s*at\s/)) {
        result.push('  ' + trimmed)
      } else {
        result.push(trimmed)
      }
    }
    setOutput(result.join('\n'))
  }

  return (
    <div className="space-y-4">
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste minified JSON, logs, or stack traces…" className="min-h-40 font-mono text-xs" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <button className="btn-primary" disabled={!input.trim()} onClick={prettify}>Prettify</button>
      {output && <OutputBox value={output} />}
    </div>
  )
}

/* ===== UUID Generator ===== */

export function UuidGenerator() {
  const [count, setCount] = useState(5)
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 5 }, () => crypto.randomUUID()))
  function generate() { setIds(Array.from({ length: Math.min(100, Math.max(1, count)) }, () => crypto.randomUUID())) }
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="w-28"><span className="label">How many</span><input type="number" min={1} max={100} className="input" value={count} onChange={(e) => setCount(+e.target.value)} /></div>
        <button className="btn-primary" onClick={generate}><RefreshCw className="h-4 w-4" /> Generate</button>
        <CopyButton text={ids.join('\n')} label="Copy all" className="btn-secondary ml-auto" />
      </div>
      <div className="card divide-y divide-zinc-100 font-mono text-sm dark:divide-zinc-800">
        {ids.map((id, i) => <button key={id + i} className="block w-full px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => navigator.clipboard.writeText(id)}>{id}</button>)}
      </div>
    </div>
  )
}

/* ===== Password Generator ===== */

const SETS = { upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', lower: 'abcdefghijkmnopqrstuvwxyz', digits: '23456789', symbols: '!@#$%^&*()-_=+[]{};:,.' }

export function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true })
  const [password, setPassword] = useState('')
  const [history, setHistory] = useState<string[]>([])
  function generate() {
    const activeSets = (Object.keys(opts) as (keyof typeof opts)[]).filter((k) => opts[k])
    if (!activeSets.length || length < 4) return
    const pool = activeSets.map((k) => SETS[k]).join('')
    const rand = (n: number) => { const a = new Uint32Array(n); crypto.getRandomValues(a); return a }
    const chars: string[] = activeSets.map((k) => SETS[k][rand(1)[0]! % SETS[k].length]!)
    while (chars.length < length) chars.push(pool[rand(1)[0]! % pool.length]!)
    for (let i = chars.length - 1; i > 0; i--) { const j = rand(1)[0]! % (i + 1); [chars[i], chars[j]] = [chars[j]!, chars[i]!] }
    const pw = chars.join(''); setPassword(pw); setHistory((h) => [pw, ...h].slice(0, 5))
  }
  const poolSize = (Object.keys(opts) as (keyof typeof opts)[]).filter((k) => opts[k]).reduce((s, k) => s + SETS[k].length, 0)
  const entropy = poolSize > 1 ? Math.round(length * Math.log2(poolSize)) : 0
  const strength = entropy >= 90 ? ['Very strong', 'text-emerald-500'] : entropy >= 70 ? ['Strong', 'text-emerald-500'] : entropy >= 50 ? ['Fair', 'text-amber-500'] : ['Weak', 'text-red-500']
  return (
    <div className="space-y-4">
      <div className="card p-5"><div className="break-all text-center text-xl font-bold font-mono">{password || <span className="text-zinc-300 dark:text-zinc-700">click generate…</span>}</div>{password && <p className={`mt-2 text-center text-xs font-semibold ${strength[1]}`}>{strength[0]} · ~{entropy} bits of entropy</p>}</div>
      <div><span className="label">Length: {length}</span><input type="range" min={8} max={64} value={length} onChange={(e) => setLength(+e.target.value)} className="w-full accent-indigo-600" /></div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => <label key={k} className="flex items-center gap-2 text-sm font-medium capitalize"><input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} className="accent-indigo-600" />{k === 'upper' ? 'A–Z' : k === 'lower' ? 'a–z' : k === 'digits' ? '0–9' : '!@#'}</label>)}
      </div>
      <div className="flex gap-2"><button className="btn-primary" onClick={generate}>Generate password</button>{password && <CopyButton text={password} label="Copy" />}</div>
      {history.length > 1 && <div><span className="label">History</span><ul className="space-y-1 font-mono text-xs text-zinc-500">{history.slice(1).map((pw) => <li key={pw}>{pw}</li>)}</ul></div>}
    </div>
  )
}

/* ===== QR Code Generator ===== */

export function QrGenerator() {
  const [text, setText] = useState('https://github.com')
  const [size, setSize] = useState(512)
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [ecl, setEcl] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    if (!text.trim()) { setUrl(''); return }
    QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: ecl, color: { dark: fg, light: bg } })
      .then((u) => !cancelled && (setUrl(u), setError('')))
      .catch(() => !cancelled && setError('Text too long for a QR code.'))
    return () => { cancelled = true }
  }, [text, size, ecl, fg, bg])
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <div><span className="label">Content</span><TextArea value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com" className="min-h-24" /></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><span className="label">Size</span><select className="input" value={size} onChange={(e) => setSize(+e.target.value)}>{[128, 256, 512, 1024].map((s) => <option key={s} value={s}>{s}px</option>)}</select></div>
          <div><span className="label">Error correction</span><select className="input" value={ecl} onChange={(e) => setEcl(e.target.value as typeof ecl)}><option value="L">L — 7%</option><option value="M">M — 15%</option><option value="Q">Q — 25%</option><option value="H">H — 30%</option></select></div>
          <label className="flex items-center gap-2"><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0 dark:border-zinc-700" /><span className="text-sm">Foreground</span></label>
          <label className="flex items-center gap-2"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0 dark:border-zinc-700" /><span className="text-sm">Background</span></label>
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        {url && <button className="btn-primary" onClick={() => fetch(url).then((r) => r.blob()).then((b) => downloadBlob(b, 'qr-code.png'))}><Download className="h-4 w-4" /> Download PNG</button>}
      </div>
      <div className="card mx-auto p-4 lg:w-72">{url ? <img src={url} alt="QR code" width={240} height={240} className="mx-auto rounded-xl" /> : <div className="flex h-60 items-center justify-center text-sm text-zinc-400">QR preview</div>}</div>
    </div>
  )
}

/* ===== Hash Generator ===== */

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
async function computeHashes(buf: ArrayBuffer): Promise<Record<string, string>> {
  const entries = await Promise.all(ALGOS.map(async (a) => { const d = await crypto.subtle.digest(a, buf); return [a, [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')] as const }))
  return Object.fromEntries(entries)
}
export function HashGenerator() {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [warn, setWarn] = useState('')
  useEffect(() => { let c = false; computeHashes(new TextEncoder().encode(text).buffer).then((h) => !c && setHashes(h)); return () => { c = true } }, [text])
  return (
    <div className="space-y-4">
      <TextArea value={text} onChange={(e) => { setText(e.target.value); setFileName('') }} placeholder="Type or paste text to hash…" className="min-h-32 font-mono text-xs" />
      <FileDrop hint="…or drop a file to hash its contents (up to 100 MB)" onFiles={async ([f]) => { if (!f) return; if (f.size > 100 * 1024 * 1024) { setFileName(''); setHashes({}); setWarn(`"${f.name}" is larger than 100 MB — skipped.`); return } setWarn(''); setFileName(f.name); setHashes(await computeHashes(await f.arrayBuffer())) }} />
      {warn && <ErrorNote>{warn}</ErrorNote>}
      {fileName && <p className="text-sm text-zinc-500">File: <span className="font-medium">{fileName}</span></p>}
      {Object.keys(hashes).length > 0 && <div className="space-y-2">{Object.entries(hashes).map(([algo, hex]) => <div key={algo} className="card flex items-center justify-between gap-3 p-4"><div className="min-w-0"><span className="label mb-1">{algo}</span><code className="block truncate font-mono text-xs">{hex}</code></div><CopyButton text={hex} label="Copy" className="btn-secondary shrink-0 px-3 py-1.5" /></div>)}</div>}
      <p className="text-xs text-zinc-400">🔒 Computed locally with the Web Crypto API — nothing is sent anywhere.</p>
    </div>
  )
}
