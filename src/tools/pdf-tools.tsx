import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ArrowDown, ArrowUp, Download, Trash2 } from 'lucide-react'
import { baseName, downloadBlob, formatBytes } from '../lib/utils'
import { ErrorNote, FileDrop } from '../components/ui'

/* ---------------- Merge PDF ---------------- */

export function MergePdf() {
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function merge() {
    setBusy(true)
    setError('')
    try {
      const out = await PDFDocument.create()
      for (const f of files) {
        const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true })
        const pages = await out.copyPages(src, src.getPageIndices())
        pages.forEach((p) => out.addPage(p))
      }
      const bytes = await out.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), 'merged.pdf')
    } catch {
      setError('Could not merge — one of the files may be corrupted or password-protected.')
    } finally {
      setBusy(false)
    }
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...files]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setFiles(next)
  }

  return (
    <div className="space-y-4">
      <FileDrop
        accept="application/pdf"
        multiple
        hint="PDF files only — processed on your device"
        onFiles={(fs) => setFiles((prev) => [...prev, ...fs.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))])}
      />

      {files.length > 0 && (
        <ul className="card divide-y divide-zinc-100 dark:divide-zinc-800">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="w-6 text-center font-mono text-xs text-zinc-400">{i + 1}</span>
              <span className="flex-1 truncate font-medium">{f.name}</span>
              <span className="text-zinc-400">{formatBytes(f.size)}</span>
              <button className="btn-secondary px-2 py-1" aria-label="Move up" onClick={() => move(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></button>
              <button className="btn-secondary px-2 py-1" aria-label="Move down" onClick={() => move(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></button>
              <button className="btn-secondary px-2 py-1 text-red-500" aria-label="Remove" onClick={() => setFiles(files.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      <button className="btn-primary w-full sm:w-auto" disabled={files.length < 2 || busy} onClick={merge}>
        <Download className="h-4 w-4" /> {busy ? 'Merging…' : `Merge ${files.length} PDFs`}
      </button>
    </div>
  )
}

/* ---------------- Split PDF ---------------- */

function parseRanges(input: string, max: number): number[] {
  const set = new Set<number>()
  for (const part of input.split(',')) {
    const t = part.trim()
    if (!t) continue
    const m = t.match(/^(\d+)\s*-\s*(\d+)$/)
    if (m) {
      let a = parseInt(m[1]!, 10)
      let b = parseInt(m[2]!, 10)
      if (a > b) [a, b] = [b, a]
      for (let i = a; i <= b; i++) if (i >= 1 && i <= max) set.add(i - 1)
    } else {
      const n = parseInt(t, 10)
      if (n >= 1 && n <= max) set.add(n - 1)
    }
  }
  return [...set].sort((a, b) => a - b)
}

export function SplitPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'extract' | 'remove' | 'each'>('extract')
  const [ranges, setRanges] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
      const total = src.getPageCount()
      const picked = parseRanges(ranges, total)

      if (mode === 'each') {
        for (const idx of src.getPageIndices()) {
          const doc = await PDFDocument.create()
          const [page] = await doc.copyPages(src, [idx])
          doc.addPage(page)
          downloadBlob(new Blob([new Uint8Array(await doc.save())], { type: 'application/pdf' }), `${baseName(file.name)}-p${idx + 1}.pdf`)
          await new Promise((r) => setTimeout(r, 300))
        }
      } else if (picked.length === 0) {
        throw new Error('empty')
      } else {
        const indices =
          mode === 'remove'
            ? src.getPageIndices().filter((i) => !picked.includes(i))
            : picked
        if (indices.length === 0) throw new Error('all-removed')
        const doc = await PDFDocument.create()
        const pages = await doc.copyPages(src, indices)
        pages.forEach((p) => doc.addPage(p))
        downloadBlob(new Blob([new Uint8Array(await doc.save())], { type: 'application/pdf' }), `${baseName(file.name)}-${mode === 'remove' ? 'without' : 'pages'}-${ranges.replace(/,\s*/g, '-')}.pdf`)
      }
    } catch (e) {
      setError(e instanceof Error && e.message === 'empty'
        ? 'Enter at least one page number or range.'
        : e instanceof Error && e.message === 'all-removed'
          ? 'That would remove every page.'
          : 'Could not process this PDF — it may be corrupted or password-protected.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop accept="application/pdf" hint="One PDF file" onFiles={(fs) => setFile(fs[0] ?? null)} />
      ) : (
        <div className="card flex items-center gap-3 p-4 text-sm">
          <span className="flex-1 truncate font-medium">{file.name}</span>
          <button className="btn-secondary px-2 py-1 text-red-500" onClick={() => setFile(null)}><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Mode</span>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
            <option value="extract">Extract pages into one PDF</option>
            <option value="remove">Remove listed pages</option>
            <option value="each">Split every page into its own file</option>
          </select>
        </div>
        {mode !== 'each' && (
          <div>
            <span className="label">Pages (e.g. 1-3, 5, 8)</span>
            <input className="input" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3, 5, 8" />
          </div>
        )}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <button className="btn-primary w-full sm:w-auto" disabled={!file || busy} onClick={run}>
        <Download className="h-4 w-4" /> {busy ? 'Working…' : 'Process PDF'}
      </button>
    </div>
  )
}

/* ---------------- Images to PDF ---------------- */

/** Re-encode oversized images so PDFs stay a sane size; pass through normal JPG/PNG untouched. */
async function prepImage(f: File): Promise<{ bytes: Uint8Array; kind: 'png' | 'jpg' }> {
  const bmp = await createImageBitmap(f)
  const MAX = 2200
  const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height))
  const isPng = f.type === 'image/png'
  if (scale === 1 && (isPng || f.type === 'image/jpeg')) {
    return { bytes: new Uint8Array(await f.arrayBuffer()), kind: isPng ? 'png' : 'jpg' }
  }
  const w = Math.max(1, Math.round(bmp.width * scale))
  const h = Math.max(1, Math.round(bmp.height * scale))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bmp, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, isPng ? 'image/png' : 'image/jpeg', 0.92))
  if (!blob) throw new Error('encode-failed')
  return { bytes: new Uint8Array(await blob.arrayBuffer()), kind: isPng ? 'png' : 'jpg' }
}

export function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function convert() {
    setBusy(true)
    setError('')
    try {
      const doc = await PDFDocument.create()
      for (const f of files) {
        const prepared = await prepImage(f)
        const img =
          prepared.kind === 'png'
            ? await doc.embedPng(prepared.bytes)
            : await doc.embedJpg(prepared.bytes)
        const page = doc.addPage([img.width, img.height])
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
      }
      downloadBlob(new Blob([new Uint8Array(await doc.save())], { type: 'application/pdf' }), files.length === 1 ? `${baseName(files[0]!.name)}.pdf` : 'images.pdf')
    } catch {
      setError('Conversion failed — one of the images could not be read.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <FileDrop
        multiple
        accept="image/*"
        hint="JPG, PNG or WebP"
        onFiles={(fs) => setFiles((prev) => [...prev, ...fs.filter((f) => f.type.startsWith('image/'))])}
      />
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900">
              {f.name} · {formatBytes(f.size)}
              <button className="text-red-500" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
      <button className="btn-primary w-full sm:w-auto" disabled={!files.length || busy} onClick={convert}>
        <Download className="h-4 w-4" /> {busy ? 'Creating PDF…' : `Convert ${files.length || ''} image${files.length === 1 ? '' : 's'} to PDF`}
      </button>
    </div>
  )
}
