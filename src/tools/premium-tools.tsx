import { useMemo, useState } from 'react'
import { CopyButton, ErrorNote, TextArea } from '../components/ui'
import { copyText } from '../lib/utils'

/* ================================================================
   ER Diagram Builder — from SQL DDL or manual tables
   ================================================================ */

interface ErTable { name: string; columns: { name: string; type: string; pk: boolean; fk?: string }[] }

const SAMPLE_SQL = `CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  name VARCHAR(100),\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE posts (\n  id SERIAL PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id),\n  title VARCHAR(255) NOT NULL,\n  body TEXT,\n  published BOOLEAN DEFAULT false,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE comments (\n  id SERIAL PRIMARY KEY,\n  post_id INTEGER REFERENCES posts(id),\n  user_id INTEGER REFERENCES users(id),\n  body TEXT NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);`

function parseCreateTables(sql: string): ErTable[] {
  const tables: ErTable[] = []
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\)\s*;/gi
  let match: RegExpExecArray | null
  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1]!
    const body = match[2]!
    const columns: ErTable['columns'] = []
    const lines = body.split(',').map((l) => l.trim()).filter(Boolean)
    for (const line of lines) {
      const colMatch = line.match(/["`]?(\w+)["`]?\s+(\w+(?:\([^)]*\))?)/i)
      if (!colMatch) continue
      const colName = colMatch[1]!
      const colType = colMatch[2]!
      const pk = /\bPRIMARY\s+KEY\b/i.test(line)
      const fkMatch = line.match(/REFERENCES\s+["`]?(\w+)["`]?\s*\(\s*["`]?(\w+)["`]?\s*\)/i)
      const fk = fkMatch ? `${fkMatch[1]}.${fkMatch[2]}` : undefined
      columns.push({ name: colName, type: colType, pk, fk })
    }
    if (columns.length > 0) tables.push({ name: tableName, columns })
  }
  return tables
}

function tablesToMermaid(tables: ErTable[]): string {
  const lines = ['erDiagram']
  for (const t of tables) {
    lines.push(`    ${t.name} {`)
    for (const c of t.columns) {
      const marker = c.pk ? ' PK' : c.fk ? ' FK' : ''
      lines.push(`        ${c.type} ${c.name}${marker}`)
    }
    lines.push('    }')
  }
  // relationships from FKs
  for (const t of tables) {
    for (const c of t.columns) {
      if (c.fk) {
        const [refTable] = c.fk.split('.')
        lines.push(`    ${t.name} }o--|| ${refTable} : "${c.name}"`)
      }
    }
  }
  return lines.join('\n')
}

