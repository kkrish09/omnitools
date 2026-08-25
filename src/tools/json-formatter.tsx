import { useState } from 'react'
import { Button, TextField, Input, Label, ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { Download } from 'lucide-react'
import { CopyButton, showToast } from '../components/rac'
import { downloadBlob } from '../lib/utils'

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep)
  if (v && typeof v === 'object') return Object.fromEntries(
    Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, val]) => [k, sortDeep(val)])
  )
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
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent === 'tab' ? '\t' : Number(indent)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <TextField
        value={input}
        onChange={setInput}
      >
        <Label>Input</Label>
        <textarea
          className="react-aria-TextArea"
          style={{ minHeight: '10rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste JSON… e.g. {"hello":"world"}'
        />
      </TextField>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sp-4)' }}>
        {!minify && (
          <ToggleButtonGroup
            selectedKeys={[indent]}
            onSelectionChange={(k) => { const key = [...k][0]; if (key) setIndent(key as typeof indent) }}
          >
            <ToggleButton id="2">2 spaces</ToggleButton>
            <ToggleButton id="4">4 spaces</ToggleButton>
            <ToggleButton id="tab">Tab</ToggleButton>
          </ToggleButtonGroup>
        )}
        <ToggleButtonGroup
          selectedKeys={minify ? ['minify'] : []}
          onSelectionChange={(k) => setMinify([...k].includes('minify'))}
        >
          <ToggleButton id="minify">Minify</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          selectedKeys={sortKeys ? ['sort'] : []}
          onSelectionChange={(k) => setSortKeys([...k].includes('sort'))}
        >
          <ToggleButton id="sort">Sort keys</ToggleButton>
        </ToggleButtonGroup>
        <Button data-variant="primary" onPress={run} isDisabled={!input.trim()}>Format</Button>
      </div>

      {error && (
        <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 'var(--text-sm)' }}>
          <strong>Invalid JSON:</strong> {error}
        </div>
      )}

      {output && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <label className="label">Output</label>
          <textarea
            readOnly
            className="react-aria-TextArea"
            style={{ minHeight: '10rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'var(--bg-sunken)' }}
            value={output}
            onFocus={(e) => e.currentTarget.select()}
          />
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <CopyButton text={output} label="Copy" />
            <Button data-variant="ghost" onPress={() => downloadBlob(new Blob([output], { type: 'text/plain' }), 'output.json')}>
              <Download size={14} /> Download
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
