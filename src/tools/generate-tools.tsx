import { useMemo, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { copyText, downloadBlob } from '../lib/utils'
import { CopyButton, ErrorNote, FileDrop, TextArea } from '../components/ui'

/* ===== Favicon Generator ===== */

interface FavResult { size: number; url: string; blob: Blob }
const FAV_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 512]
function faviconName(s: number) { return s === 16 ? 'favicon-16x16.png' : s === 32 ? 'favicon-32x32.png' : s === 180 ? 'apple-touch-icon.png' : `favicon-${s}x${s}.png` }

export function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<FavResult[]>([])
  const [busy, setBusy] = useState(false)

  async function generate() {
    if (!file) return; setBusy(true)
    try {
      const bmp = await createImageBitmap(file)
      const side = Math.min(bmp.width, bmp.height)
      const out: FavResult[] = []
      for (const size of FAV_SIZES) {
        const c = document.createElement('canvas'); c.width = size; c.height = size
        const ctx = c.getContext('2d')!; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size)
        const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'))
        if (blob) out.push({ size, blob, url: URL.createObjectURL(blob) })
      }
      setResults(out)
    } finally { setBusy(false) }
  }

  const snippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">`

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop accept="image/*" hint="Use a square image at least 512×512" onFiles={(fs) => setFile(fs[0] ?? null)} />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">Source: <span className="font-medium text-zinc-900 dark:text-white">{file.name}</span></p>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy} onClick={generate}>{busy ? 'Generating…' : 'Generate favicons'}</button>
            <button className="btn-secondary" onClick={() => setFile(null)}>Choose another</button>
          </div>
          {results.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {results.map((r) => (
                  <div key={r.size} className="card flex flex-col items-center gap-2 p-3">
                    <img src={r.url} width={48} height={48} alt={`${r.size}px`} className="rounded bg-zinc-100 dark:bg-zinc-800" />
                    <span className="font-mono text-xs text-zinc-500">{r.size}×{r.size}</span>
                    <button className="btn-secondary px-2 py-1 text-xs" onClick={() => downloadBlob(r.blob, faviconName(r.size))}><Download className="h-3 w-3" /> Save</button>
                  </div>
                ))}
              </div>
              <button className="btn-secondary" onClick={() => results.forEach((r, i) => setTimeout(() => downloadBlob(r.blob, faviconName(r.size)), i * 300))}><Download className="h-4 w-4" /> Download all</button>
              <div><span className="label">HTML snippet</span><pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed">{snippet}</pre><div className="mt-2"><CopyButton text={snippet} label="Copy HTML" /></div></div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ===== .gitignore Generator ===== */

const GITIGNORES: Record<string, string> = {
  'Node.js': 'node_modules/\ndist/\n.env\n.env.local\n*.log\n.DS_Store',
  'React / Vite': 'node_modules/\ndist/\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n*.log\n.DS_Store\n.vite/',
  'Python': '__pycache__/\n*.pyc\n*.pyo\n.env\nvenv/\n.venv/\n*.egg-info/\ndist/\nbuild/\n.pytest_cache/\n.mypy_cache/',
  'Go': 'bin/\n*.exe\nvendor/\n.env\n*.test\ncover.out\ncoverage.html',
  'Rust': 'target/\nCargo.lock\n*.swp\n*.swo\n.env',
  'Java': '*.class\n*.jar\n*.war\nbuild/\n.gradle/\n.idea/\n*.iml\n.DS_Store',
  'Docker': '*.log\n.env\nnode_modules/\ndist/\n.DS_Store\n__pycache__/',
  'Unity': 'Library/\nTemp/\nObj/\nBuild/\nBuilds/\nLogs/\nUserSettings/\n.vs/\n*.csproj\n*.sln',
  'Flutter': '.dart_tool/\n.packages\nbuild/\n.flutter-plugins\n.flutter-plugins-dependencies\n*.lock\n.env',
  'Laravel': 'vendor/\nnode_modules/\n.env\n.env.backup\nstorage/\nbootstrap/cache/\npublic/hot\npublic/storage',
}

export function GitignoreGen() {
  const [selected, setSelected] = useState<string[]>(['React / Vite'])
  const output = selected.map((k) => `# ${k}\n${GITIGNORES[k]}`).join('\n\n')
  function toggle(k: string) { setSelected((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]) }
  return (
    <div className="space-y-4">
      <span className="label">Select your tech stack</span>
      <div className="flex flex-wrap gap-2">
        {Object.keys(GITIGNORES).map((k) => <button key={k} className={selected.includes(k) ? 'btn-primary px-3 py-1.5 text-xs' : 'btn-secondary px-3 py-1.5 text-xs'} onClick={() => toggle(k)}>{k}</button>)}
      </div>
      <div className="space-y-2"><span className="label">.gitignore</span><pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed">{output}</pre><CopyButton text={output} label="Copy .gitignore" className="btn-primary" /></div>
    </div>
  )
}

/* ===== License Generator ===== */

const LICENSES: Record<string, string> = {
  MIT: `MIT License\n\nCopyright (c) ${new Date().getFullYear()} Your Name\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
  'Apache 2.0': `Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/\n\nCopyright ${new Date().getFullYear()} Your Name\n\nLicensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at\n\nhttp://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.`,
  'GPL 3.0': `GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007\n\nCopyright (C) ${new Date().getFullYear()} Your Name\n\nThis program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\n\nThis program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.`,
  ISC: `ISC License\n\nCopyright (c) ${new Date().getFullYear()}, Your Name\n\nPermission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.\n\nTHE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`,
}

export function LicenseGen() {
  const [selected, setSelected] = useState('MIT')
  const [name, setName] = useState('')
  const output = LICENSES[selected]?.replace('Your Name', name || 'Your Name') ?? ''
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(LICENSES).map((k) => <button key={k} className={selected === k ? 'btn-primary px-3 py-1.5' : 'btn-secondary px-3 py-1.5'} onClick={() => setSelected(k)}>{k}</button>)}
      </div>
      <div><span className="label">Your name / organization</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" /></div>
      <div className="space-y-2"><span className="label">LICENSE</span><pre className="card max-h-80 overflow-auto p-4 font-mono text-xs leading-relaxed">{output}</pre><CopyButton text={output} label="Copy LICENSE" className="btn-primary" /></div>
    </div>
  )
}

