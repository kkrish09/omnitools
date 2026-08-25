import { useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { downloadBlob } from '../lib/utils'
import { CopyButton, ErrorNote, FileDrop, TextArea } from '../components/ui'

/* ===== Base64 Encoder/Decoder ===== */

export function Base64Tool() {
  const [tab, setTab] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  function encode() {
    setError('')
    try { setOutput(btoa(unescape(encodeURIComponent(input)))); setImageUrl('') }
    catch { setError('Encoding failed') }
  }

  function decode() {
    setError(''); setImageUrl('')
    try {
      const decoded = decodeURIComponent(escape(atob(input.trim())))
      setOutput(decoded)
      // Check if it looks like a data URL
      if (input.trim().startsWith('data:image')) {
        setImageUrl(input.trim())
      }
    } catch { setError('Invalid Base64 string') }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={tab === 'encode' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setTab('encode'); setOutput(''); setError(''); setImageUrl('') }}>Encode</button>
        <button className={tab === 'decode' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setTab('decode'); setOutput(''); setError(''); setImageUrl('') }}>Decode</button>
      </div>
      <TextArea value={input} onChange={(e) => { setInput(e.target.value); setOutput(''); setError('') }} placeholder={tab === 'encode' ? 'Text to encode…' : 'Base64 string to decode…'} className="min-h-32 font-mono text-xs" />
      <FileDrop hint={tab === 'encode' ? '…or drop a file to get its Base64' : undefined} onFiles={async ([f]) => { if (!f) return; const buf = await f.arrayBuffer(); const b64 = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join(''); setOutput(b64); setImageUrl('') }} />
      {error && <ErrorNote>{error}</ErrorNote>}
      <button className="btn-primary" disabled={!input.trim()} onClick={tab === 'encode' ? encode : decode}>{tab === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}</button>
      {imageUrl && <img src={imageUrl} alt="decoded" className="mx-auto max-h-40 rounded-xl border border-zinc-200 dark:border-zinc-700" />}
      {output && (
        <div className="space-y-2">
          <TextArea readOnly value={output} className="min-h-32 bg-zinc-50 font-mono text-[11px] dark:bg-zinc-800" onFocus={(e) => e.currentTarget.select()} />
          <div className="flex gap-2">
            <CopyButton text={output} label="Copy" className="btn-primary" />
            {imageUrl && <button className="btn-secondary" onClick={() => { fetch(imageUrl).then((r) => r.blob()).then((b) => downloadBlob(b, 'decoded-image.png')) }}><Download className="h-4 w-4" /> Save image</button>}
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== URL Encoder/Decoder ===== */

export function UrlEncode() {
  const [input, setInput] = useState('')
  const [dir, setDir] = useState<'encode' | 'decode'>('encode')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function run() {
    setError('')
    try {
      setOutput(dir === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input))
    } catch { setError(dir === 'encode' ? 'Encoding failed' : 'Invalid URL-encoded string') }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={dir === 'encode' ? 'btn-primary' : 'btn-secondary'} onClick={() => setDir('encode')}>Encode</button>
        <button className={dir === 'decode' ? 'btn-primary' : 'btn-secondary'} onClick={() => setDir('decode')}>Decode</button>
      </div>
      <TextArea value={input} onChange={(e) => { setInput(e.target.value); setOutput(''); setError('') }} placeholder={dir === 'encode' ? 'URL or text to encode…' : 'Percent-encoded string to decode…'} className="min-h-24 font-mono text-xs" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <button className="btn-primary" disabled={!input.trim()} onClick={run}>{dir === 'encode' ? 'Encode' : 'Decode'}</button>
      {output && <div className="space-y-2"><TextArea readOnly value={output} className="min-h-20 bg-zinc-50 font-mono text-xs dark:bg-zinc-800" onFocus={(e) => e.currentTarget.select()} /><CopyButton text={output} label="Copy result" className="btn-primary" /></div>}
    </div>
  )
}

/* ===== HTML Encoder/Decoder ===== */

const HTML_ENTITIES: [string, string][] = [['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'], ["'", '&#39;']]

export function HtmlEncode() {
  const [input, setInput] = useState('')
  const [dir, setDir] = useState<'encode' | 'decode'>('encode')
  const [output, setOutput] = useState('')

  function run() {
    if (dir === 'encode') {
      let s = input
      for (const [ch, ent] of HTML_ENTITIES) s = s.replaceAll(ch, ent)
      setOutput(s)
    } else {
      let s = input
      for (const [ch, ent] of HTML_ENTITIES) s = s.replaceAll(ent, ch)
      s = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      s = s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      setOutput(s)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={dir === 'encode' ? 'btn-primary' : 'btn-secondary'} onClick={() => setDir('encode')}>Escape HTML</button>
        <button className={dir === 'decode' ? 'btn-primary' : 'btn-secondary'} onClick={() => setDir('decode')}>Unescape HTML</button>
      </div>
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder={dir === 'encode' ? 'HTML to escape…' : 'Escaped HTML to unescape…'} className="min-h-24 font-mono text-xs" />
      <button className="btn-primary" disabled={!input.trim()} onClick={run}>{dir === 'encode' ? 'Escape' : 'Unescape'}</button>
      {output && <div className="space-y-2"><TextArea readOnly value={output} className="min-h-20 bg-zinc-50 font-mono text-xs dark:bg-zinc-800" onFocus={(e) => e.currentTarget.select()} /><CopyButton text={output} label="Copy result" className="btn-primary" /></div>}
    </div>
  )
}
