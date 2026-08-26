import {
  Braces,
  FileCode,
  FileJson,
  Globe,
  Hash,
  KeyRound,
  Link2,
  List,
  Maximize2,
  Palette,
  Pipette,
  QrCode,
  Scissors,
  Star,
  Type,
  Droplets,
  Code,
  FileText,
  BookOpen,
  Fingerprint,
  FileCode2,
  Database,
  FileText as FileTextIcon,
  Terminal,
  Search,
  Key,
  Clock,
  FileCode as FileCodeIcon,
  FileDown,
  Box,
  FileSearch,
  Globe as GlobeIcon,
  Palette as PaletteIcon,
  Binary,
  Eye,
  Server,
  Crown,
  Network,
  Brackets,
  Sparkles,
  Layers,
  FileCode as FileCode2Icon,
  PenTool,
  GitBranch,
  Table2,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PREMIUM_TOOL_IDS } from './config'

export type CategoryId = 'code' | 'encode' | 'generate' | 'devref' | 'design' | 'premium' | 'text'

export interface Category {
  id: CategoryId
  label: string
  tagline: string
  icon: LucideIcon
  gradient: string
}

export const CATEGORIES: Category[] = [
  { id: 'code', label: 'Code Tools', tagline: 'Format, validate, and debug code.', icon: Code, gradient: '#10b981' },
  { id: 'encode', label: 'Encode & Decode', tagline: 'Base64, URL, HTML encoding.', icon: Key, gradient: '#0ea5e9' },
  { id: 'generate', label: 'Generators', tagline: 'UUIDs, passwords, QR codes, configs.', icon: Terminal, gradient: '#8b5cf6' },
  { id: 'devref', label: 'Reference', tagline: 'Converters, tables, quick lookups.', icon: Binary, gradient: '#3b82f6' },
  { id: 'design', label: 'Design', tagline: 'Colors, palettes, gradients.', icon: PaletteIcon, gradient: '#d946ec' },
  { id: 'premium', label: 'Premium', tagline: 'Advanced tools. Pro = unlimited.', icon: Crown, gradient: '#f59e0b' },
  { id: 'text', label: 'Text', tagline: 'Case conversion, diff.', icon: Type, gradient: '#ef4444' },
]

export interface Tool {
  id: string
  name: string
  blurb: string
  category: CategoryId
  icon: LucideIcon
  keywords: string[]
  premium?: boolean
}

export function isPremiumTool(id: string): boolean {
  return PREMIUM_TOOL_IDS.includes(id)
}