/* ===== Docker Compose Generator ===== */

const DOCKER_SERVICES: Record<string, { image: string; ports: string; env?: string }> = {
  'Node.js': { image: 'node:20-alpine', ports: '3000:3000', env: 'NODE_ENV=development' },
  'PostgreSQL': { image: 'postgres:16-alpine', ports: '5432:5432', env: 'POSTGRES_DB=mydb\nPOSTGRES_USER=user\nPOSTGRES_PASSWORD=secret' },
  'MySQL': { image: 'mysql:8', ports: '3306:3306', env: 'MYSQL_ROOT_PASSWORD=secret\nMYSQL_DATABASE=mydb' },
  'Redis': { image: 'redis:7-alpine', ports: '6379:6379' },
  'MongoDB': { image: 'mongo:7', ports: '27017:27017' },
  'Nginx': { image: 'nginx:alpine', ports: '80:80\n443:443' },
  'PHP': { image: 'php:8.3-fpm', ports: '9000:9000' },
  'Elasticsearch': { image: 'elasticsearch:8.12.0', ports: '9200:9200', env: 'discovery.type=single-node\nxpack.security.enabled=false' },
  'MinIO': { image: 'minio/minio', ports: '9001:9001', env: 'MINIO_ROOT_USER=admin\nMINIO_ROOT_PASSWORD=password' },
}

export function DockerGen() {
  const [selected, setSelected] = useState<string[]>(['Node.js'])
  const output = (() => {
    const services: string[] = []
    for (const name of selected) {
      const s = DOCKER_SERVICES[name]; if (!s) continue
      let svc = `  ${name.toLowerCase()}:\n    image: ${s.image}\n    ports:\n      - "${s.ports}"`
      if (s.env) svc += `\n    environment:\n${s.env.split('\n').map((l) => `      - ${l}`).join('\n')}`
      services.push(svc)
    }
    return `version: "3.8"\n\nservices:\n${services.join('\n\n')}\n`
  })()
  function toggle(k: string) { setSelected((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]) }
  return (
    <div className="space-y-4">
      <span className="label">Select services</span>
      <div className="flex flex-wrap gap-2">
        {Object.keys(DOCKER_SERVICES).map((k) => <button key={k} className={selected.includes(k) ? 'btn-primary px-3 py-1.5 text-xs' : 'btn-secondary px-3 py-1.5 text-xs'} onClick={() => toggle(k)}>{k}</button>)}
      </div>
      <div className="space-y-2"><span className="label">docker-compose.yml</span><pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed">{output}</pre><CopyButton text={output} label="Copy docker-compose.yml" className="btn-primary" /></div>
    </div>
  )
}

/* ===== Cron Expression Generator ===== */

const CRON_PRESETS: { label: string; expr: string }[] = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Every 6 hours', expr: '0 */6 * * *' },
  { label: 'Every day at midnight', expr: '0 0 * * *' },
  { label: 'Every day at 9 AM', expr: '0 9 * * *' },
  { label: 'Every Monday at 9 AM', expr: '0 9 * * 1' },
  { label: 'First of every month', expr: '0 0 1 * *' },
  { label: 'Every year on Jan 1', expr: '0 0 1 1 *' },
]

