// Central site configuration — fill these in to switch on monetization.
export const SITE = {
  name: 'OmniTools',
  tagline: 'Developer tools that respect your time.',
  description:
    '41 developer tools: JSON formatter, YAML converter, regex tester, ER diagram builder, GraphQL schema editor, TypeScript type generator and more. All client-side, zero uploads.',
  // Replace with your real domain after deploying to Cloudflare Pages.
  url: 'https://omnitoolsapp.pages.dev',

  // ---- Monetization switches (all optional, zero cost to leave blank) ----
  // Google AdSense publisher ID, e.g. 'ca-pub-1234567890123456'.
  adsenseClient: 'ca-pub-2828002597119301',
  // Stripe payment links for the Premium plan (create free at stripe.com/payment-links).
  stripeLinks: {
    pro: '',
  },
  // Newsletter endpoint (e.g. a Formspree/FormSubmit URL). Blank hides the form.
  newsletterEndpoint: '',
  contactEmail: 'hello@omnitools.app',
  // Affiliate partners shown in the footer "Recommended" section.
  affiliates: [
    {
      name: 'Cloudflare',
      url: 'https://www.cloudflare.com/',
      blurb: 'The free-tier hosting that powers this site.',
    },
    {
      name: 'Notion',
      url: 'https://www.notion.so/',
      blurb: 'Notes, docs and databases — free plan included.',
    },
  ] as { name: string; url: string; blurb: string }[],
}

// Free daily AI generations before the upgrade prompt appears.
export const AI_FREE_DAILY_LIMIT = 1

// Daily AI generations included with Pro.
export const AI_PRO_DAILY_LIMIT = 100

// Premium tools: 1 free use/day for free users, unlimited for Pro.
export const PREMIUM_DAILY_LIMIT = 1

// IDs of tools that require Pro for unlimited use.
export const PREMIUM_TOOL_IDS = [
  'er-diagram',
  'graphql-builder',
  'openapi-designer',
  'css-animation',
  'api-docs-gen',
  'ts-type-gen',
  'regex-visualizer',
  'sql-visualizer',
]
