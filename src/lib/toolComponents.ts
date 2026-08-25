import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type ToolComponent = LazyExoticComponent<ComponentType>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pick = (mod: any, key: string) => ({ default: mod[key] })

export const TOOL_COMPONENTS: Record<string, ToolComponent> = {
  // PDF
  'merge-pdf': lazy(() => import('../tools/pdf-tools').then((m) => pick(m, 'MergePdf'))),
  'split-pdf': lazy(() => import('../tools/pdf-tools').then((m) => pick(m, 'SplitPdf'))),
  'images-to-pdf': lazy(() => import('../tools/pdf-tools').then((m) => pick(m, 'ImagesToPdf'))),
  // Image
  'image-compressor': lazy(() => import('../tools/image-tools').then((m) => pick(m, 'ImageCompressor'))),
  'image-resizer': lazy(() => import('../tools/image-tools').then((m) => pick(m, 'ImageResizer'))),
  'image-converter': lazy(() => import('../tools/image-tools').then((m) => pick(m, 'ImageConverter'))),
  'base64-image': lazy(() => import('../tools/image-tools').then((m) => pick(m, 'Base64Image'))),
  'favicon-generator': lazy(() => import('../tools/image-tools').then((m) => pick(m, 'FaviconGenerator'))),
  // Text
  'word-counter': lazy(() => import('../tools/text-tools').then((m) => pick(m, 'WordCounter'))),
  'case-converter': lazy(() => import('../tools/text-tools').then((m) => pick(m, 'CaseConverter'))),
  'text-diff': lazy(() => import('../tools/text-tools').then((m) => pick(m, 'TextDiff'))),
  'lorem-ipsum': lazy(() => import('../tools/text-tools').then((m) => pick(m, 'LoremIpsum'))),
  'slug-generator': lazy(() => import('../tools/text-tools').then((m) => pick(m, 'SlugGenerator'))),
  // Design
  'color-converter': lazy(() => import('../tools/design-tools').then((m) => pick(m, 'ColorConverter'))),
  'palette-generator': lazy(() => import('../tools/design-tools').then((m) => pick(m, 'PaletteGenerator'))),
  'gradient-maker': lazy(() => import('../tools/design-tools').then((m) => pick(m, 'GradientMaker'))),
  // Dev
  'json-formatter': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'JsonFormatter'))),
  'hash-generator': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'HashGenerator'))),
  'uuid-generator': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'UuidGenerator'))),
  'password-generator': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'PasswordGenerator'))),
  'qr-code-generator': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'QrGenerator'))),
  // Calculators
  'calculator': lazy(() => import('../tools/calc-tools').then((m) => pick(m, 'Calculator'))),
  'percentage-calculator': lazy(() => import('../tools/calc-tools').then((m) => pick(m, 'PercentageCalculator'))),
  'loan-calculator': lazy(() => import('../tools/calc-tools').then((m) => pick(m, 'LoanCalculator'))),
  'bmi-calculator': lazy(() => import('../tools/calc-tools').then((m) => pick(m, 'BmiCalculator'))),
  'age-calculator': lazy(() => import('../tools/calc-tools').then((m) => pick(m, 'AgeCalculator'))),
  'unit-converter': lazy(() => import('../tools/calc-tools').then((m) => pick(m, 'UnitConverter'))),
  // AI
  'ai-summarizer': lazy(() => import('../tools/ai-tools').then((m) => pick(m, 'AiSummarizer'))),
  'ai-paraphraser': lazy(() => import('../tools/ai-tools').then((m) => pick(m, 'AiParaphraser'))),
  'ai-title-generator': lazy(() => import('../tools/ai-tools').then((m) => pick(m, 'AiTitleGenerator'))),
  'ai-product-description': lazy(() => import('../tools/ai-tools').then((m) => pick(m, 'AiProductDescription'))),
}