export function ErDiagram() {
  const [sql, setSql] = useState(SAMPLE_SQL)
  const tables = useMemo(() => parseCreateTables(sql), [sql])
  const mermaid = useMemo(() => tables.length > 0 ? tablesToMermaid(tables) : '// No tables found — paste CREATE TABLE statements', [tables])
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="label mb-0">Input</span>
        <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setSql(SAMPLE_SQL)}>Load sample</button>
      </div>
      <TextArea value={sql} onChange={(e) => setSql(e.target.value)} className="min-h-48 font-mono text-sm" placeholder="Paste CREATE TABLE statements..." />
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">{tables.length} table{tables.length !== 1 ? 's' : ''} detected</span>
        <button className="btn-secondary px-3 py-1 text-xs" onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Hide' : 'Show'} preview</button>
      </div>
      {showPreview && tables.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <div key={t.name} className="card overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-bold text-white">{t.name}</div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {t.columns.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 px-4 py-1.5 text-xs">
                    <span className={`h-2 w-2 rounded-full ${c.pk ? 'bg-amber-400' : c.fk ? 'bg-sky-400' : 'bg-zinc-300'}`} />
                    <span className="font-mono font-medium">{c.name}</span>
                    <span className="ml-auto text-zinc-400">{c.type}</span>
                    {c.pk && <span className="rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">PK</span>}
                    {c.fk && <span className="rounded bg-sky-100 px-1 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">FK → {c.fk}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <span className="label">Mermaid ER Diagram Syntax</span>
        <pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed max-h-80">{mermaid}</pre>
        <div className="mt-2 flex gap-2">
          <CopyButton text={mermaid} label="Copy Mermaid" className="btn-primary" />
          <CopyButton text={`\`\`\`mermaid\n${mermaid}\n\`\`\``} label="Copy Markdown" className="btn-secondary" />
        </div>
      </div>
      <p className="text-xs text-zinc-400">Paste the Mermaid syntax into any Mermaid-compatible renderer (GitHub, Notion, mermaid.live) to see the visual diagram.</p>
    </div>
  )
}

/* ================================================================
   GraphQL Schema Builder
   ================================================================ */

interface GqlField { name: string; type: string; required: boolean }
interface GqlType { name: string; fields: GqlField[]; isInput: boolean }

const SAMPLE_GQL: GqlType[] = [
  { name: 'User', isInput: false, fields: [
    { name: 'id', type: 'ID!', required: true },
    { name: 'email', type: 'String!', required: true },
    { name: 'name', type: 'String', required: false },
    { name: 'posts', type: '[Post!]!', required: true },
  ]},
  { name: 'Post', isInput: false, fields: [
    { name: 'id', type: 'ID!', required: true },
    { name: 'title', type: 'String!', required: true },
    { name: 'body', type: 'String', required: false },
    { name: 'author', type: 'User!', required: true },
    { name: 'createdAt', type: 'DateTime!', required: true },
  ]},
  { name: 'CreatePostInput', isInput: true, fields: [
    { name: 'title', type: 'String!', required: true },
    { name: 'body', type: 'String', required: false },
  ]},
]

function typesToSdl(types: GqlType[]): string {
  const lines: string[] = []
  for (const t of types) {
    const keyword = t.isInput ? 'input' : 'type'
    lines.push(`${keyword} ${t.name} {`)
    for (const f of t.fields) {
      lines.push(`  ${f.name}: ${f.type}${f.required ? '!' : ''}`)
    }
    lines.push('}', '')
  }
  // Generate Query type
  const queryFields = types.filter((t) => !t.isInput).map((t) => `  ${t.name.toLowerCase()}(id: ID!): ${t.name}`)
  if (queryFields.length > 0) {
    lines.push('type Query {')
    lines.push(...queryFields)
    lines.push('}', '')
  }
  // Generate Mutation type
  const inputTypes = types.filter((t) => t.isInput)
  if (inputTypes.length > 0) {
    lines.push('type Mutation {')
    for (const it of inputTypes) {
      const base = it.name.replace(/Input$/, '').toLowerCase()
      lines.push(`  create${it.name.replace(/Input$/, '')}(input: ${it.name}!): ${it.name.replace(/Input$/, '')}!`)
    }
    lines.push('}')
  }
  return lines.join('\n')
}

export function GraphqlBuilder() {
  const [types, setTypes] = useState<GqlType[]>(SAMPLE_GQL)
  const sdl = useMemo(() => typesToSdl(types), [types])

  function addType() {
    setTypes([...types, { name: 'NewType', isInput: false, fields: [{ name: 'id', type: 'ID!', required: true }] }])
  }

  function updateType(idx: number, patch: Partial<GqlType>) {
    setTypes(types.map((t, i) => i === idx ? { ...t, ...patch } : t))
  }

  function removeType(idx: number) {
    setTypes(types.filter((_, i) => i !== idx))
  }

  function addField(typeIdx: number) {
    setTypes(types.map((t, i) => i === typeIdx ? { ...t, fields: [...t.fields, { name: 'newField', type: 'String', required: false }] } : t))
  }

  function updateField(typeIdx: number, fieldIdx: number, patch: Partial<GqlField>) {
    setTypes(types.map((t, i) => i === typeIdx ? { ...t, fields: t.fields.map((f, fi) => fi === fieldIdx ? { ...f, ...patch } : f) } : t))
  }

  function removeField(typeIdx: number, fieldIdx: number) {
    setTypes(types.map((t, i) => i === typeIdx ? { ...t, fields: t.fields.filter((_, fi) => fi !== fieldIdx) } : t))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {types.map((t, ti) => (
          <div key={ti} className="card p-3 space-y-2 min-w-[220px]">
            <div className="flex items-center gap-2">
              <input className="input flex-1 font-mono text-sm" value={t.name} onChange={(e) => updateType(ti, { name: e.target.value })} />
              <label className="flex items-center gap-1 text-xs text-zinc-500">
                <input type="checkbox" checked={t.isInput} onChange={(e) => updateType(ti, { isInput: e.target.checked })} className="accent-indigo-600" /> input
              </label>
              <button className="text-red-400 hover:text-red-600 text-xs" onClick={() => removeType(ti)}>✕</button>
            </div>
            {t.fields.map((f, fi) => (
              <div key={fi} className="flex items-center gap-1">
                <input className="input flex-1 font-mono text-xs py-1" value={f.name} onChange={(e) => updateField(ti, fi, { name: e.target.value })} />
                <input className="input w-24 font-mono text-xs py-1" value={f.type.replace('!', '')} onChange={(e) => updateField(ti, fi, { type: e.target.value + (f.required ? '!' : '') })} />
                <label className="text-[10px] text-zinc-400">!</label>
                <input type="checkbox" checked={f.required} onChange={(e) => updateField(ti, fi, { required: e.target.checked, type: f.type.replace(/!$/, '') + (e.target.checked ? '!' : '') })} className="accent-indigo-600 scale-75" />
                <button className="text-red-400 hover:text-red-600 text-[10px]" onClick={() => removeField(ti, fi)}>✕</button>
              </div>
            ))}
            <button className="btn-secondary px-2 py-1 text-xs w-full" onClick={() => addField(ti)}>+ field</button>
          </div>
        ))}
        <button className="card flex items-center justify-center p-3 text-sm text-indigo-500 hover:border-indigo-300 min-w-[120px]" onClick={addType}>+ Add type</button>
      </div>
      <div>
        <span className="label">Generated SDL</span>
        <pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed max-h-80">{sdl}</pre>
        <div className="mt-2"><CopyButton text={sdl} label="Copy SDL" className="btn-primary" /></div>
      </div>
    </div>
  )
}

/* ================================================================
   OpenAPI Designer
   ================================================================ */

interface OaEndpoint { method: string; path: string; summary: string; responses: string }
const DEFAULT_ENDPOINTS: OaEndpoint[] = [
  { method: 'GET', path: '/users', summary: 'List all users', responses: '200: Array of User objects' },
  { method: 'POST', path: '/users', summary: 'Create a new user', responses: '201: Created User object' },
  { method: 'GET', path: '/users/{id}', summary: 'Get user by ID', responses: '200: User object, 404: Not found' },
]

function endpointsToSpec(endpoints: OaEndpoint[], title: string, version: string): string {
  const spec: Record<string, unknown> = {
    openapi: '3.0.3',
    info: { title, version, description: 'API designed with OmniTools OpenAPI Designer' },
    paths: {} as Record<string, unknown>,
  }
  const paths = spec.paths as Record<string, Record<string, unknown>>
  for (const ep of endpoints) {
    if (!paths[ep.path]) paths[ep.path] = {}
    const method = ep.method.toLowerCase()
    paths[ep.path]![method] = {
      summary: ep.summary,
      operationId: `${method}${ep.path.replace(/[^a-zA-Z0-9]/g, '')}`,
      responses: Object.fromEntries(
        ep.responses.split(',').map((r) => {
          const [code, desc] = r.trim().split(':').map((s) => s.trim())
          return [code || '200', { description: desc || 'Success' }]
        })
      ),
    }
  }
  return JSON.stringify(spec, null, 2)
}

export function OpenapiDesigner() {
  const [endpoints, setEndpoints] = useState<OaEndpoint[]>(DEFAULT_ENDPOINTS)
  const [title, setTitle] = useState('My API')
  const [version, setVersion] = useState('1.0.0')
  const spec = useMemo(() => endpointsToSpec(endpoints, title, version), [endpoints, title, version])

  const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    PATCH: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }

  function addEndpoint() {
    setEndpoints([...endpoints, { method: 'GET', path: '/new', summary: '', responses: '200: Success' }])
  }

  function updateEndpoint(idx: number, patch: Partial<OaEndpoint>) {
    setEndpoints(endpoints.map((e, i) => i === idx ? { ...e, ...patch } : e))
  }

  function removeEndpoint(idx: number) {
    setEndpoints(endpoints.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="label">API Title</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><span className="label">Version</span><input className="input" value={version} onChange={(e) => setVersion(e.target.value)} /></div>
      </div>
      <div className="space-y-2">
        {endpoints.map((ep, i) => (
          <div key={i} className="card flex items-center gap-2 p-3">
            <select className={`input w-24 font-mono text-xs font-bold ${METHOD_COLORS[ep.method] || ''}`} value={ep.method} onChange={(e) => updateEndpoint(i, { method: e.target.value })}>
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => <option key={m}>{m}</option>)}
            </select>
            <input className="input flex-1 font-mono text-sm" value={ep.path} onChange={(e) => updateEndpoint(i, { path: e.target.value })} placeholder="/path" />
            <input className="input flex-1 text-sm" value={ep.summary} onChange={(e) => updateEndpoint(i, { summary: e.target.value })} placeholder="Summary" />
            <button className="text-red-400 hover:text-red-600 text-xs shrink-0" onClick={() => removeEndpoint(i)}>✕</button>
          </div>
        ))}
        <button className="btn-secondary w-full" onClick={addEndpoint}>+ Add endpoint</button>
      </div>
      <div>
        <span className="label">OpenAPI 3.0 Spec</span>
        <pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed max-h-96">{spec}</pre>
        <div className="mt-2 flex gap-2">
          <CopyButton text={spec} label="Copy JSON" className="btn-primary" />
          <CopyButton text={spec} label="Copy YAML (use converter)" className="btn-secondary" />
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   CSS Animation Builder
   ================================================================ */

interface AnimKeyframe { offset: string; props: string }

const SAMPLE_KEYFRAMES: AnimKeyframe[] = [
  { offset: '0%', props: 'transform: translateX(0); opacity: 1;' },
  { offset: '50%', props: 'transform: translateX(100px); opacity: 0.5;' },
  { offset: '100%', props: 'transform: translateX(0); opacity: 1;' },
]

function keyframesToCss(name: string, keyframes: AnimKeyframe[], duration: string, easing: string, iteration: string, direction: string, fillMode: string): string {
  const kf = keyframes.map((k) => `  ${k.offset} {\n    ${k.props.split(';').filter(Boolean).join(';\n    ')};\n  }`).join('\n')
  return `@keyframes ${name} {\n${kf}\n}\n\n.animated-element {\n  animation: ${name} ${duration} ${easing} ${iteration} ${direction} ${fillMode};\n}`
}

export function CssAnimation() {
  const [name, setName] = useState('myAnimation')
  const [keyframes, setKeyframes] = useState<AnimKeyframe[]>(SAMPLE_KEYFRAMES)
  const [duration, setDuration] = useState('1s')
  const [easing, setEasing] = useState('ease')
  const [iteration, setIteration] = useState('infinite')
  const [direction, setDirection] = useState('normal')
  const [fillMode, setFillMode] = useState('forwards')
  const [previewText, setPreviewText] = useState('Hello!')

  const css = useMemo(() => keyframesToCss(name, keyframes, duration, easing, iteration, direction, fillMode), [name, keyframes, duration, easing, iteration, direction, fillMode])

  function addKeyframe() {
    setKeyframes([...keyframes, { offset: `${keyframes.length * 50}%`, props: 'transform: scale(1);' }])
  }

  function updateKeyframe(idx: number, patch: Partial<AnimKeyframe>) {
    setKeyframes(keyframes.map((k, i) => i === idx ? { ...k, ...patch } : k))
  }

  function removeKeyframe(idx: number) {
    setKeyframes(keyframes.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="label">Animation name</span><input className="input font-mono" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><span className="label">Preview text</span><input className="input" value={previewText} onChange={(e) => setPreviewText(e.target.value)} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div><span className="label">Duration</span><input className="input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1s" /></div>
        <div><span className="label">Easing</span>
          <select className="input" value={easing} onChange={(e) => setEasing(e.target.value)}>
            {['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(0.68,-0.55,0.265,1.55)'].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><span className="label">Iterations</span>
          <select className="input" value={iteration} onChange={(e) => setIteration(e.target.value)}>
            {['1', '2', '3', '5', 'infinite'].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><span className="label">Direction</span>
          <select className="input" value={direction} onChange={(e) => setDirection(e.target.value)}>
            {['normal', 'reverse', 'alternate', 'alternate-reverse'].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>
      {/* Preview */}
      <div className="card flex h-32 items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <div className="rounded-lg bg-indigo-500 px-6 py-3 font-bold text-white" style={{ animation: `${name} ${duration} ${easing} ${iteration} ${direction} ${fillMode}` }}>{previewText}</div>
      </div>
      {/* Keyframes */}
      <div className="space-y-2">
        <span className="label">Keyframes</span>
        {keyframes.map((k, i) => (
          <div key={i} className="card flex items-start gap-2 p-3">
            <input className="input w-20 font-mono text-xs" value={k.offset} onChange={(e) => updateKeyframe(i, { offset: e.target.value })} />
            <textarea className="input flex-1 font-mono text-xs min-h-[60px]" value={k.props} onChange={(e) => updateKeyframe(i, { props: e.target.value })} />
            <button className="text-red-400 hover:text-red-600 text-xs shrink-0 mt-1" onClick={() => removeKeyframe(i)}>✕</button>
          </div>
        ))}
        <button className="btn-secondary w-full" onClick={addKeyframe}>+ Add keyframe</button>
      </div>
      <div>
        <span className="label">Generated CSS</span>
        <pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed">{css}</pre>
        <div className="mt-2"><CopyButton text={css} label="Copy CSS" className="btn-primary" /></div>
      </div>
    </div>
  )
}

/* ================================================================
   API Documentation Generator
   ================================================================ */

interface ApiDocEndpoint { method: string; path: string; description: string; requestExample: string; responseExample: string }

const SAMPLE_DOCS: ApiDocEndpoint[] = [
  { method: 'GET', path: '/api/users', description: 'Returns a paginated list of all users.', requestExample: 'GET /api/users?page=1&limit=20', responseExample: '{\n  "users": [\n    { "id": 1, "name": "Alice", "email": "alice@example.com" }\n  ],\n  "total": 42\n}' },
  { method: 'POST', path: '/api/users', description: 'Creates a new user account.', requestExample: 'POST /api/users\n{\n  "name": "Bob",\n  "email": "bob@example.com"\n}', responseExample: '{\n  "id": 2,\n  "name": "Bob",\n  "email": "bob@example.com"\n}' },
]

function docsToMarkdown(title: string, desc: string, endpoints: ApiDocEndpoint[]): string {
  const lines = [`# ${title}\n`, `${desc}\n`, '---\n']
  for (const ep of endpoints) {
    const color = { GET: '🟢', POST: '🔵', PUT: '🟡', PATCH: '🟠', DELETE: '🔴' }[ep.method] || '⚪'
    lines.push(`## ${color} \`${ep.method}\` ${ep.path}\n`)
    lines.push(`${ep.description}\n`)
    if (ep.requestExample) { lines.push('**Request:**\n```', ep.requestExample, '```\n') }
    if (ep.responseExample) { lines.push('**Response:**\n```json', ep.responseExample, '```\n') }
    lines.push('---\n')
  }
  return lines.join('\n')
}

export function ApiDocsGen() {
  const [title, setTitle] = useState('My API')
  const [desc, setDesc] = useState('A REST API for managing users and posts.')
  const [endpoints, setEndpoints] = useState<ApiDocEndpoint[]>(SAMPLE_DOCS)
  const md = useMemo(() => docsToMarkdown(title, desc, endpoints), [title, desc, endpoints])

  function addEndpoint() {
    setEndpoints([...endpoints, { method: 'GET', path: '/api/new', description: '', requestExample: '', responseExample: '' }])
  }

  function updateEndpoint(idx: number, patch: Partial<ApiDocEndpoint>) {
    setEndpoints(endpoints.map((e, i) => i === idx ? { ...e, ...patch } : e))
  }

  function removeEndpoint(idx: number) {
    setEndpoints(endpoints.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="label">API Title</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><span className="label">Description</span><input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      </div>
      <div className="space-y-3">
        {endpoints.map((ep, i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <select className="input w-24 font-mono text-xs font-bold" value={ep.method} onChange={(e) => updateEndpoint(i, { method: e.target.value })}>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => <option key={m}>{m}</option>)}
              </select>
              <input className="input flex-1 font-mono text-sm" value={ep.path} onChange={(e) => updateEndpoint(i, { path: e.target.value })} />
              <button className="text-red-400 hover:text-red-600 text-xs" onClick={() => removeEndpoint(i)}>✕</button>
            </div>
            <input className="input text-sm" value={ep.description} onChange={(e) => updateEndpoint(i, { description: e.target.value })} placeholder="Description" />
            <div className="grid gap-2 sm:grid-cols-2">
              <div><span className="label text-[10px]">Request Example</span><textarea className="input font-mono text-xs min-h-[60px]" value={ep.requestExample} onChange={(e) => updateEndpoint(i, { requestExample: e.target.value })} /></div>
              <div><span className="label text-[10px]">Response Example</span><textarea className="input font-mono text-xs min-h-[60px]" value={ep.responseExample} onChange={(e) => updateEndpoint(i, { responseExample: e.target.value })} /></div>
            </div>
          </div>
        ))}
        <button className="btn-secondary w-full" onClick={addEndpoint}>+ Add endpoint</button>
      </div>
      <div>
        <span className="label">Generated Documentation (Markdown)</span>
        <pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed max-h-96">{md}</pre>
        <div className="mt-2"><CopyButton text={md} label="Copy Markdown" className="btn-primary" /></div>
      </div>
    </div>
  )
}

/* ================================================================
   TypeScript Type Generator
   ================================================================ */

function jsonToTs(obj: unknown, indent = 0, rootName = 'Root'): string {
  const pad = '  '.repeat(indent)
  if (obj === null) return `${pad}null`
  if (obj === undefined) return `${pad}unknown`
  if (typeof obj === 'string') return `${pad}string`
  if (typeof obj === 'number') return `${pad}number`
  if (typeof obj === 'boolean') return `${pad}boolean`
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}unknown[]`
    const inner = jsonToTs(obj[0], indent + 1)
    return `${pad}${inner.trim()}[]`
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return `${pad}Record<string, unknown>`
    const lines = entries.map(([k, v]) => `${pad}  ${/[^a-zA-Z0-9_]/.test(k) ? `"${k}"` : k}: ${jsonToTs(v, indent + 1).trim()};`)
    return `{\n${lines.join('\n')}\n${pad}}`
  }
  return `${pad}unknown`
}

export function TsTypeGen() {
  const [input, setInput] = useState('{\n  "id": 1,\n  "name": "Alice",\n  "email": "alice@example.com",\n  "isActive": true,\n  "tags": ["admin", "user"],\n  "address": {\n    "street": "123 Main St",\n    "city": "Portland"\n  }\n}')
  const [rootName, setRootName] = useState('User')

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input)
      const body = jsonToTs(parsed, 1).trim()
      return `export interface ${rootName} ${body}`
    } catch (e) {
      return `// Error: ${(e as Error).message}`
    }
  }, [input, rootName])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">JSON Input</span>
          <TextArea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-48 font-mono text-sm" placeholder='{"key": "value"}' />
        </div>
        <div>
          <span className="label">Interface Name</span>
          <input className="input" value={rootName} onChange={(e) => setRootName(e.target.value)} />
          <span className="label mt-4">Generated TypeScript</span>
          <pre className="card overflow-x-auto p-4 font-mono text-xs leading-relaxed min-h-[180px]">{result}</pre>
        </div>
      </div>
      <div className="flex gap-2">
        <CopyButton text={result} label="Copy types" className="btn-primary" />
        <button className="btn-secondary" onClick={() => setInput('{\n  "id": 1,\n  "name": "Product",\n  "price": 29.99,\n  "inStock": true,\n  "variants": [{\n    "size": "M",\n    "color": "red"\n  }]\n}')}>Sample: Product</button>
        <button className="btn-secondary" onClick={() => setInput('[\n  {\n    "userId": 1,\n    "postId": 10,\n    "role": "author"\n  }\n]')}>Sample: Array</button>
      </div>
    </div>
  )
}

