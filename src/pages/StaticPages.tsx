import { Link } from 'react-router-dom'
import { SITE } from '../lib/config'
import { useMeta } from '../lib/utils'
import { TOOLS } from '../lib/tools'

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <div className="prose-zinc mt-6 space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{children}</div>
    </article>
  )
}

export function About() {
  useMeta('About — OmniTools', 'Why OmniTools exists: one fast, private, free developer toolbox with 41 tools.')
  return (
    <Shell title="About OmniTools">
      <p>
        OmniTools started with a simple frustration: developer tasks — formatting JSON, testing regex, building ER diagrams,
        designing APIs — were scattered across expensive paid tools and sketchy free sites full of pop-ups and forced sign-ups.
      </p>
      <p>
        We built something better: <strong>{TOOLS.length} tools on one fast site</strong>, where almost everything runs
        entirely inside your browser. Your files are processed on your own device — we physically cannot see them.
        AI-powered tools are clearly marked and run through a minimal serverless endpoint.
      </p>
      <p>
        The core tools will always be free. Ads and an optional Premium plan keep the lights on. No accounts, no
        trackers beyond standard analytics, no nonsense.
      </p>
      <p>
        Contact: <a className="text-indigo-500 underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
      </p>
    </Shell>
  )
}

export function Privacy() {
  useMeta('Privacy Policy — OmniTools', 'Privacy policy for OmniTools.')
  return (
    <Shell title="Privacy Policy">
      <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
      <h2 className="pt-2 text-lg font-bold text-zinc-900 dark:text-white">Files &amp; data processing</h2>
      <p>
        All developer tools process data <strong>locally in your browser</strong>.
        Your code, data and inputs are never transmitted to or stored on our servers.
      </p>
      <h2 className="pt-2 text-lg font-bold text-zinc-900 dark:text-white">AI tools</h2>
      <p>
        Tools labelled “AI” send the text you submit to a serverless AI model endpoint in order to generate results.
        Submitted prompts are processed by the AI provider under its terms and are not stored by us.
      </p>
      <h2 className="pt-2 text-lg font-bold text-zinc-900 dark:text-white">Cookies &amp; advertising</h2>
      <p>
        We store small preferences (like your theme choice) in your browser's local storage. If advertising is enabled,
        third parties such as Google may use cookies to serve ads based on your prior visits. You can opt out of
        personalized advertising via Google Ads Settings.
      </p>
      <h2 className="pt-2 text-lg font-bold text-zinc-900 dark:text-white">Analytics</h2>
      <p>We may use privacy-friendly aggregate analytics to understand which tools are useful.</p>
      <h2 className="pt-2 text-lg font-bold text-zinc-900 dark:text-white">Contact</h2>
      <p>Questions about this policy: <a className="text-indigo-500 underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></p>
    </Shell>
  )
}

export function Terms() {
  useMeta('Terms of Service — OmniTools', 'Terms of service for OmniTools.')
  return (
    <Shell title="Terms of Service">
      <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
      <p>
        By using {SITE.name} you agree to these terms. The tools are provided “as is” without warranties of any kind.
        While we work hard to make every tool accurate and reliable, always double-check critical output before relying
        on it (legal documents, financial decisions, published content).
      </p>
      <p>You agree not to misuse the service: no attempts to disrupt availability, scrape at scale, or use AI tools to generate unlawful content.</p>
      <p>Premium subscriptions renew monthly until cancelled and can be cancelled at any time from your receipt email.</p>
      <p>Contact: <a className="text-indigo-500 underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></p>
    </Shell>
  )
}

export function NotFound() {
  useMeta('Page not found — OmniTools')
  return (
    <div className="py-24 text-center">
      <p className="text-7xl font-extrabold text-indigo-500">404</p>
      <h1 className="mt-4 text-2xl font-bold">That page doesn't exist</h1>
      <p className="mt-2 text-zinc-500">The tool you're looking for may have moved.</p>
      <Link to="/" className="btn-primary mt-6">Browse all tools</Link>
    </div>
  )
}

const GUIDES = [
  {
    slug: 'format-json-like-a-pro',
    title: 'How to Format JSON Like a Pro',
    body: `Messy JSON is one of the most common developer headaches — whether it's a curl response, a config file, or a log entry. Use the JSON Formatter to pretty-print with consistent indentation (2 or 4 spaces), sort keys alphabetically for easy diffing, or minify for production.\n\nPro tip: paste minified JSON from a CI/CD log output and the formatter will immediately reveal nested structure. If you see "Unexpected token" errors, the formatter will highlight exactly where the syntax breaks — usually a trailing comma or missing quote.`,
  },
  {
    slug: 'understand-regex-with-visual-flowcharts',
    title: 'Understand Regex Patterns with Visual Flowcharts',
    body: `Regular expressions are powerful but notoriously hard to read. The Regex Visualizer converts your pattern into a visual flowchart, showing each component — character sets, quantifiers, groups, anchors — as labeled blocks connected by arrows.\n\nStart by pasting your regex into the Regex Tester to verify it matches expected input, then switch to the Visualizer to understand why. This is especially useful when debugging patterns you inherited from a colleague or Stack Overflow. The visual breakdown reveals exactly what each part of the pattern does.`,
  },
  {
    slug: 'design-rest-apis-with-openapi',
    title: 'Design REST APIs with the OpenAPI Designer',
    body: `Before writing a single line of backend code, design your API endpoints visually. The OpenAPI Designer lets you add endpoints with methods, paths, summaries and response codes, then exports a valid OpenAPI 3.0 JSON spec.\n\nStart with your core CRUD operations: GET /resources for listing, POST /resources for creating, GET /resources/:id for reading. Add response descriptions for each status code (200, 201, 404, 500). The exported spec can be imported into Swagger UI, Postman, or any OpenAPI-compatible tool for immediate testing.`,
  },
]

export function Guides() {
  useMeta('Guides — OmniTools', 'Practical guides: format JSON, understand regex, design REST APIs and more.')
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Guides</h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">Short, practical walkthroughs for getting more out of the tools.</p>
      <div className="mt-8 space-y-10">
        {GUIDES.map((g) => (
          <article key={g.slug} id={g.slug} className="card p-6">
            <h2 className="text-xl font-bold">{g.title}</h2>
            {g.body.split('\n\n').map((para, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{para}</p>
            ))}
          </article>
        ))}
      </div>
    </div>
  )
}
