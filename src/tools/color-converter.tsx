import { useState, useMemo } from 'react'
import { ColorArea, ColorSlider, ColorField, Label, TextField, Input } from 'react-aria-components'
import { parseColor, type Color } from 'react-aria-components'
import { CopyButton, showToast } from '../components/rac'

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
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

function colorToHex(c: Color): string {
  return c.toString('hex')
}

function colorToRgb(c: Color): string {
  const [r, g, b] = [c.getChannelValue('red'), c.getChannelValue('green'), c.getChannelValue('blue')]
  return `rgb(${r}, ${g}, ${b})`
}

function colorToHsl(c: Color): string {
  const [h, s, l] = rgbToHsl(
    c.getChannelValue('red'),
    c.getChannelValue('green'),
    c.getChannelValue('blue'),
  )
  return `hsl(${h}, ${s}%, ${l}%)`
}

export function ColorConverter() {
  const [color, setColor] = useState(() => parseColor('#4f46e5'))
  const hex = colorToHex(color)
  const rgb = colorToRgb(color)
  const hsl = colorToHsl(color)

  // Tints & shades
  const tints = useMemo(() => {
    const [, s] = rgbToHsl(
      color.getChannelValue('red'),
      color.getChannelValue('green'),
      color.getChannelValue('blue'),
    )
    const levels = [90, 80, 70, 60, 50, 40, 30, 20, 10]
    return levels.map((l) => {
      const [r, g, b] = hslToRgb(parseFloat(hsl.match(/hsl\((\d+)/)?.[1] || '0'), s, l)
      return { level: l, hex: `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}` }
    })
  }, [color, hsl])

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)', gridTemplateColumns: 'auto 1fr' }}>
      {/* Color picker area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)' }}>
        <ColorArea
          colorSpace="hsb"
          value={color}
          onChange={setColor}
          aria-label="Color area"
          style={{ width: '14rem', height: '14rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
        />
        <input
          type="range"
          min={0}
          max={360}
          value={color.getChannelValue('hue')}
          onChange={(e) => {
            const h = parseInt(e.target.value)
            const s = color.getChannelValue('saturation')
            const b = color.getChannelValue('brightness')
            setColor(parseColor(`hsb(${h}, ${s}, ${b})`))
          }}
          aria-label="Hue"
          style={{ width: '14rem', accentColor: 'var(--accent-5)' }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{hex.toUpperCase()}</span>
      </div>

      {/* Values */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {[
          ['HEX', hex.toUpperCase()],
          ['RGB', rgb],
          ['HSL', hsl],
        ].map(([label, value]) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-3)', padding: 'var(--sp-4)' }}>
            <div style={{ minWidth: 0 }}>
              <span className="label">{label}</span>
              <code style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</code>
            </div>
            <CopyButton text={value} className="" />
          </div>
        ))}

        {/* Tints & shades */}
        <div>
          <span className="label" style={{ marginBottom: 'var(--sp-2)', display: 'block' }}>Tints &amp; shades — click to copy</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-1)' }}>
            {tints.map(({ level, hex: tHex }) => {
              const lightness = level >= 50 ? 'rgba(0,0,0,.5)' : 'rgba(255,255,255,.7)'
              return (
                <button
                  key={level}
                  title={tHex}
                  onClick={() => {
                    navigator.clipboard.writeText(tHex)
                    showToast('Copied!', `${tHex} copied to clipboard`)
                  }}
                  style={{
                    flex: 1, minWidth: '2.5rem', height: '2.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: tHex,
                    border: '1px solid rgba(0,0,0,.05)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    paddingBottom: '2px',
                    transition: 'transform 100ms ease',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'scale(1.05)' }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: lightness }}>{level}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}