/* ================================================================
   Regex Visualizer — shows a tree/flowchart of the pattern
   ================================================================ */

interface RegexNode { type: string; label: string; children?: RegexNode[] }

function visualizeRegex(pattern: string): RegexNode[] {
  const nodes: RegexNode[] = []
  let i = 0
  while (i < pattern.length) {
    const ch = pattern[i]!
    if (ch === '(') {
      // find matching close
      let depth = 1; let j = i + 1
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === '(' && pattern[j - 1] !== '\\') depth++
        if (pattern[j] === ')' && pattern[j - 1] !== '\\') depth--
        j++
      }
      const inner = pattern.slice(i + 1, j - 1)
      const capturing = pattern[i + 1] === '?' ? inner.slice(pattern[i + 1] === '?' ? (pattern[i + 2] === ':' ? 2 : inner.indexOf(')')) : 0) : inner
      nodes.push({ type: 'group', label: pattern.slice(i + 1, i + 3) === '?:' ? 'Non-capturing group' : 'Capturing group', children: visualizeRegex(pattern.slice(i + (pattern[i + 1] === '?' ? (pattern[i + 2] === ':' ? 3 : inner.indexOf(')') + i + 3) : 1), j - 1)) })
      i = j
    } else if (ch === '[') {
      let j = i + 1; if (j < pattern.length && pattern[j] === '^') j++
      while (j < pattern.length && pattern[j] !== ']') j++
      const chars = pattern.slice(i, j + 1)
      nodes.push({ type: 'charset', label: `Character set: ${chars}` })
      i = j + 1
    } else if (ch === '\\') {
      const next = pattern[i + 1]
      const labels: Record<string, string> = { d: 'digit [0-9]', D: 'non-digit', w: 'word [a-zA-Z0-9_]', W: 'non-word', s: 'whitespace', S: 'non-whitespace', b: 'word boundary', B: 'non-word boundary', n: 'newline', t: 'tab' }
      nodes.push({ type: 'escape', label: next && labels[next] ? `\\${next} (${labels[next]})` : `\\${next ?? ''}` })
      i += 2
    } else if (ch === '^') {
      nodes.push({ type: 'anchor', label: 'Start of string' }); i++
    } else if (ch === '$') {
      nodes.push({ type: 'anchor', label: 'End of string' }); i++
    } else if (ch === '.') {
      nodes.push({ type: 'any', label: 'Any character (except newline)' }); i++
    } else if (ch === '*' || ch === '+' || ch === '?') {
      const lazy = pattern[i + 1] === '?'
      const quant = ch === '*' ? '0 or more' : ch === '+' ? '1 or more' : '0 or 1'
      nodes.push({ type: 'quantifier', label: `Repeat ${quant}${lazy ? ' (lazy)' : ''}` })
      i += lazy ? 2 : 1
    } else if (ch === '{') {
      let j = i + 1; while (j < pattern.length && pattern[j] !== '}') j++
      nodes.push({ type: 'quantifier', label: `Repeat ${pattern.slice(i, j + 1)}` })
      i = j + 1
    } else if (ch === '|') {
      nodes.push({ type: 'alternation', label: 'OR (alternation)' }); i++
    } else {
      nodes.push({ type: 'literal', label: `Literal "${ch}"` }); i++
    }
  }
  return nodes
}

