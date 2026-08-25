import { useEffect, useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { baseName, copyText, downloadBlob, formatBytes } from '../lib/utils'
import { CopyButton, ErrorNote, FileDrop, Stat } from '../components/ui'

/* ---------------- shared helpers ---------------- */

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file)
  const c = document.createElement('canvas')
  c.width = bmp.width
  c.height = bmp.height
  c.getContext('2d')!.drawImage(bmp, 0, 0)
  return c
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('Encoding failed'))), type, quality),
  )
}

/* ---------------- Image Compressor ---------------- */

interface CompressResult {
  name: string
  origSize: number
  blob: Blob
}

export function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState(70)
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg')
  const [results, setResults] = useState<CompressResult[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function compress() {
    setBusy(true)
    setError('')
    try {
      const out: CompressResult[] = []
      for (const f of files) {
        const canvas = await fileToCanvas(f)
        const blob = await canvasToBlob(canvas, format, quality / 100)
        out.push({ name: f.name, origSize: f.size, blob })
      }
      setResults(out)
    } catch {
      setError('One of the images could not be processed.')
    } finally {
      setBusy(false)
    }
  }

  const origTotal = results.reduce((s, r) => s + r.origSize, 0)
  const newTotal = results.reduce((s, r) => s + r.blob.size, 0)

  return (
    <div className="space-y-4">
      <FileDrop multiple accept="image/*" hint="Photos work best — try WebP for the smallest files" onFiles={(fs) => { setFiles(fs.filter((f) => f.type.startsWith('image/'))); setResults([]) }} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Quality: {quality}%</span>
          <input type="range" min={10} max={95} value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full accent-indigo-600" />
        </div>
        <div>
          <span className="label">Output format</span>
          <select className="input" value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
            <option value="image/jpeg">JPEG (universal)</option>
            <option value="image/webp">WebP (smallest)</option>
          </select>
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <button className="btn-primary w-full sm:w-auto" disabled={!files.length || busy} onClick={compress}>
        {busy ? 'Compressing…' : `Compress ${files.length || ''} image${files.length === 1 ? '' : 's'}`}
      </button>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Original" value={formatBytes(origTotal)} />
            <Stat label="Compressed" value={formatBytes(newTotal)} />
            <Stat label="Saved" value={`${Math.max(0, Math.round((1 - newTotal / origTotal) * 100))}%`} />
          </div>
          <ul className="card divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.map((r, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="flex-1 truncate font-medium">{r.name}</span>
                <span className="text-zinc-400">{formatBytes(r.origSize)} → {formatBytes(r.blob.size)}</span>
                <button className="btn-secondary px-2.5 py-1.5" onClick={() => downloadBlob(r.blob, `${baseName(r.name)}-min.${format === 'image/webp' ? 'webp' : 'jpg'}`)}>
                  <Download className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/* ---------------- Image Resizer ---------------- */

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null)
  const [natural, setNatural] = useState({ w: 0, h: 0 })
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lock, setLock] = useState(true)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!file) return
    createImageBitmap(file).then((bmp) => {
      setNatural({ w: bmp.width, h: bmp.height })
      setWidth(bmp.width)
      setHeight(bmp.height)
      setPreviewUrl(URL.createObjectURL(file))
    }).catch(() => setError('Could not read that image.'))
  }, [file])

  function setW(w: number) {
    setWidth(w)
    if (lock && natural.w) setHeight(Math.round((w * natural.h) / natural.w))
  }
  function setH(h: number) {
    setHeight(h)
    if (lock && natural.h) setWidth(Math.round((h * natural.w) / natural.h))
  }

  async function resize() {
    if (!file) return
    setError('')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, width)
      canvas.height = Math.max(1, height)
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(await createImageBitmap(file), 0, 0, canvas.width, canvas.height)
      const blob = await canvasToBlob(canvas, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
      downloadBlob(blob, `${baseName(file.name)}-${width}x${height}.${file.type === 'image/png' ? 'png' : 'jpg'}`)
    } catch {
      setError('Resize failed.')
    }
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop accept="image/*" hint="PNG, JPG or WebP" onFiles={(fs) => setFile(fs[0] ?? null)} />
      ) : (
        <div className="space-y-4">
          {previewUrl && <img src={previewUrl} alt="preview" className="mx-auto max-h-56 rounded-xl border border-zinc-200 dark:border-zinc-700" />}
          <p className="text-center text-xs text-zinc-400">{file.name} — original {natural.w}×{natural.h}px</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <span className="label">Width (px)</span>
              <input type="number" className="input" value={width || ''} onChange={(e) => setW(+e.target.value)} />
            </div>
            <button
              className={`btn-secondary px-3 ${lock ? 'text-indigo-500' : ''}`}
              title="Lock aspect ratio"
              onClick={() => setLock(!lock)}
            >🔗</button>
            <div className="flex-1">
              <span className="label">Height (px)</span>
              <input type="number" className="input" value={height || ''} onChange={(e) => setH(+e.target.value)} />
            </div>
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
          <div className="flex gap-2">
            <button className="btn-primary flex-1 sm:flex-none" onClick={resize}>Resize &amp; Download</button>
            <button className="btn-secondary" onClick={() => { setFile(null); setError('') }}>Choose another</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Image Converter ---------------- */

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([])
  const [target, setTarget] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(0)

  const ext = target === 'image/png' ? 'png' : target === 'image/jpeg' ? 'jpg' : 'webp'

  async function convert() {
    setBusy(true)
    setDone(0)
    for (const f of files) {
      try {
        const canvas = await fileToCanvas(f)
        const blob = await canvasToBlob(canvas, target, target === 'image/png' ? undefined : 0.9)
        downloadBlob(blob, `${baseName(f.name)}.${ext}`)
        setDone((d) => d + 1)
        await new Promise((r) => setTimeout(r, 250))
      } catch {
        /* skip bad file */
      }
    }
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <FileDrop multiple accept="image/*" hint="Convert to PNG, JPEG or WebP" onFiles={(fs) => setFiles(fs.filter((f) => f.type.startsWith('image/')))} />
      <div>
        <span className="label">Convert to</span>
        <select className="input max-w-xs" value={target} onChange={(e) => setTarget(e.target.value as typeof target)}>
          <option value="image/webp">WebP — modern &amp; small</option>
          <option value="image/jpeg">JPEG — photos</option>
          <option value="image/png">PNG — transparency</option>
        </select>
      </div>
      <button className="btn-primary w-full sm:w-auto" disabled={!files.length || busy} onClick={convert}>
        {busy ? `Converting… ${done}/${files.length}` : `Convert to ${ext.toUpperCase()}`}
      </button>
    </div>
  )
}

