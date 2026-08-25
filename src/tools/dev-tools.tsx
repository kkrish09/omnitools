import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Download, RefreshCw } from 'lucide-react'
import { downloadBlob } from '../lib/utils'
import { CopyButton, ErrorNote, FileDrop, TextArea } from '../components/ui'

/* ---------------- JSON Formatter ---------------- */

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep)
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, val]) => [k, sortDeep(val)]),
    )
  }
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
    setError('')
    setOutput('')
    try {
      let parsed: unknown = JSON.parse(input)
      if (sortKeys) parsed = sortDeep(parsed)
      if (minify) {
        setOutput(JSON.stringify(parsed))
      } else {
        const space = indent === 'tab' ? '\t' : Number(indent)
        setOutput(JSON.stringify(parsed, null, space))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div className="space-y-4">
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder='Paste JSON… e.g. {"hello":"world"}' className="min-h-40 font-mono text-xs" />
      <div className="flex flex-wrap items-center gap-4">
        {!minify && (
          <div>
            <span className="label mb-0">Indent</span>
            <select className="input w-28" value={indent} onChange={(e) => setIndent(e.target.value as typeof indent)}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        )}
        <label className="mt-4 flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={minify} onChange={(e) => setMinify(e.target.checked)} className="accent-indigo-600" /> Minify
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="accent-indigo-600" /> Sort keys
        </label>
        <button className="btn-primary mt-3" disabled={!input.trim()} onClick={run}>Format</button>
      </div>
      {error && <ErrorNote><strong>Invalid JSON:</strong> {error}</ErrorNote>}
      {output && (
        <div className="space-y-3">
          <TextArea readOnly value={output} className="min-h-56 bg-zinc-50 font-mono text-xs dark:bg-zinc-800" onFocus={(e) => e.currentTarget.select()} />
          <div className="flex gap-2">
            <CopyButton text={output} label="Copy" className="btn-primary" />
            <button className="btn-secondary" onClick={() => downloadBlob(new Blob([output], { type: 'application/json' }), minify ? 'data.min.json' : 'data.json')}>
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Hash Generator ---------------- */

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const

async function computeHashes(buf: ArrayBuffer): Promise<Record<string, string>> {
  const entries = await Promise.all(
    ALGOS.map(async (a) => {
      const digest = await crypto.subtle.digest(a, buf)
      const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
      return [a, hex] as const
    }),
  )
  return Object.fromEntries(entries)
}

export function HashGenerator() {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [warn, setWarn] = useState('')

  useEffect(() => {
    let cancelled = false
    const bytes = new TextEncoder().encode(text)
    computeHashes(bytes.buffer).then((h) => !cancelled && setHashes(h)).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [text])

  return (
    <div className="space-y-4">
      <TextArea value={text} onChange={(e) => { setText(e.target.value); setFileName('') }} placeholder="Type or paste text to hash…" className="min-h-32 font-mono text-xs" />
      <FileDrop
        hint="…or drop a file to hash its contents (up to 100 MB)"
        onFiles={async ([f]) => {
          if (!f) return
          if (f.size > 100 * 1024 * 1024) {
            setFileName('')
            setHashes({})
            setWarn(`“${f.name}” is larger than 100 MB — hashing skipped to keep your browser responsive.`)
            return
          }
          setWarn('')
          setFileName(f.name)
          setHashes(await computeHashes(await f.arrayBuffer()))
        }}
      />
      {warn && <ErrorNote>{warn}</ErrorNote>}
      {fileName && <p className="text-sm text-zinc-500">File: <span className="font-medium">{fileName}</span></p>}
      {(Object.keys(hashes).length > 0) && (
        <div className="space-y-2">
          {Object.entries(hashes).map(([algo, hex]) => (
            <div key={algo} className="card flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <span className="label mb-1">{algo}</span>
                <code className="block truncate font-mono text-xs">{hex}</code>
              </div>
              <CopyButton text={hex} label="Copy" className="btn-secondary shrink-0 px-3 py-1.5" />
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-zinc-400">🔒 Everything is computed locally with the Web Crypto API — nothing is sent anywhere.</p>
    </div>
  )
}

/* ---------------- UUID Generator ---------------- */

export function UuidGenerator() {
  const [count, setCount] = useState(5)
  const [ids, setIds] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => crypto.randomUUID()),
  )

  function generate() {
    setIds(Array.from({ length: Math.min(100, Math.max(1, count)) }, () => crypto.randomUUID()))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="w-28">
          <span className="label">How many</span>
          <input type="number" min={1} max={100} className="input" value={count} onChange={(e) => setCount(+e.target.value)} />
        </div>
        <button className="btn-primary" onClick={generate}><RefreshCw className="h-4 w-4" /> Generate</button>
        <CopyButton text={ids.join('\n')} label="Copy all" className="btn-secondary ml-auto" />
      </div>
      <div className="card divide-y divide-zinc-100 font-mono text-sm dark:divide-zinc-800">
        {ids.map((id, i) => (
          <button key={id + i} className="block w-full px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => navigator.clipboard.writeText(id)}>
            {id}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Password Generator ---------------- */

const SETS = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower: 'abcdefghijkmnopqrstuvwxyz',
  digits: '23456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true })
  const [password, setPassword] = useState('')
  const [history, setHistory] = useState<string[]>([])

  function generate() {
    const activeSets = (Object.keys(opts) as (keyof typeof opts)[]).filter((k) => opts[k])
    if (!activeSets.length || length < 4) return
    const pool = activeSets.map((k) => SETS[k]).join('')
    const rand = (n: number) => {
      const arr = new Uint32Array(n)
      crypto.getRandomValues(arr)
      return arr
    }
    const chars: string[] = activeSets.map((k) => SETS[k][rand(1)[0]! % SETS[k].length]!)
    while (chars.length < length) chars.push(pool[rand(1)[0]! % pool.length]!)
    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = rand(1)[0]! % (i + 1)
      ;[chars[i], chars[j]] = [chars[j]!, chars[i]!]
    }
    const pw = chars.join('')
    setPassword(pw)
    setHistory((h) => [pw, ...h].slice(0, 5))
  }

  const poolSize = (Object.keys(opts) as (keyof typeof opts)[]).filter((k) => opts[k]).reduce((s, k) => s + SETS[k].length, 0)
  const entropy = poolSize > 1 ? Math.round(length * Math.log2(poolSize)) : 0
  const strength = entropy >= 90 ? ['Very strong', 'text-emerald-500'] : entropy >= 70 ? ['Strong', 'text-emerald-500'] : entropy >= 50 ? ['Fair', 'text-amber-500'] : ['Weak', 'text-red-500']

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="break-all text-center text-xl font-bold font-mono">{password || <span className="text-zinc-300 dark:text-zinc-700">click generate…</span>}</div>
        {password && (
          <p className={`mt-2 text-center text-xs font-semibold ${strength[1]}`}>
            {strength[0]} · ~{entropy} bits of entropy
          </p>
        )}
      </div>
      <div>
        <span className="label">Length: {length}</span>
        <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(+e.target.value)} className="w-full accent-indigo-600" />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm font-medium capitalize">
            <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} className="accent-indigo-600" />
            {k === 'upper' ? 'A–Z' : k === 'lower' ? 'a–z' : k === 'digits' ? '0–9' : '!@#'}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={generate}>Generate password</button>
        {password && <CopyButton text={password} label="Copy" />}
      </div>
      {history.length > 1 && (
        <div>
          <span className="label">History</span>
          <ul className="space-y-1 font-mono text-xs text-zinc-500">
            {history.slice(1).map((pw) => <li key={pw}>{pw}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ---------------- QR Code Generator ---------------- */

export function QrGenerator() {
  const [text, setText] = useState('https://omnitoolsapp.pages.dev')
  const [size, setSize] = useState(512)
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [ecl, setEcl] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!text.trim()) {
      setUrl('')
      return
    }
    QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: ecl, color: { dark: fg, light: bg } })
      .then((u) => !cancelled && (setUrl(u), setError('')))
      .catch(() => !cancelled && setError('Text too long for a QR code — try shortening it.'))
    return () => {
      cancelled = true
    }
  }, [text, size, ecl, fg, bg])

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <div>
          <span className="label">Content (URL, text, Wi-Fi credentials…)</span>
          <TextArea value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com" className="min-h-24" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="label">Size</span>
            <select className="input" value={size} onChange={(e) => setSize(+e.target.value)}>
              {[128, 256, 512, 1024].map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>
          <div>
            <span className="label">Error correction</span>
            <select className="input" value={ecl} onChange={(e) => setEcl(e.target.value as typeof ecl)}>
              <option value="L">L — 7%</option>
              <option value="M">M — 15%</option>
              <option value="Q">Q — 25%</option>
              <option value="H">H — 30%</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0 dark:border-zinc-700" />
            <span className="text-sm">Foreground</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0 dark:border-zinc-700" />
            <span className="text-sm">Background</span>
          </label>
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        {url && (
          <button className="btn-primary" onClick={() => fetch(url).then((r) => r.blob()).then((b) => downloadBlob(b, 'qr-code.png'))}>
            <Download className="h-4 w-4" /> Download PNG
          </button>
        )}
      </div>
      <div className="card mx-auto p-4 lg:w-72">
        {url ? <img src={url} alt="QR code preview" width={240} height={240} className="mx-auto rounded-xl" /> : <div className="flex h-60 items-center justify-center text-sm text-zinc-400">QR preview</div>}
      </div>
    </div>
  )
}
