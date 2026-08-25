# OmniTools — 30 Free Online Tools (money-ready website)

A complete, production-built toolbox website: **PDF · Image · Text · Design · Developer · Calculators · AI**.
Everything runs client-side in the browser (files never touch a server), so it's **free to host at scale**
and privacy-friendly — the same model that makes iLovePDF, TinyPNG and QuillBot money.

**Stack:** Vite + React + TypeScript + Tailwind v4 · pdf-lib · qrcode · Web Crypto · Cloudflare Pages + Workers AI.

---

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typechecks then builds to dist/
```

## Deploy to Cloudflare Pages (free)

### Option A — Git integration
1. Push this folder to a GitHub repo.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build command: `npm run build` · Output directory: `dist`.
4. Add the environment variables from the next section → Deploy.

### Option B — Direct upload (no git needed)
```bash
npx wrangler pages deploy dist --project-name omnitools
```

## Turn on the AI tools (2 minutes, free tier)

The AI tools call `POST /api/ai`, handled by `functions/api/ai.js` (a Cloudflare Pages Function).
Set these env vars in **Pages project → Settings → Environment variables**:

| Variable | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID (dashboard right sidebar) |
| `CLOUDFLARE_AI_TOKEN` | API token with **Workers AI Run** permission |
| `CLOUDFLARE_AI_MODEL` | Optional, defaults to `@cf/meta/llama-3.1-8b-instruct` |

Workers AI's free allocation covers thousands of generations/day — no cost until you outgrow it.

## Switch on monetization

All switches live in **`src/lib/config.ts`**:

1. **Ads** — set `adsenseClient: 'ca-pub-XXXX'`. `<AdSlot/>` components across every page activate automatically.
   Add the AdSense script tag to `index.html` once approved.
2. **Premium plans** ($6/month) — create two Stripe Payment Links (free) and paste them into
   `stripeLinks.pro` / `stripeLinks.business`. Checkout buttons go live instantly.
3. **Newsletter** — point `newsletterEndpoint` at Formspree/FormSubmit.
4. **Affiliates** — edit the `affiliates` array shown in the footer.

## SEO checklist after deploy

- Replace `omnitools.pages.dev` with your real domain in: `public/sitemap.xml`, `public/robots.txt`,
  and `SITE.url` in `src/lib/config.ts`, then redeploy.
- Submit `sitemap.xml` in Google Search Console.
- Each tool has a unique title/description (`src/pages/ToolPage.tsx`) and `/guides/` provides content depth for AdSense approval.
- Drop a 1200×630 `og.png` into `public/` and reference it in `index.html` for social previews.

## What's inside

- **27 private browser tools** — merge/split/images→PDF, compressor/resizer/converter/base64/favicons,
  word counter/case converter/diff/lorem/slug, colors/palettes/gradients, JSON/hash/UUID/password/QR,
  percentage/loan/BMI/age/unit calculators.
- **4 AI tools** — summarizer, paraphraser, blog-title generator, product-description writer,
  each behind a 1/day free limit that upsells Pro (200/day; both configurable in config.ts).
- Dark mode, PWA manifest (installable), search, lazy-loaded routes, ad slots, premium pricing page,
  guides content, privacy/terms pages, 404.

## Growth ideas (next milestones)

- Add more calculators (high-CPC niches: mortgage refi, salary tax, compound interest).
- Programmatic landing pages ("compress png to 100kb") targeting long-tail keywords.
- Plausible/GA analytics snippet once you create an account.
- Browser-extension wrapper reusing the same tool components.
