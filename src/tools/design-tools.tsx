import { useMemo, useState } from 'react'
import { CopyButton } from '../components/ui'

/* ---------------- color helpers ---------------- */

export interface Rgb { r: number; g: number; b: number }

export function hexToRgb(hex: string): Rgb | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  let h = m[1]!
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')
}

export function rgbToHsl({ r, g, b }: Rgb): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) }
}

/* ---------------- Color Converter ---------------- */

export function ColorConverter() {
  const [hex, setHex] = useState('#4f46e5')
  const rgb = hexToRgb(hex) ?? hexToRgb('#000000')!
  const [h, s, l] = rgbToHsl(rgb)
  const levels = [90, 80, 70, 60, 50, 40, 30, 20, 10]

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-3">
        <input type="color" value={rgbToHex(rgb)} onChange={(e) => setHex(e.target.value)} className="h-28 w-28 cursor-pointer rounded-2xl border border-zinc-200 bg-transparent p-0 dark:border-zinc-700" style={{ appearance: 'none' }} />
        <span className="font-mono text-sm">{rgbToHex(rgb).toUpperCase()}</span>
      </div>
      <div className="space-y-4">
        {([
          ['HEX', rgbToHex(rgb).toUpperCase()],
          ['RGB', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
          ['HSL', `hsl(${h}, ${s}%, ${l}%)`],
        ] as const).map(([label, value]) => (
          <div key={label} className="card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <span className="label mb-1">{label}</span>
              <code className="block truncate font-mono text-sm">{value}</code>
            </div>
            <CopyButton text={value} className="btn-secondary shrink-0 px-3 py-1.5" />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <span className="label w-full">Tints &amp; shades — click to copy</span>
          {levels.map((lv) => {
            const c = rgbToHex(hslToRgb(h, s, lv))
            return (
              <button
                key={lv}
                title={c}
                onClick={() => navigator.clipboard.writeText(c)}
                className="h-11 flex-1 rounded-lg border border-black/5 transition-transform hover:scale-105"
                style={{ backgroundColor: c }}
              >
                <span className={`font-mono text-[10px] ${lv >= 50 ? 'text-black/50' : 'text-white/70'}`}>{lv}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Palette Generator ---------------- */

const HARMONIES = ['Analogous', 'Complementary', 'Triadic', 'Tetradic', 'Monochromatic'] as const

function buildPalette(baseHue: number, harmony: (typeof HARMONIES)[number]): string[] {
  const sat = 55 + Math.floor(Math.random() * 25)
  switch (harmony) {
    case 'Analogous':
      return [-60, -30, 0, 30, 60].map((d, i) => rgbToHex(hslToRgb(baseHue + d + 360, sat, 38 + i * 7)))
    case 'Complementary':
      return [0, 15, 180, 195, 90].map((d, i) => rgbToHex(hslToRgb(baseHue + d, sat, 30 + i * 10)))
    case 'Triadic':
      return [0, 120, 240, 60, 300].map((d, i) => rgbToHex(hslToRgb(baseHue + d, sat, 35 + i * 6)))
    case 'Tetradic':
      return [0, 90, 180, 270, 45].map((d, i) => rgbToHex(hslToRgb(baseHue + d, sat, 35 + i * 6)))
    case 'Monochromatic':
      return [15, 30, 45, 62, 78].map((li) => rgbToHex(hslToRgb(baseHue, sat, li)))
  }
}

export function PaletteGenerator() {
  const [baseHue, setBaseHue] = useState(() => Math.floor(Math.random() * 360))
  const [harmony, setHarmony] = useState<(typeof HARMONIES)[number]>('Analogous')
  // regenerate forces new random lightness jitter
  const [seed, setSeed] = useState(0)

  const palette = useMemo(
    () => buildPalette(baseHue, harmony),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseHue, harmony, seed],
  )

  const cssVars = palette.map((c, i) => `--color-${i + 1}: ${c};`).join('\n')

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Base hue</span>
          <input type="range" min={0} max={360} value={baseHue} onChange={(e) => setBaseHue(+e.target.value)} className="w-full accent-indigo-600" />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <span className="label">Harmony</span>
            <select className="input" value={harmony} onChange={(e) => setHarmony(e.target.value as typeof harmony)}>
              {HARMONIES.map((hOpt) => <option key={hOpt}>{hOpt}</option>)}
            </select>
          </div>
          <button className="btn-secondary px-3" title="Randomize" onClick={() => { setBaseHue(Math.floor(Math.random() * 360)); setSeed((x) => x + 1) }}>🎲</button>
        </div>
      </div>

      <div className="grid grid-cols-5 overflow-hidden rounded-2xl">
        {palette.map((c) => (
          <button key={c} onClick={() => navigator.clipboard.writeText(c)} className="group flex h-36 flex-col items-center justify-end pb-3 transition-transform hover:flex-1" style={{ backgroundColor: c }}>
            <span className={`rounded-md px-2 py-0.5 font-mono text-xs ${isLight(c) ? 'bg-white/70 text-black' : 'bg-black/40 text-white'}`}>{c}</span>
          </button>
        ))}
      </div>

      <div>
        <span className="label">CSS variables</span>
        <pre className="card overflow-x-auto p-4 font-mono text-xs">{`:root {\n${cssVars}\n}`}</pre>
        <div className="mt-2"><CopyButton text={`:root {\n${cssVars}\n}`} label="Copy CSS" /></div>
      </div>
    </div>
  )
}

function isLight(hexColor: string): boolean {
  const { r, g, b } = hexToRgb(hexColor)!
  return (r * 299 + g * 587 + b * 114) / 1000 > 140
}

/* ---------------- CSS Gradient Maker ---------------- */

export function GradientMaker() {
  const [from, setFrom] = useState('#4f46e5')
  const [to, setTo] = useState('#ec4899')
  const [angle, setAngle] = useState(135)
  const [type, setType] = useState<'linear' | 'radial'>('linear')

  const css =
    type === 'linear'
      ? `background: linear-gradient(${angle}deg, ${from}, ${to});`
      : `background: radial-gradient(circle, ${from}, ${to});`

  return (
    <div className="space-y-4">
      <div className="h-52 rounded-2xl border border-zinc-200 shadow-inner dark:border-zinc-700" style={{ background: css.replace('background: ', '').replace(';', '') }} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex items-center gap-3">
          <input type="color" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0 dark:border-zinc-700" />
          <span className="font-mono text-sm">{from}</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="color" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0 dark:border-zinc-700" />
          <span className="font-mono text-sm">{to}</span>
        </label>
        <div className="flex gap-2">
          {(['linear', 'radial'] as const).map((t) => (
            <button key={t} className={type === t ? 'btn-primary flex-1 capitalize' : 'btn-secondary flex-1 capitalize'} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      </div>
      {type === 'linear' && (
        <div>
          <span className="label">Angle: {angle}°</span>
          <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-indigo-600" />
        </div>
      )}
      <div className="flex items-center gap-3">
        <pre className="card flex-1 overflow-x-auto p-4 font-mono text-xs">{css}</pre>
      </div>
      <div className="flex gap-2">
        <CopyButton text={css} label="Copy CSS" className="btn-primary" />
        <button className="btn-secondary" onClick={() => { setFrom(rgbToHex(hslToRgb(Math.random() * 360, 70, 55))); setTo(rgbToHex(hslToRgb(Math.random() * 360, 70, 55))); setAngle(Math.floor(Math.random() * 360)) }}>
          🎲 Randomize
        </button>
      </div>
    </div>
  )
}
