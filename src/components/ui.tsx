import { useRef, useState, type ReactNode } from 'react'
import { Check, Copy, Loader2 } from 'lucide-react'
import { copyText } from '../lib/utils'

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
    </div>
  )
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input min-h-32 font-normal ${props.className ?? ''}`} />
}

export function CopyButton({ text, label = 'Copy', className = 'btn-secondary' }: { text: string; label?: string; className?: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        if (await copyText(text)) {
          setOk(true)
          setTimeout(() => setOk(false), 1500)
        }
      }}
    >
      {ok ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {ok ? 'Copied!' : label}
    </button>
  )
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  )
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
      {children}
    </div>
  )
}

export function FileDrop({
  accept,
  multiple,
  onFiles,
  hint,
}: {
  accept?: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  hint?: string
}) {
  const [over, setOver] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length) onFiles(multiple ? files : files.slice(0, 1))
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        over
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
          : 'border-zinc-300 hover:border-indigo-400 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 text-indigo-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V6m0 0-4 4m4-4 4 4M4 20h16" />
      </svg>
      <p className="text-sm font-medium">
        Drop file{multiple ? 's' : ''} here or <span className="text-indigo-500">browse</span>
      </p>
      {hint && <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