function NodeTree({ nodes, depth = 0 }: { nodes: RegexNode[]; depth?: number }) {
  if (nodes.length === 0) return null
  return (
    <div className={depth > 0 ? 'ml-4 border-l-2 border-indigo-200 pl-3 dark:border-indigo-800' : ''}>
      {nodes.map((n, i) => {
        const colors: Record<string, string> = {
          group: 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950',
          charset: 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950',
          escape: 'border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950',
          anchor: 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950',
          any: 'border-pink-300 bg-pink-50 dark:border-pink-700 dark:bg-pink-950',
          quantifier: 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950',
          alternation: 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950',
          literal: 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900',
        }
        return (
          <div key={i} className={`my-1 rounded-lg border px-3 py-1.5 text-xs ${colors[n.type] || ''}`}>
            <span className="font-mono font-medium">{n.label}</span>
            {n.children && n.children.length > 0 && <NodeTree nodes={n.children} depth={depth + 1} />}
          </div>
        )
      })}
    </div>
  )
}

export function RegexVisualizer() {
  const [pattern, setPattern] = useState('^(?<user>[a-zA-Z0-9]+)@(?<domain>[a-zA-Z]+)\\.(?<tld>[a-zA-Z]{2,})$')
  const [testStr, setTestStr] = useState('alice@gmail.com')
  const [error, setError] = useState('')

  const nodes = useMemo(() => {
    try {
      setError('')
      const re = new RegExp(pattern)
      const match = re.exec(testStr)
      if (match) {
        return [...visualizeRegex(pattern), { type: 'anchor', label: `✅ Match found: "${match[0]}"` } as RegexNode]
      }
      return [...visualizeRegex(pattern), { type: 'anchor', label: '❌ No match' } as RegexNode]
    } catch (e) {
      setError((e as Error).message)
      return []
    }
  }, [pattern, testStr])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="label">Regex Pattern</span><input className="input font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} /></div>
        <div><span className="label">Test String</span><input className="input font-mono" value={testStr} onChange={(e) => setTestStr(e.target.value)} /></div>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <div>
        <span className="label">Pattern Visualization</span>
        <div className="card p-4 max-h-80 overflow-auto">
          <NodeTree nodes={nodes} />
        </div>
      </div>
      <p className="text-xs text-zinc-400">This is a simplified visualization. For complex patterns, use regex101.com for detailed match analysis.</p>
    </div>
  )
}

