import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type ToolComponent = LazyExoticComponent<ComponentType>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pick = (mod: any, key: string) => ({ default: mod[key] })

export const TOOL_COMPONENTS: Record<string, ToolComponent> = {
  // Code
  'json-formatter': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'JsonFormatter'))),
  'yaml-json': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'YamlJson'))),
  'csv-json': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'CsvJson'))),
  'xml-formatter': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'XmlFormatter'))),
  'sql-formatter': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'SqlFormatter'))),
  'code-beautifier': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'CodeBeautifier'))),
  'markdown-preview': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'MarkdownPreview'))),
  'regex-tester': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'RegexTester'))),
  'jwt-decoder': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'JwtDecoder'))),
  'debug-log': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'DebugLog'))),
  // Encode
  'base64': lazy(() => import('../tools/encode-tools').then((m) => pick(m, 'Base64Tool'))),
  'url-encode': lazy(() => import('../tools/encode-tools').then((m) => pick(m, 'UrlEncode'))),
  'html-encode': lazy(() => import('../tools/encode-tools').then((m) => pick(m, 'HtmlEncode'))),
  // Generate
  'uuid-generator': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'UuidGenerator'))),
  'password-generator': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'PasswordGenerator'))),
  'qr-code-generator': lazy(() => import('../tools/dev-tools').then((m) => pick(m, 'QrGenerator'))),
  'favicon-generator': lazy(() => import('../tools/generate-tools').then((m) => pick(m, 'FaviconGenerator'))),
  'gitignore-gen': lazy(() => import('../tools/generate-tools').then((m) => pick(m, 'GitignoreGen'))),
  'license-gen': lazy(() => import('../tools/generate-tools').then((m) => pick(m, 'LicenseGen'))),
  'docker-gen': lazy(() => import('../tools/generate-tools').then((m) => pick(m, 'DockerGen'))),
  'cron-gen': lazy(() => import('../tools/generate-tools').then((m) => pick(m, 'CronGen'))),
  'lorem-ipsum': lazy(() => import('../tools/generate-tools').then((m) => pick(m, 'LoremIpsum'))),
  'slug-generator': lazy(() => import('../tools/generate-tools').then((m) => pick(m, 'SlugGenerator'))),
  // Dev Reference
  'binary-hex': lazy(() => import('../tools/devref-tools').then((m) => pick(m, 'BinaryHex'))),
  'utf8-inspector': lazy(() => import('../tools/devref-tools').then((m) => pick(m, 'Utf8Inspector'))),
  'nginx-gen': lazy(() => import('../tools/devref-tools').then((m) => pick(m, 'NginxGen'))),
  'ascii-table': lazy(() => import('../tools/devref-tools').then((m) => pick(m, 'AsciiTable'))),
  'timestamp-converter': lazy(() => import('../tools/devref-tools').then((m) => pick(m, 'TimestampConverter'))),
  // Design
  'color-converter': lazy(() => import('../tools/design-tools').then((m) => pick(m, 'ColorConverter'))),
  'palette-generator': lazy(() => import('../tools/design-tools').then((m) => pick(m, 'PaletteGenerator'))),
  'gradient-maker': lazy(() => import('../tools/design-tools').then((m) => pick(m, 'GradientMaker'))),
  // Premium
  'er-diagram': lazy(() => import('../tools/premium-tools').then((m) => pick(m, 'ErDiagram'))),
  'graphql-builder': lazy(() => import('../tools/premium-tools').then((m) => pick(m, 'GraphqlBuilder'))),
  'openapi-designer': lazy(() => import('../tools/premium-tools').then((m) => pick(m, 'OpenapiDesigner'))),
  'css-animation': lazy(() => import('../tools/premium-tools').then((m) => pick(m, 'CssAnimation'))),
  'api-docs-gen': lazy(() => import('../tools/premium-tools').then((m) => pick(m, 'ApiDocsGen'))),
  'ts-type-gen': lazy(() => import('../tools/premium-tools').then((m) => pick(m, 'TsTypeGen'))),
  'regex-visualizer': lazy(() => import('../tools/premium-tools').then((m) => pick(m, 'RegexVisualizer'))),
  'sql-visualizer': lazy(() => import('../tools/premium-tools').then((m) => pick(m, 'SqlVisualizer'))),
  // Text
  'case-converter': lazy(() => import('../tools/text-tools').then((m) => pick(m, 'CaseConverter'))),
  'text-diff': lazy(() => import('../tools/text-tools').then((m) => pick(m, 'TextDiff'))),
}
