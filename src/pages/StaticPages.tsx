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
  useMeta('About — OmniTools', 'Why OmniTools exists: one fast, private, free toolbox for everyday digital tasks.')
  return (
    <Shell title="About OmniTools">
      <p>
        OmniTools started with a simple frustration: everyday digital tasks — merging a PDF, compressing a photo,
        making a QR code — were scattered across sketchy sites full of pop-ups, forced sign-ups and file uploads to
        unknown servers.
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
        All PDF, image, text, design, developer and calculator tools process data <strong>locally in your browser</strong>.
        Your files and inputs are never transmitted to or stored on our servers.
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
    slug: 'compress-images-without-losing-quality',
    title: 'How to Compress Images Without Losing Quality',
    body: `Large images are the #1 reason websites load slowly. Start with the right format: WebP typically produces files 25–35% smaller than JPEG at the same visual quality. Use the Image Compressor tool, set quality between 0.6 and 0.8, and compare the preview against the original — most people cannot tell the difference below 0.75.\n\nFor photos, JPEG or WebP is ideal. For screenshots, logos and graphics with sharp edges or transparency, stick with PNG. Resize images to the largest size they'll actually be displayed at before compressing; there's no point shipping a 4000px-wide image into a 800px container.`,
  },
  {
    slug: 'merge-pdf-files-the-right-way',
    title: 'Merge PDF Files the Right Way',
    body: `Combining PDFs is useful for job applications (cover letter + CV + portfolio), expense reports (receipts), and legal bundles. Arrange documents logically before merging: newest first for statements, chronological order for reports.\n\nBecause our Merge PDF tool runs inside your browser, sensitive documents like contracts and medical records never touch a server. If a merged PDF looks wrong, check that the source files aren't password protected — unlock them first with their owner password.`,
  },
  {
    slug: 'write-better-prompts-for-ai-tools',
    title: 'Write Better Prompts for AI Writing Tools',
    body: `The quality of AI output depends almost entirely on input specificity. Instead of "summarize this", tell the tool the audience ("for a busy executive") and the format ("three bullet points"). For paraphrasing, name the tone: formal for business emails, concise for landing pages, casual for social posts.\n\nWhen generating blog titles, include the keyword you want to rank for and mention the reader's benefit. Then combine the best parts of two suggestions — AI titles are starting points, not finals. Always edit: add numbers, power words and clarity.`,
  },
]

export function Guides() {
  useMeta('Guides — OmniTools', 'Practical guides: compress images, merge PDFs and write better AI prompts.')
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