/* ---------------- Base64 Image Encoder/Decoder ---------------- */

export function Base64Image() {
  const [tab, setTab] = useState<'encode' | 'decode'>('encode')
  const [dataUrl, setDataUrl] = useState('')

  async function encode(files: File[]) {
    const f = files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setDataUrl(String(reader.result))
    reader.readAsDataURL(f)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={tab === 'encode' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('encode')}>Encode → Base64</button>
        <button className={tab === 'decode' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('decode')}>Decode ← Base64</button>
      </div>

      {tab === 'encode' ? (
        <>
          <FileDrop accept="image/*" hint="Outputs a data URL you can paste into HTML/CSS" onFiles={encode} />
          {dataUrl && (
            <div className="space-y-3">
              <img src={dataUrl} alt="encoded preview" className="max-h-40 rounded-xl border border-zinc-200 dark:border-zinc-700" />
              <textarea readOnly value={dataUrl} className="input h-32 font-mono text-[11px]" onFocus={(e) => e.currentTarget.select()} />
              <CopyButton text={dataUrl} label="Copy data URL" className="btn-primary" />
            </div>
          )}
        </>
      ) : (
        <DecodeTab />
      )}
    </div>
  )
}

function DecodeTab() {
  const [raw, setRaw] = useState('')
  const valid = /^data:image\/[a-z+]+;base64,/.test(raw.trim())
  async function save() {
    try {
      const res = await fetch(raw.trim())
      const blob = await res.blob()
      downloadBlob(blob, `decoded.${blob.type.split('/')[1] ?? 'png'}`)
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="space-y-3">
      <textarea
        className="input h-32 font-mono text-[11px]"
        placeholder="Paste a data URL starting with data:image/…"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      {valid && (
        <>
          <img src={raw.trim()} alt="decoded" className="max-h-40 rounded-xl border border-zinc-200 dark:border-zinc-700" />
          <button className="btn-primary" onClick={save}><Download className="h-4 w-4" /> Download image</button>
        </>
      )}
      {raw && !valid && <ErrorNote>That doesn't look like a valid image data URL.</ErrorNote>}
    </div>
  )
}

/* ---------------- Favicon Generator ---------------- */

interface FavResult {
  size: number
  url: string
  blob: Blob
}

export function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<FavResult[]>([])
  const [busy, setBusy] = useState(false)
  const sizes = [16, 32, 48, 64, 96, 128, 180, 192, 512]

  async function generate() {
    if (!file) return
    setBusy(true)
    try {
      const bmp = await createImageBitmap(file)
      const side = Math.min(bmp.width, bmp.height)
      const out: FavResult[] = []
      for (const size of sizes) {
        const c = document.createElement('canvas')
        c.width = size
        c.height = size
        const ctx = c.getContext('2d')!
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        // center-crop square
        ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size)
        const blob = await canvasToBlob(c, 'image/png')
        out.push({ size, blob, url: URL.createObjectURL(blob) })
      }
      setResults(out)
    } finally {
      setBusy(false)
    }
  }

  const snippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">`

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop accept="image/*" hint="Use a square image at least 512×512 for best results" onFiles={(fs) => setFile(fs[0] ?? null)} />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">Source: <span className="font-medium text-zinc-900 dark:text-white">{file.name}</span></p>
          <button className="btn-primary" disabled={busy} onClick={generate}>{busy ? 'Generating…' : 'Generate favicons'}</button>
          {results.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {results.map((r) => (
                  <div key={r.size} className="card flex flex-col items-center gap-2 p-3">
                    <img src={r.url} width={48} height={48} alt={`${r.size}px`} className="rounded bg-zinc-100 dark:bg-zinc-800" />
                    <span className="font-mono text-xs text-zinc-500">{r.size}×{r.size}</span>
                    <button className="btn-secondary px-2 py-1 text-xs" onClick={() => downloadBlob(r.blob, faviconName(r.size))}>
                      <Download className="h-3 w-3" /> Save
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn-secondary"
                onClick={() => results.forEach((r, i) => setTimeout(() => downloadBlob(r.blob, faviconName(r.size)), i * 300))}
              >
                <Download className="h-4 w-4" /> Download all ({sizes.length} files)
              </button>
              <div>
                <span className="label">HTML snippet</span>
                <pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed">{snippet}</pre>
                <div className="mt-2"><CopyButton text={snippet} label="Copy HTML snippet" /></div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function faviconName(size: number): string {
  if (size === 16) return 'favicon-16x16.png'
  if (size === 32) return 'favicon-32x32.png'
  if (size === 180) return 'apple-touch-icon.png'
  return `favicon-${size}x${size}.png`
}
