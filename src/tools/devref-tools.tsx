import { useMemo, useState } from 'react'
import { CopyButton, TextArea } from '../components/ui'
import { copyText } from '../lib/utils'

/* ===== Binary / Hex / Octal Converter ===== */

export function BinaryHex() {
  const [input, setInput] = useState('42')
  const [base, setBase] = useState<'dec' | 'bin' | 'hex' | 'oct'>('dec')

  const results = useMemo(() => {
    let dec: number
    try {
      switch (base) {
        case 'dec': dec = parseInt(input, 10); break
        case 'bin': dec = parseInt(input, 2); break
        case 'hex': dec = parseInt(input, 16); break
        case 'oct': dec = parseInt(input, 8); break
      }
      if (isNaN(dec) || dec < 0) return null
      return {
        dec: dec.toString(),
        bin: dec.toString(2),
        hex: dec.toString(16).toUpperCase(),
        oct: dec.toString(8),
        binPadded: dec.toString(2).padStart(Math.ceil(dec.toString(2).length / 8) * 8, '0').replace(/(.{8})/g, '$1 ').trim(),
      }
    } catch { return null }
  }, [input, base])

  const bases = [
    { key: 'dec' as const, label: 'Decimal', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
    { key: 'bin' as const, label: 'Binary', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
    { key: 'hex' as const, label: 'Hex', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    { key: 'oct' as const, label: 'Octal', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {bases.map((b) => (
          <button key={b.key} className={`${base === b.key ? b.color + ' ring-2 ring-offset-1' : 'bg-zinc-100 dark:bg-zinc-800'} rounded-lg px-3 py-2 text-xs font-semibold transition-all`} onClick={() => setBase(b.key)}>{b.label}</button>
        ))}
      </div>
      <div>
        <span className="label">Input ({bases.find((b) => b.key === base)?.label})</span>
        <input className="input font-mono text-lg" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter a number..." />
      </div>
      {results && (
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ['Decimal', results.dec, 'bg-indigo-50 dark:bg-indigo-950'],
            ['Binary', results.bin, 'bg-emerald-50 dark:bg-emerald-950'],
            ['Hexadecimal', results.hex, 'bg-amber-50 dark:bg-amber-950'],
            ['Octal', results.oct, 'bg-sky-50 dark:bg-sky-950'],
          ] as const).map(([label, val, bg]) => (
            <div key={label} className={`card flex items-center justify-between p-4 ${bg}`}>
              <div>
                <span className="label">{label}</span>
                <span className="block font-mono text-lg font-bold">{val}</span>
              </div>
              <CopyButton text={val} className="btn-secondary px-2 py-1 text-xs" />
            </div>
          ))}
          <div className="card col-span-full p-4 bg-zinc-50 dark:bg-zinc-900">
            <span className="label">Binary (8-bit padded)</span>
            <span className="block font-mono text-sm">{results.binPadded}</span>
          </div>
        </div>
      )}
      {!results && input && <p className="text-sm text-red-500">Invalid input for the selected base.</p>}
    </div>
  )
}

/* ===== UTF-8 Inspector ===== */

export function Utf8Inspector() {
  const [text, setText] = useState('Hello, 世界! 🌍 ñ é ü ö ä')
  const codepoints = useMemo(() => {
    const result: { char: string; codepoint: string; hex: string; bytes: string; category: string }[] = []
    for (const char of text) {
      const cp = char.codePointAt(0)!
      const bytes = new TextEncoder().encode(char)
      const byteStr = Array.from(bytes).map((b) => '0x' + b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
      let cat = 'Other'
      if (cp >= 0x0041 && cp <= 0x005A) cat = 'Uppercase letter'
      else if (cp >= 0x0061 && cp <= 0x007A) cat = 'Lowercase letter'
      else if (cp >= 0x0030 && cp <= 0x0039) cat = 'Digit'
      else if (cp >= 0x4E00 && cp <= 0x9FFF) cat = 'CJK Unified Ideograph'
      else if (cp >= 0x1F300 && cp <= 0x1FAFF) cat = 'Emoji'
      else if (cp <= 0x001F || cp === 0x007F) cat = 'Control character'
      else if (cp >= 0x0020 && cp <= 0x007E) cat = 'ASCII'
      else if (cp >= 0x0080 && cp <= 0x00FF) cat = 'Latin-1 supplement'
      else if (cp >= 0x0100 && cp <= 0x024F) cat = 'Latin extended'
      else if (cp >= 0x0370 && cp <= 0x03FF) cat = 'Greek'
      else if (cp >= 0x0400 && cp <= 0x04FF) cat = 'Cyrillic'
      else if (cp >= 0x0600 && cp <= 0x06FF) cat = 'Arabic'
      else if (cp >= 0x0900 && cp <= 0x097F) cat = 'Devanagari'
      result.push({ char: cp < 0x20 ? '·' : char, codepoint: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`, hex: cp.toString(16).toUpperCase(), bytes: byteStr, category: cat })
    }
    return result
  }, [text])

  const totalBytes = new TextEncoder().encode(text).length

  return (
    <div className="space-y-4">
      <div>
        <span className="label">Input text</span>
        <input className="input text-lg" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste text..." />
      </div>
      <div className="flex gap-4 text-sm text-zinc-500">
        <span>{text.length} characters</span>
        <span>{totalBytes} bytes (UTF-8)</span>
        <span>{codepoints.length} codepoints</span>
      </div>
      <div className="card overflow-auto max-h-96">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="p-2 text-left">Char</th>
              <th className="p-2 text-left">Codepoint</th>
              <th className="p-2 text-left">Hex</th>
              <th className="p-2 text-left">UTF-8 Bytes</th>
              <th className="p-2 text-left">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {codepoints.map((cp, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="p-2 font-mono text-lg">{cp.char}</td>
                <td className="p-2 font-mono">{cp.codepoint}</td>
                <td className="p-2 font-mono">{cp.hex}</td>
                <td className="p-2 font-mono">{cp.bytes}</td>
                <td className="p-2 text-zinc-500">{cp.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ===== Nginx Config Generator ===== */

interface NginxConfig {
  serverName: string
  port: string
  ssl: boolean
  proxyPass: string
  type: 'static' | 'reverse-proxy' | 'php' | 'redirect'
  redirects: { from: string; to: string }[]
  extraDirectives: string[]
}

const DEFAULT_CONFIG: NginxConfig = {
  serverName: 'example.com',
  port: '443',
  ssl: true,
  proxyPass: 'http://127.0.0.1:3000',
  type: 'reverse-proxy',
  redirects: [{ from: '/old-page', to: '/new-page' }],
  extraDirectives: [],
}

function generateNginx(conf: NginxConfig): string {
  const lines: string[] = []
  const port = conf.ssl ? '443' : '80'
  if (conf.ssl) {
    lines.push(`# Redirect HTTP to HTTPS`)
    lines.push(`server {`)
    lines.push(`    listen 80;`)
    lines.push(`    server_name ${conf.serverName};`)
    lines.push(`    return 301 https://$host$request_uri;`)
    lines.push(`}`)
    lines.push('')
  }
  lines.push(`${conf.ssl ? '# HTTPS' : '# HTTP'} server block`)
  lines.push(`server {`)
  lines.push(`    listen ${port}${conf.ssl ? ' ssl http2' : ''};`)
  lines.push(`    server_name ${conf.serverName};`)
  lines.push('')
  if (conf.ssl) {
    lines.push(`    ssl_certificate /etc/letsencrypt/live/${conf.serverName}/fullchain.pem;`)
    lines.push(`    ssl_certificate_key /etc/letsencrypt/live/${conf.serverName}/privkey.pem;`)
    lines.push(`    ssl_protocols TLSv1.2 TLSv1.3;`)
    lines.push(`    ssl_ciphers HIGH:!aNULL:!MD5;`)
    lines.push('')
  }
  lines.push(`    # Logging`)
  lines.push(`    access_log /var/log/nginx/${conf.serverName}_access.log;`)
  lines.push(`    error_log /var/log/nginx/${conf.serverName}_error.log;`)
  lines.push('')
  // Redirects
  for (const r of conf.redirects) {
    if (r.from && r.to) {
      lines.push(`    location ${r.from} {`)
      lines.push(`        return 301 ${r.to};`)
      lines.push(`    }`)
      lines.push('')
    }
  }
  // Main location
  lines.push(`    location / {`)
  switch (conf.type) {
    case 'static':
      lines.push(`        root /var/www/${conf.serverName};`)
      lines.push(`        index index.html;`)
      lines.push(`        try_files $uri $uri/ =404;`)
      break
    case 'reverse-proxy':
      lines.push(`        proxy_pass ${conf.proxyPass};`)
      lines.push(`        proxy_http_version 1.1;`)
      lines.push(`        proxy_set_header Upgrade $http_upgrade;`)
      lines.push(`        proxy_set_header Connection 'upgrade';`)
      lines.push(`        proxy_set_header Host $host;`)
      lines.push(`        proxy_set_header X-Real-IP $remote_addr;`)
      lines.push(`        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`)
      lines.push(`        proxy_set_header X-Forwarded-Proto $scheme;`)
      lines.push(`        proxy_cache_bypass $http_upgrade;`)
      break
    case 'php':
      lines.push(`        root /var/www/${conf.serverName};`)
      lines.push(`        index index.php index.html;`)
      lines.push(`        try_files $uri $uri/ /index.php?$args;`)
      lines.push(`    }`)
      lines.push('')
      lines.push(`    location ~ \\.php$ {`)
      lines.push(`        include fastcgi_params;`)
      lines.push(`        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;`)
      lines.push(`        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;`)
      break
    case 'redirect':
      lines.push(`        return 301 ${conf.proxyPass};`)
      break
  }
  lines.push(`    }`)
  for (const d of conf.extraDirectives) {
    if (d.trim()) lines.push(`    ${d.trim()}`)
  }
  lines.push('}')
  return lines.join('\n')
}

export function NginxGen() {
  const [conf, setConf] = useState<NginxConfig>(DEFAULT_CONFIG)
  const output = useMemo(() => generateNginx(conf), [conf])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="label">Server name</span><input className="input font-mono" value={conf.serverName} onChange={(e) => setConf({ ...conf, serverName: e.target.value })} /></div>
        <div>
          <span className="label">Config type</span>
          <select className="input" value={conf.type} onChange={(e) => setConf({ ...conf, type: e.target.value as NginxConfig['type'] })}>
            <option value="static">Static files</option>
            <option value="reverse-proxy">Reverse proxy</option>
            <option value="php">PHP-FPM</option>
            <option value="redirect">Redirect</option>
          </select>
        </div>
        {conf.type === 'reverse-proxy' && <div><span className="label">Proxy pass</span><input className="input font-mono" value={conf.proxyPass} onChange={(e) => setConf({ ...conf, proxyPass: e.target.value })} /></div>}
        {conf.type === 'redirect' && <div><span className="label">Redirect to</span><input className="input font-mono" value={conf.proxyPass} onChange={(e) => setConf({ ...conf, proxyPass: e.target.value })} /></div>}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={conf.ssl} onChange={(e) => setConf({ ...conf, ssl: e.target.checked })} className="accent-indigo-600" />
          SSL (Let's Encrypt)
        </label>
      </div>
      <div>
        <span className="label">Redirects (from → to)</span>
        {conf.redirects.map((r, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input className="input font-mono text-xs flex-1" value={r.from} onChange={(e) => { const rd = [...conf.redirects]; rd[i] = { ...rd[i]!, from: e.target.value }; setConf({ ...conf, redirects: rd }) }} placeholder="/old-path" />
            <span className="text-zinc-400">→</span>
            <input className="input font-mono text-xs flex-1" value={r.to} onChange={(e) => { const rd = [...conf.redirects]; rd[i] = { ...rd[i]!, to: e.target.value }; setConf({ ...conf, redirects: rd }) }} placeholder="/new-path" />
            <button className="text-red-400 hover:text-red-600 text-xs" onClick={() => setConf({ ...conf, redirects: conf.redirects.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <button className="btn-secondary px-3 py-1 text-xs" onClick={() => setConf({ ...conf, redirects: [...conf.redirects, { from: '', to: '' }] })}>+ Add redirect</button>
      </div>
      <div>
        <span className="label">Generated nginx.conf</span>
        <pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed max-h-96">{output}</pre>
        <div className="mt-2 flex gap-2">
          <CopyButton text={output} label="Copy config" className="btn-primary" />
          <button className="btn-secondary text-xs" onClick={() => { navigator.clipboard.writeText(output) }}>Test with nginx -t</button>
        </div>
      </div>
    </div>
  )
}

/* ===== ASCII / Unicode Table ===== */

export function AsciiTable() {
  const [range, setRange] = useState<'ascii' | 'extended' | 'emoji'>('ascii')

  const chars = useMemo(() => {
    const result: { code: number; char: string; name: string }[] = []
    if (range === 'ascii') {
      for (let i = 0; i < 128; i++) {
        const names: Record<number, string> = { 0: 'NUL', 1: 'SOH', 2: 'STX', 3: 'ETX', 4: 'EOT', 5: 'ENQ', 6: 'ACK', 7: 'BEL', 8: 'BS', 9: 'TAB', 10: 'LF', 11: 'VT', 12: 'FF', 13: 'CR', 14: 'SO', 15: 'SI', 16: 'DLE', 17: 'DC1', 18: 'DC2', 19: 'DC3', 20: 'DC4', 21: 'NAK', 22: 'SYN', 23: 'ETB', 24: 'CAN', 25: 'EM', 26: 'SUB', 27: 'ESC', 28: 'FS', 29: 'GS', 30: 'RS', 31: 'US', 32: 'SPACE', 127: 'DEL' }
        result.push({ code: i, char: i < 32 || i === 127 ? names[i] || '?' : String.fromCharCode(i), name: names[i] || `Char ${i}` })
      }
    } else if (range === 'extended') {
      for (let i = 128; i < 256; i++) {
        result.push({ code: i, char: String.fromCharCode(i), name: `U+${i.toString(16).toUpperCase().padStart(4, '0')}` })
      }
    } else {
      const emojis = '😀😁😂🤣😃😄😅😆😉😊😋😎😍🥰😘😗😙😚🙂🤔🤫🤨😐😑😶😏😒🙄😬🤥😌😔😪🤤😴😷🤒🤕🤢🤮🤧🥵🥶🥴😵🤯🤠🥳🥸😎🤓🧐😕😟🙁😮😯😲😳🥺😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀☠️👻👽👾🤖😺😸😻😼😽🙀😿😾🙈🙉🙊💋💌💘💝💖💗💘💝💖💕💞💓💗💖💘💝'
      for (const e of emojis) {
        const cp = e.codePointAt(0)!
        result.push({ code: cp, char: e, name: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}` })
      }
    }
    return result
  }, [range])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['ascii', 'extended', 'emoji'] as const).map((r) => (
          <button key={r} className={range === r ? 'btn-primary px-3 py-1.5 text-xs capitalize' : 'btn-secondary px-3 py-1.5 text-xs capitalize'} onClick={() => setRange(r)}>{r}</button>
        ))}
      </div>
      <div className="card overflow-auto max-h-96">
        <div className="grid grid-cols-8 gap-1 p-3 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20">
          {chars.map((c) => (
            <button
              key={c.code}
              title={`${c.name} (${c.code})`}
              onClick={() => navigator.clipboard.writeText(c.char)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-lg transition-all hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950"
            >
              {c.char}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-400">Click any character to copy it. {chars.length} characters shown.</p>
    </div>
  )
}

/* ===== Timestamp Converter ===== */

export function TimestampConverter() {
  const [input, setInput] = useState(() => Math.floor(Date.now() / 1000).toString())
  const [mode, setMode] = useState<'unix' | 'date'>('unix')

  const now = Date.now()
  const fromUnix = useMemo(() => {
    const ts = parseInt(input) * (input.length <= 10 ? 1000 : 1)
    if (isNaN(ts) || ts < 0) return null
    const d = new Date(ts)
    return {
      iso: d.toISOString(),
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      relative: getRelativeTime(d),
      ms: ts,
      seconds: Math.floor(ts / 1000),
    }
  }, [input])

  const fromDate = useMemo(() => {
    if (mode !== 'date') return null
    const d = new Date(input)
    if (isNaN(d.getTime())) return null
    return {
      unix_s: Math.floor(d.getTime() / 1000),
      unix_ms: d.getTime(),
      iso: d.toISOString(),
    }
  }, [input, mode])

  function getRelativeTime(d: Date): string {
    const diff = now - d.getTime()
    const abs = Math.abs(diff)
    const future = diff < 0
    const prefix = future ? 'in ' : ''
    const suffix = future ? '' : ' ago'
    if (abs < 60000) return `${prefix}${Math.floor(abs / 1000)}s${suffix}`
    if (abs < 3600000) return `${prefix}${Math.floor(abs / 60000)}m${suffix}`
    if (abs < 86400000) return `${prefix}${Math.floor(abs / 3600000)}h${suffix}`
    if (abs < 2592000000) return `${prefix}${Math.floor(abs / 86400000)}d${suffix}`
    return `${prefix}${Math.floor(abs / 2592000000)}mo${suffix}`
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={mode === 'unix' ? 'btn-primary px-3 py-1.5 text-xs' : 'btn-secondary px-3 py-1.5 text-xs'} onClick={() => { setMode('unix'); setInput(Math.floor(Date.now() / 1000).toString()) }}>Unix → Date</button>
        <button className={mode === 'date' ? 'btn-primary px-3 py-1.5 text-xs' : 'btn-secondary px-3 py-1.5 text-xs'} onClick={() => { setMode('date'); setInput(new Date().toISOString()) }}>Date → Unix</button>
      </div>
      <div>
        <span className="label">{mode === 'unix' ? 'Unix timestamp (seconds)' : 'Date / ISO string'}</span>
        <input className="input font-mono text-lg" value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'unix' ? '1724553600' : '2024-08-25T12:00:00Z'} />
      </div>
      {mode === 'unix' && fromUnix && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['ISO 8601', fromUnix.iso],
            ['UTC', fromUnix.utc],
            ['Local', fromUnix.local],
            ['Relative', fromUnix.relative],
            ['Milliseconds', fromUnix.ms.toString()],
            ['Seconds', fromUnix.seconds.toString()],
          ].map(([label, val]) => (
            <div key={label} className="card flex items-center justify-between p-4">
              <div>
                <span className="label">{label}</span>
                <span className="block font-mono text-sm">{val}</span>
              </div>
              <CopyButton text={val} className="btn-secondary px-2 py-1 text-xs" />
            </div>
          ))}
        </div>
      )}
      {mode === 'date' && fromDate && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Unix (seconds)', fromDate.unix_s.toString()],
            ['Unix (milliseconds)', fromDate.unix_ms.toString()],
            ['ISO 8601', fromDate.iso],
          ].map(([label, val]) => (
            <div key={label} className="card flex items-center justify-between p-4">
              <div>
                <span className="label">{label}</span>
                <span className="block font-mono text-sm">{val}</span>
              </div>
              <CopyButton text={val} className="btn-secondary px-2 py-1 text-xs" />
            </div>
          ))}
        </div>
      )}
      {mode === 'unix' && !fromUnix && input && <p className="text-sm text-red-500">Invalid timestamp</p>}
      {mode === 'date' && !fromDate && input && <p className="text-sm text-red-500">Invalid date string</p>}
    </div>
  )
}
