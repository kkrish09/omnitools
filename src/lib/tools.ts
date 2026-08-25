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
  Star as StarIcon,
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
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type CategoryId = 'code' | 'encode' | 'generate' | 'design' | 'text'

export interface Category {
  id: CategoryId
  label: string
  tagline: string
  icon: LucideIcon
  gradient: string
}

export const CATEGORIES: Category[] = [
  { id: 'code', label: 'Code Tools', tagline: 'Formatters, validators, and testers for every language.', icon: Code, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'encode', label: 'Encode & Decode', tagline: 'Base64, URL, HTML encoding and JWT decoding.', icon: Key, gradient: 'from-sky-500 to-cyan-500' },
  { id: 'generate', label: 'Generators', tagline: 'UUIDs, passwords, QR codes, gitignore, licenses and more.', icon: Terminal, gradient: 'from-violet-500 to-purple-500' },
  { id: 'design', label: 'Design', tagline: 'Colors, palettes and gradients for frontend devs.', icon: PaletteIcon, gradient: 'from-fuchsia-500 to-pink-500' },
  { id: 'text', label: 'Text', tagline: 'Case conversion, diff comparison and more.', icon: Type, gradient: 'from-amber-500 to-orange-500' },
]

export interface Tool {
  id: string
  name: string
  blurb: string
  category: CategoryId
  icon: LucideIcon
  keywords: string[]
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

  // ---------- Design ----------
  { id: 'color-converter', name: 'Color Converter', blurb: 'Convert HEX ↔ RGB ↔ HSL and browse tints & shades.', category: 'design', icon: Pipette, keywords: ['hex', 'rgb', 'hsl', 'color', 'picker'] },
  { id: 'palette-generator', name: 'Palette Generator', blurb: 'Generate beautiful color harmonies and export CSS variables.', category: 'design', icon: Palette, keywords: ['colors', 'scheme', 'harmony', 'palette', 'css variables'] },
  { id: 'gradient-maker', name: 'CSS Gradient Maker', blurb: 'Design linear and radial gradients, copy ready-to-use CSS.', category: 'design', icon: Droplets, keywords: ['gradient', 'css', 'background', 'linear', 'radial'] },

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