export function CronGen() {
  const [min, setMin] = useState('*')
  const [hour, setHour] = useState('*')
  const [dom, setDom] = useState('*')
  const [mon, setMon] = useState('*')
  const [dow, setDow] = useState('*')
  const expr = `${min} ${hour} ${dom} ${mon} ${dow}`

  const humanReadable = useMemo(() => {
    const parts: string[] = []
    if (min !== '*' && !min.startsWith('*/')) parts.push(`At minute ${min}`)
    else if (min.startsWith('*/')) parts.push(`Every ${min.slice(2)} minutes`)
    else parts.push('Every minute')
    if (hour !== '*' && !hour.startsWith('*/')) parts.push(`at hour ${hour}`)
    else if (hour.startsWith('*/')) parts.push(`every ${hour.slice(2)} hours`)
    if (dom !== '*') parts.push(`on day ${dom}`)
    if (mon !== '*') parts.push(`in month ${mon}`)
    if (dow !== '*') { const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; parts.push(`on ${days[+dow] ?? dow}`) }
    return parts.join(', ')
  }, [min, hour, dom, mon, dow])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        {([['Minute', min, setMin], ['Hour', hour, setHour], ['Day of month', dom, setDom], ['Month', mon, setMon], ['Day of week', dow, setDow]] as const).map(([label, val, set]) => (
          <div key={label}><span className="label text-center">{label}</span><input className="input text-center font-mono" value={val} onChange={(e) => set(e.target.value)} /></div>
        ))}
      </div>
      <div className="card p-4 text-center"><p className="font-mono text-lg font-bold">{expr}</p><p className="mt-1 text-sm text-zinc-500">{humanReadable}</p></div>
      <span className="label">Quick presets</span>
      <div className="flex flex-wrap gap-2">
        {CRON_PRESETS.map((p) => <button key={p.expr} className="btn-secondary px-3 py-1.5 text-xs" onClick={() => { const [m, h, d, mo, w] = p.expr.split(' '); setMin(m!); setHour(h!); setDom(d!); setMon(mo!); setDow(w!) }}>{p.label}</button>)}
      </div>
      <CopyButton text={expr} label="Copy cron expression" className="btn-primary" />
    </div>
  )
}

/* ===== Lorem Ipsum Generator ===== */

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
  const [output, setOutput] = useState('')
  const CLASSIC = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

  function generate() {
    let out = ''
    if (unit === 'paragraphs') {
      out = Array.from({ length: count }, (_, p) => {
        const sents = Array.from({ length: 3 + Math.floor(Math.random() * 4) }, () => randSentence(8, 18))
        if (p === 0) sents[0] = CLASSIC
        return sents.join(' ')
      }).join('\n\n')
    } else if (unit === 'sentences') {
      const sents = Array.from({ length: count }, () => randSentence(8, 18))
      sents[0] = CLASSIC
      out = sents.join(' ')
    } else {
      out = Array.from({ length: count }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(' ')
      if (out) out = out[0]!.toUpperCase() + out.slice(1) + '.'
    }
    setOutput(out)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="label">Amount</span><input type="number" min={1} max={100} className="input" value={count} onChange={(e) => setCount(Math.min(100, Math.max(1, +e.target.value)))} /></div>
        <div><span className="label">Unit</span><select className="input" value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)}><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div>
      </div>
      <button className="btn-primary" onClick={generate}>Generate</button>
      {output && <div className="space-y-3"><TextArea readOnly value={output} className="min-h-40 bg-zinc-50 dark:bg-zinc-800" /><CopyButton text={output} label="Copy text" className="btn-primary" /></div>}
    </div>
  )
}

/* ===== Slug Generator ===== */

export function SlugGenerator() {
  const [title, setTitle] = useState('')
  const [sep, setSep] = useState<'-' | '_'>('-')
  const slug = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s-_]/g, '').trim().toLowerCase().replace(/[\s_]+/g, sep).replace(new RegExp(`\\${sep}{2,}`, 'g'), sep).replace(new RegExp(`^\\${sep}|\\${sep}$`, 'g'), '')
  return (
    <div className="space-y-4">
      <div><span className="label">Title / headline</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="10 Best Coffee Shops in Melbourne" /></div>
      <div className="flex items-center gap-4"><span className="label mb-0">Separator</span>{(['-', '_'] as const).map((s) => <label key={s} className="flex items-center gap-1.5 font-mono text-sm"><input type="radio" checked={sep === s} onChange={() => setSep(s)} className="accent-indigo-600" /> {s}</label>)}</div>
      <div className="card p-5"><span className="label">Slug ({slug.length} chars)</span><p className="break-all font-mono text-lg">{slug || <span className="text-zinc-400">your-slug-appears-here</span>}</p></div>
      {slug && <CopyButton text={slug} label="Copy slug" className="btn-primary" />}
    </div>
  )
}