export const TOOLS: Tool[] = [
  // ---------- Code ----------
  { id: 'json-formatter', name: 'JSON Formatter', blurb: 'Pretty-print, validate, minify and sort JSON keys.', category: 'code', icon: Braces, keywords: ['json', 'format', 'validate', 'minify', 'prettify'] },
  { id: 'yaml-json', name: 'YAML ↔ JSON', blurb: 'Convert between YAML and JSON instantly.', category: 'code', icon: FileCode2, keywords: ['yaml', 'json', 'convert', 'parse'] },
  { id: 'csv-json', name: 'CSV ↔ JSON', blurb: 'Convert CSV rows to JSON objects and back.', category: 'code', icon: Database, keywords: ['csv', 'json', 'convert', 'spreadsheet'] },
  { id: 'xml-formatter', name: 'XML Formatter', blurb: 'Pretty-print, validate and minify XML.', category: 'code', icon: FileCodeIcon, keywords: ['xml', 'format', 'prettify', 'validate'] },
  { id: 'sql-formatter', name: 'SQL Formatter', blurb: 'Beautify and format SQL queries.', category: 'code', icon: Database, keywords: ['sql', 'format', 'beautify', 'query'] },
  { id: 'code-beautifier', name: 'Code Beautifier', blurb: 'Format and minify CSS, JavaScript and HTML.', category: 'code', icon: FileCode, keywords: ['css', 'javascript', 'html', 'beautify', 'minify', 'format'] },
  { id: 'markdown-preview', name: 'Markdown Preview', blurb: 'Write markdown on the left, see rendered output on the right.', category: 'code', icon: FileTextIcon, keywords: ['markdown', 'md', 'preview', 'render'] },
  { id: 'regex-tester', name: 'Regex Tester', blurb: 'Test regular expressions with live highlighting and match info.', category: 'code', icon: Search, keywords: ['regex', 'regular expression', 'pattern', 'match'] },
  { id: 'jwt-decoder', name: 'JWT Decoder', blurb: 'Decode JSON Web Tokens and inspect header, payload and signature.', category: 'code', icon: Key, keywords: ['jwt', 'token', 'decode', 'auth'] },
  { id: 'debug-log', name: 'Debug Log Formatter', blurb: 'Prettify minified JSON logs and stack traces.', category: 'code', icon: FileSearch, keywords: ['debug', 'log', 'prettify', 'stack trace', 'json log'] },

  // ---------- Encode ----------
  { id: 'base64', name: 'Base64 Encoder / Decoder', blurb: 'Encode text or files to Base64 and decode back.', category: 'encode', icon: FileCode, keywords: ['base64', 'encode', 'decode', 'data uri'] },
  { id: 'url-encode', name: 'URL Encoder / Decoder', blurb: 'Percent-encode and decode URLs and query strings.', category: 'encode', icon: GlobeIcon, keywords: ['url', 'encode', 'decode', 'percent', 'query string'] },
  { id: 'html-encode', name: 'HTML Encoder / Decoder', blurb: 'Escape and unescape HTML special characters.', category: 'encode', icon: FileCodeIcon, keywords: ['html', 'escape', 'unescape', 'encode', 'entities'] },

  // ---------- Generate ----------
  { id: 'uuid-generator', name: 'UUID Generator', blurb: 'Bulk-generate cryptographically secure UUIDv4 identifiers.', category: 'generate', icon: Fingerprint, keywords: ['uuid', 'guid', 'id', 'unique'] },
  { id: 'password-generator', name: 'Password Generator', blurb: 'Strong random passwords with entropy meter — never leaves your device.', category: 'generate', icon: KeyRound, keywords: ['password', 'random', 'secure', 'strong'] },
  { id: 'qr-code-generator', name: 'QR Code Generator', blurb: 'Create custom-colored QR codes and download as PNG.', category: 'generate', icon: QrCode, keywords: ['qr', 'barcode', 'link', 'code'] },
  { id: 'favicon-generator', name: 'Favicon Generator', blurb: 'Generate every favicon size your website needs from one image.', category: 'generate', icon: Star, keywords: ['favicon', 'icon', 'website', 'ico', 'apple-touch-icon'] },
  { id: 'gitignore-gen', name: '.gitignore Generator', blurb: 'Generate a .gitignore file for any project type.', category: 'generate', icon: FileDown, keywords: ['gitignore', 'git', 'ignore', 'template'] },
  { id: 'license-gen', name: 'License Generator', blurb: 'Generate MIT, Apache 2.0, GPL and other LICENSE files.', category: 'generate', icon: BookOpen, keywords: ['license', 'mit', 'apache', 'gpl', 'open source'] },
  { id: 'docker-gen', name: 'Docker Compose Generator', blurb: 'Generate docker-compose.yml for common services.', category: 'generate', icon: Box, keywords: ['docker', 'compose', 'yaml', 'container', 'service'] },
  { id: 'cron-gen', name: 'Cron Expression Generator', blurb: 'Build and understand cron schedules with human-readable descriptions.', category: 'generate', icon: Clock, keywords: ['cron', 'schedule', 'timer', 'jobs'] },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', blurb: 'Placeholder text for designs, by paragraph, sentence or word.', category: 'generate', icon: FileText, keywords: ['placeholder', 'dummy text', 'filler', 'lorem'] },
  { id: 'slug-generator', name: 'Slug Generator', blurb: 'Turn any title into a clean, URL-friendly slug.', category: 'generate', icon: Link2, keywords: ['slug', 'url', 'seo', 'permalink', 'slugify'] },

  // ---------- Dev Reference ----------
  { id: 'binary-hex', name: 'Binary / Hex / Octal Converter', blurb: 'Convert between decimal, binary, hexadecimal and octal instantly.', category: 'devref', icon: Binary, keywords: ['binary', 'hex', 'octal', 'decimal', 'converter', 'number base'] },
  { id: 'utf8-inspector', name: 'UTF-8 Inspector', blurb: 'Inspect Unicode codepoints, byte sequences and character properties.', category: 'devref', icon: Eye, keywords: ['utf8', 'unicode', 'codepoint', 'encoding', 'bytes'] },
  { id: 'nginx-gen', name: 'Nginx Config Generator', blurb: 'Generate nginx server blocks, reverse proxies and SSL configs.', category: 'devref', icon: Server, keywords: ['nginx', 'config', 'reverse proxy', 'server block', 'ssl'] },
  { id: 'ascii-table', name: 'ASCII / Unicode Table', blurb: 'Browse ASCII and Unicode character tables with codes and descriptions.', category: 'devref', icon: Table2, keywords: ['ascii', 'unicode', 'character', 'table', 'code chart'] },
  { id: 'timestamp-converter', name: 'Timestamp Converter', blurb: 'Convert Unix timestamps to human-readable dates and back.', category: 'devref', icon: Clock, keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'converter'] },

  // ---------- Design ----------
  { id: 'color-converter', name: 'Color Converter', blurb: 'Convert HEX ↔ RGB ↔ HSL and browse tints & shades.', category: 'design', icon: Pipette, keywords: ['hex', 'rgb', 'hsl', 'color', 'picker'] },
  { id: 'palette-generator', name: 'Palette Generator', blurb: 'Generate beautiful color harmonies and export CSS variables.', category: 'design', icon: Palette, keywords: ['colors', 'scheme', 'harmony', 'palette', 'css variables'] },
  { id: 'gradient-maker', name: 'CSS Gradient Maker', blurb: 'Design linear and radial gradients, copy ready-to-use CSS.', category: 'design', icon: Droplets, keywords: ['gradient', 'css', 'background', 'linear', 'radial'] },

  // ---------- Premium ----------
  { id: 'er-diagram', name: 'ER Diagram Builder', blurb: 'Generate entity-relationship diagrams from SQL or visual editor.', category: 'premium', icon: Network, keywords: ['er', 'erd', 'diagram', 'database', 'schema', 'entity relationship', 'dbdiagram'], premium: true },
  { id: 'graphql-builder', name: 'GraphQL Schema Builder', blurb: 'Build GraphQL schemas visually with live SDL preview.', category: 'premium', icon: GitBranch, keywords: ['graphql', 'schema', ' sdl', 'types', 'queries', 'mutations'], premium: true },
  { id: 'openapi-designer', name: 'OpenAPI Designer', blurb: 'Design REST APIs visually — exports OpenAPI 3.0 spec.', category: 'premium', icon: Layers, keywords: ['openapi', 'swagger', 'rest', 'api', 'spec', 'design'], premium: true },
  { id: 'css-animation', name: 'CSS Animation Builder', blurb: 'Create keyframe animations visually with live preview.', category: 'premium', icon: Sparkles, keywords: ['css', 'animation', 'keyframes', 'transition', 'animate'], premium: true },
  { id: 'api-docs-gen', name: 'API Documentation Generator', blurb: 'Generate beautiful API docs from OpenAPI specs or manual input.', category: 'premium', icon: BookOpen, keywords: ['api', 'docs', 'documentation', 'openapi', 'swagger', 'readme'], premium: true },
  { id: 'ts-type-gen', name: 'TypeScript Type Generator', blurb: 'Generate TypeScript interfaces from JSON, GraphQL or API responses.', category: 'premium', icon: Brackets, keywords: ['typescript', 'types', 'interface', 'generate', 'json2ts', 'codegen'], premium: true },
  { id: 'regex-visualizer', name: 'Regex Visualizer', blurb: 'See your regex as a visual flowchart — understand patterns instantly.', category: 'premium', icon: Workflow, keywords: ['regex', 'visual', 'flowchart', 'diagram', 'pattern', 'understand'], premium: true },
  { id: 'sql-visualizer', name: 'SQL Query Visualizer', blurb: 'Visualize SQL query execution plans and table relationships.', category: 'premium', icon: GitBranch, keywords: ['sql', 'explain', 'query plan', 'visualize', 'execution', 'database'], premium: true },

  // ---------- Text ----------
  { id: 'case-converter', name: 'Case Converter', blurb: 'UPPER, lower, Title, camelCase, snake_case, kebab-case and more.', category: 'text', icon: Type, keywords: ['uppercase', 'lowercase', 'capitalize', 'camelcase', 'snake_case', 'kebab-case'] },
  { id: 'text-diff', name: 'Text Diff Checker', blurb: 'Compare two texts line by line and spot every change.', category: 'text', icon: Scissors, keywords: ['compare', 'difference', 'diff', 'changes'] },
]

export function toolsByCategory(cat: CategoryId): Tool[] {
  return TOOLS.filter((t) => t.category === cat)
}

export function getTool(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id)
}

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase()
  if (!q) return TOOLS
  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.blurb.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q)),
  )
}
