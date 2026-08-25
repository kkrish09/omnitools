import { useState } from 'react'
import { Button, Checkbox, Label, Meter, Slider, SliderTrack, SliderFill, SliderThumb } from 'react-aria-components'
import { RefreshCw } from 'lucide-react'
import { CopyButton, showToast } from '../components/rac'

const SETS = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower: 'abcdefghijkmnopqrstuvwxyz',
  digits: '23456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.',
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
    const rand = (n: number) => { const a = new Uint32Array(n); crypto.getRandomValues(a); return a }
    const chars: string[] = activeSets.map((k) => SETS[k][rand(1)[0]! % SETS[k].length]!)
    while (chars.length < length) chars.push(pool[rand(1)[0]! % pool.length]!)
    for (let i = chars.length - 1; i > 0; i--) {
      const j = rand(1)[0]! % (i + 1)
      ;[chars[i], chars[j]] = [chars[j]!, chars[i]!]
    }
    const pw = chars.join('')
    setPassword(pw)
    setHistory((h) => [pw, ...h].slice(0, 5))
    showToast('Password generated', `${length} characters`)
  }

  const poolSize = (Object.keys(opts) as (keyof typeof opts)[]).filter((k) => opts[k]).reduce((s, k) => s + SETS[k].length, 0)
  const entropy = poolSize > 1 ? Math.round(length * Math.log2(poolSize)) : 0
  const strength = entropy >= 90 ? 'Very strong' : entropy >= 70 ? 'Strong' : entropy >= 50 ? 'Fair' : 'Weak'
  const strengthColor = entropy >= 70 ? 'var(--success)' : entropy >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* Preview */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, wordBreak: 'break-all' }}>
          {password || <span style={{ color: 'var(--text-tertiary)' }}>click generate…</span>}
        </div>
        {password && (
          <div style={{ marginTop: 'var(--sp-3)', maxWidth: '16rem', margin: 'var(--sp-3) auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--sp-1)' }}>
              <span>Strength</span>
              <span>{strength} · ~{entropy} bits</span>
            </div>
            <Meter value={entropy} maxValue={128} />
          </div>
        )}
      </div>

      {/* Length slider */}
      <div>
        <label className="label">Length: {length}</label>
        <Slider
          value={length}
          onChange={setLength}
          minValue={8}
          maxValue={64}
          aria-label="Password length"
        >
          <SliderTrack>
            <SliderFill />
            <SliderThumb />
          </SliderTrack>
        </Slider>
      </div>

      {/* Character sets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
        {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => (
          <Checkbox
            key={k}
            isSelected={opts[k]}
            onChange={(checked) => setOpts({ ...opts, [k]: checked })}
          >
            <span className="react-aria-CheckboxBox" />
            {k === 'upper' ? 'A–Z' : k === 'lower' ? 'a–z' : k === 'digits' ? '0–9' : '!@#'}
          </Checkbox>
        ))}
      </div>

      {/* Generate + Copy */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
        <Button data-variant="primary" onPress={generate}>
          <RefreshCw size={14} /> Generate password
        </Button>
        {password && <CopyButton text={password} label="Copy" />}
      </div>

      {/* History */}
      {history.length > 1 && (
        <div>
          <label className="label">History</label>
          <ul style={{ listStyle: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {history.slice(1).map((pw) => (
              <li key={pw} style={{ padding: 'var(--sp-1) 0' }}>{pw}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