/* ================================================================
   SQL Query Visualizer — EXPLAIN plan parser
   ================================================================ */

const SAMPLE_EXPLAIN = `Seq Scan on users  (cost=0.00..12.50 rows=250 width=36)
  Filter: (is_active = true)
  Rows Removed by Filter: 250
-> Hash Join  (cost=1.25..28.75 rows=250 width=40)
     Hash Cond: (posts.user_id = users.id)
     ->  Seq Scan on posts  (cost=0.00..22.00 rows=1200 width=12)
     ->  Hash  (cost=1.00..1.00 rows=100 width=36)
           ->  Seq Scan on users  (cost=0.00..1.00 rows=100 width=36)
                 Filter: (is_active = true)`

interface ExplainNode {
  cost: string
  rows: string
  width: string
  operation: string
  detail: string
  depth: number
  children: ExplainNode[]
}

function parseExplainPlan(text: string): ExplainNode[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const nodes: ExplainNode[] = []
  const stack: ExplainNode[] = []

  for (const line of lines) {
    const trimmed = line.replace(/^[\s├└─│]+/, '')
    const depth = (line.length - line.trimStart().length) / 2
    const costMatch = trimmed.match(/cost=([\d.]+\.\.[\d.]+)\s+rows=(\d+)\s+width=(\d+)/)
    const operation = trimmed.replace(/\s*\(cost=.*$/, '').trim()
    const node: ExplainNode = {
      cost: costMatch ? costMatch[1] : '',
      rows: costMatch ? costMatch[2] : '',
      width: costMatch ? costMatch[3] : '',
      operation,
      detail: trimmed,
      depth,
      children: [],
    }
    while (stack.length > 0 && stack[stack.length - 1]!.depth >= depth) stack.pop()
    if (stack.length > 0) stack[stack.length - 1]!.children.push(node)
    else nodes.push(node)
    stack.push(node)
  }
  return nodes
}

function ExplainNodeView({ node }: { node: ExplainNode }) {
  const barWidth = node.rows ? Math.min(100, (parseInt(node.rows) / 1200) * 100) : 10
  return (
    <div className={`ml-${node.depth * 4}`}>
      <div className="card p-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="h-2 rounded-full bg-indigo-400" style={{ width: `${Math.max(8, barWidth)}%`, maxWidth: '200px' }} />
          <span className="text-xs font-mono font-medium">{node.operation}</span>
        </div>
        {node.cost && (
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-zinc-500">
            <span>Cost: {node.cost}</span>
            <span>Rows: {node.rows}</span>
            <span>Width: {node.width}B</span>
          </div>
        )}
      </div>
      {node.children.map((child, i) => <ExplainNodeView key={i} node={child} />)}
    </div>
  )
}

export function SqlVisualizer() {
  const [plan, setPlan] = useState(SAMPLE_EXPLAIN)
  const nodes = useMemo(() => parseExplainPlan(plan), [plan])

  return (
    <div className="space-y-4">
      <div><span className="label">Paste EXPLAIN ANALYZE output</span>
        <TextArea value={plan} onChange={(e) => setPlan(e.target.value)} className="min-h-32 font-mono text-xs" placeholder="Paste PostgreSQL EXPLAIN output..." />
      </div>
      <div>
        <span className="label">Query Plan Visualization</span>
        <div className="card p-4 space-y-1">
          {nodes.length === 0 ? <p className="text-sm text-zinc-400">Paste a valid EXPLAIN plan above.</p> : nodes.map((n, i) => <ExplainNodeView key={i} node={n} />)}
        </div>
      </div>
      <p className="text-xs text-zinc-400">Supports PostgreSQL EXPLAIN output. The bar width represents relative row counts.</p>
    </div>
  )
}
