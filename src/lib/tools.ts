import {
  Cake,
  Equal,
  Calculator,
  Code,
  DollarSign,
  Droplets,
  FileCode,
  FilePlus,
  FileText,
  Files,
  Fingerprint,
  Hash,
  Image as ImageIcon,
  KeyRound,
  Lightbulb,
  Link2,
  Maximize2,
  Palette,
  Percent,
  Pipette,
  QrCode,
  Ruler,
  Wand2,
  AlignLeft,
  Braces,
  Dumbbell,
  GitCompare,
  RefreshCw,
  Scissors,
  ShoppingBag,
  Sparkles,
  Star,
  Quote,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type CategoryId = 'pdf' | 'image' | 'text' | 'design' | 'dev' | 'calc' | 'ai'

export interface Category {
  id: CategoryId
  label: string
  tagline: string
  icon: LucideIcon
  gradient: string
}

export const CATEGORIES: Category[] = [
  { id: 'pdf', label: 'PDF Tools', tagline: 'Merge, split & convert PDFs right in your browser.', icon: FileText, gradient: 'from-rose-500 to-orange-500' },
  { id: 'image', label: 'Image Tools', tagline: 'Compress, resize and convert images without uploading them anywhere.', icon: ImageIcon, gradient: 'from-sky-500 to-cyan-500' },
  { id: 'text', label: 'Text Tools', tagline: 'Count, convert, compare and clean up any text.', icon: Type, gradient: 'from-violet-500 to-purple-500' },
  { id: 'design', label: 'Design Tools', tagline: 'Colors, palettes and gradients for your next project.', icon: Palette, gradient: 'from-fuchsia-500 to-pink-500' },
  { id: 'dev', label: 'Developer Tools', tagline: 'Formatters, generators and encoders for builders.', icon: Code, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'calc', label: 'Calculators', tagline: 'Fast answers for money, health and everyday math.', icon: Calculator, gradient: 'from-amber-500 to-yellow-500' },
  { id: 'ai', label: 'AI Tools', tagline: 'Summarize, rewrite and generate content with free AI.', icon: Sparkles, gradient: 'from-indigo-500 to-blue-500' },
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
  // ---------- PDF ----------
  { id: 'merge-pdf', name: 'Merge PDF', blurb: 'Combine multiple PDFs into one document, in any order.', category: 'pdf', icon: Files, keywords: ['combine', 'join', 'pdf'] },
  { id: 'split-pdf', name: 'Split PDF', blurb: 'Extract page ranges or split a PDF into separate files.', category: 'pdf', icon: Scissors, keywords: ['extract', 'pages', 'divide', 'pdf'] },
  { id: 'images-to-pdf', name: 'Images to PDF', blurb: 'Turn JPG, PNG or WebP images into a single PDF.', category: 'pdf', icon: FilePlus, keywords: ['jpg', 'png', 'convert', 'photo', 'scan'] },

  // ---------- Image ----------
  { id: 'image-compressor', name: 'Image Compressor', blurb: 'Shrink JPG/WebP file sizes with a quality slider — see savings live.', category: 'image', icon: ImageIcon, keywords: ['compress', 'optimize', 'reduce size', 'tinypng'] },
  { id: 'image-resizer', name: 'Image Resizer', blurb: 'Resize images to exact pixel dimensions, keeping aspect ratio.', category: 'image', icon: Maximize2, keywords: ['scale', 'dimensions', 'resize'] },
  { id: 'image-converter', name: 'Image Converter', blurb: 'Convert between PNG, JPEG and WebP instantly.', category: 'image', icon: RefreshCw, keywords: ['convert', 'webp', 'jpg', 'png'] },
  { id: 'base64-image', name: 'Base64 Image Encoder', blurb: 'Encode images to base64 data URLs or decode them back.', category: 'image', icon: FileCode, keywords: ['base64', 'data uri', 'encode', 'decode'] },
  { id: 'favicon-generator', name: 'Favicon Generator', blurb: 'Generate every favicon size your website needs from one image.', category: 'image', icon: Star, keywords: ['favicon', 'icon', 'website', 'ico'] },

  // ---------- Text ----------
  { id: 'word-counter', name: 'Word Counter', blurb: 'Live word, character and reading-time stats plus keyword density.', category: 'text', icon: AlignLeft, keywords: ['words', 'characters', 'count', 'seo'] },
  { id: 'case-converter', name: 'Case Converter', blurb: 'UPPER, lower, Title, Sentence, camelCase, snake_case and more.', category: 'text', icon: Type, keywords: ['uppercase', 'lowercase', 'capitalize', 'camelcase'] },
  { id: 'text-diff', name: 'Text Diff Checker', blurb: 'Compare two texts line by line and spot every change.', category: 'text', icon: GitCompare, keywords: ['compare', 'difference', 'diff'] },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', blurb: 'Placeholder text for designs, by paragraph, sentence or word.', category: 'text', icon: Quote, keywords: ['placeholder', 'dummy text', 'filler'] },
  { id: 'slug-generator', name: 'Slug Generator', blurb: 'Turn any title into a clean, SEO-friendly URL slug.', category: 'text', icon: Link2, keywords: ['url', 'seo', 'slugify', 'permalink'] },

  // ---------- Design ----------
  { id: 'color-converter', name: 'Color Converter', blurb: 'Convert HEX ↔ RGB ↔ HSL and browse tints & shades.', category: 'design', icon: Pipette, keywords: ['hex', 'rgb', 'hsl', 'color'] },
  { id: 'palette-generator', name: 'Palette Generator', blurb: 'Generate beautiful color harmonies and export CSS variables.', category: 'design', icon: Palette, keywords: ['colors', 'scheme', 'harmony', 'palette'] },
  { id: 'gradient-maker', name: 'CSS Gradient Maker', blurb: 'Design linear and radial gradients, copy ready-to-use CSS.', category: 'design', icon: Droplets, keywords: ['gradient', 'css', 'background'] },

  // ---------- Developer ----------
  { id: 'json-formatter', name: 'JSON Formatter', blurb: 'Pretty-print, validate and minify JSON with error locations.', category: 'dev', icon: Braces, keywords: ['json', 'format', 'validate', 'minify'] },
  { id: 'hash-generator', name: 'Hash Generator', blurb: 'SHA-1/256/384/512 hashes for text or files, fully offline.', category: 'dev', icon: Hash, keywords: ['sha256', 'checksum', 'hash'] },
  { id: 'uuid-generator', name: 'UUID Generator', blurb: 'Bulk-generate cryptographically secure UUIDv4 identifiers.', category: 'dev', icon: Fingerprint, keywords: ['uuid', 'guid', 'id'] },
  { id: 'password-generator', name: 'Password Generator', blurb: 'Strong random passwords with entropy meter — never leaves your device.', category: 'dev', icon: KeyRound, keywords: ['password', 'random', 'secure'] },
  { id: 'qr-code-generator', name: 'QR Code Generator', blurb: 'Create custom-colored QR codes and download as PNG.', category: 'dev', icon: QrCode, keywords: ['qr', 'barcode', 'link'] },

  // ---------- Calculators ----------
  { id: 'calculator', name: 'Calculator', blurb: 'Full Apple-style calculator with scientific mode, history tape and keyboard support.', category: 'calc', icon: Equal, keywords: ['calculator', 'math', 'arithmetic', 'scientific', 'apple'] },
  { id: 'percentage-calculator', name: 'Percentage Calculator', blurb: 'Three percentage modes: of-value, share and % change.', category: 'calc', icon: Percent, keywords: ['percent', 'change', 'increase'] },
  { id: 'loan-calculator', name: 'Loan / EMI Calculator', blurb: 'Monthly payments, total interest and a year-by-year schedule.', category: 'calc', icon: DollarSign, keywords: ['loan', 'emi', 'mortgage', 'interest'] },
  { id: 'bmi-calculator', name: 'BMI Calculator', blurb: 'Body mass index in metric or imperial with healthy-range guidance.', category: 'calc', icon: Dumbbell, keywords: ['bmi', 'weight', 'health'] },
  { id: 'age-calculator', name: 'Age Calculator', blurb: 'Exact age in years, months and days — plus next birthday countdown.', category: 'calc', icon: Cake, keywords: ['age', 'birthday', 'date'] },
  { id: 'unit-converter', name: 'Unit Converter', blurb: 'Length, mass, temperature, data, speed, area and volume.', category: 'calc', icon: Ruler, keywords: ['convert', 'metric', 'imperial', 'units'] },

  // ---------- AI ----------
  { id: 'ai-summarizer', name: 'AI Summarizer', blurb: 'Condense articles, papers and emails into key points.', category: 'ai', icon: FileText, keywords: ['summary', 'tldr', 'ai'] },
  { id: 'ai-paraphraser', name: 'AI Paraphraser', blurb: 'Rewrite any text in formal, casual or concise tones.', category: 'ai', icon: Wand2, keywords: ['rewrite', 'rephrase', 'quillbot', 'ai'] },
  { id: 'ai-title-generator', name: 'AI Blog Title Generator', blurb: 'Ten clickable, SEO-friendly headlines from one topic.', category: 'ai', icon: Lightbulb, keywords: ['titles', 'headlines', 'blog', 'seo'] },
  { id: 'ai-product-description', name: 'AI Product Description Writer', blurb: 'Persuasive e-commerce copy from a product name and features.', category: 'ai', icon: ShoppingBag, keywords: ['product', 'ecommerce', 'copywriting'] },
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
