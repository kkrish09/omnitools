# OmniTools — 41 Free Developer Tools

A complete, production-built **developer toolkit** website with premium gating and monetization.
All tools run client-side in the browser (nothing touches a server), so it's **free to host at scale** and privacy-friendly.

**Stack:** Vite + React + TypeScript + Tailwind v4 · Cloudflare Pages + Workers AI.

---

## What's inside

### Free tools (33) — unlimited use
- **Code:** JSON formatter, YAML↔JSON, CSV↔JSON, XML formatter, SQL formatter, code beautifier, markdown preview, regex tester, JWT decoder, debug log formatter
- **Encode:** Base64 encoder/decoder, URL encoder/decoder, HTML encoder/decoder
- **Generate:** UUID generator, password generator, QR code generator, favicon generator, .gitignore generator, license generator, Docker Compose generator, cron expression generator, lorem ipsum generator, slug generator
- **Dev Reference:** Binary/hex/octal converter, UTF-8 inspector, Nginx config generator, ASCII/Unicode table, timestamp converter
- **Design:** Color converter, palette generator, CSS gradient maker
- **Text:** Case converter, text diff checker

### Premium tools (8) — 1 free use/day, unlimited for Pro
Tools developers normally pay $5-25/month for elsewhere:
- **ER Diagram Builder** — generate entity-relationship diagrams from SQL DDL (replaces DrawSQL/dbdiagram.io)
- **GraphQL Schema Builder** — visual schema editor with live SDL preview (replaces GraphQL Editor)
- **OpenAPI Designer** — design REST APIs visually, exports OpenAPI 3.0 spec (replaces SwaggerHub)
- **CSS Animation Builder** — create keyframe animations with live preview (replaces Keyframes.app)
- **API Documentation Generator** — generate beautiful API docs from manual input (replaces ReadMe.io)
- **TypeScript Type Generator** — generate TS interfaces from JSON input
- **Regex Visualizer** — see your regex as a visual flowchart
- **SQL Query Visualizer** — visualize EXPLAIN ANALYZE output plans

### AI tools (via Workers AI)
Summarizer, paraphraser, blog-title generator, product-description writer.
- Free: 1 generation/day
- Pro: 100 generations/day

---

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typechecks then builds to dist/
```

## Deploy to Cloudflare Pages

### Option A — Direct upload
```bash
npx wrangler pages deploy dist --project-name omnitoolsapp
```

### Option B — Git integration
1. Push to a GitHub repo.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build command: `npm run build` · Output directory: `dist`.

## Turn on AI tools

Set these env vars in **Pages project → Settings → Environment variables**:

| Variable | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `CLOUDFLARE_AI_TOKEN` | API token with Workers AI Run permission |
| `CLOUDFLARE_AI_MODEL` | Optional, defaults to `@cf/meta/llama-3.1-8b-instruct` |

## Switch on monetization

All switches live in **`src/lib/config.ts`**:

1. **Ads** — set `adsenseClient: 'ca-pub-XXXX'`. Ad slot components activate automatically.
2. **Premium** ($6/month) — create a Stripe Payment Link and paste into `stripeLinks.pro`.
3. **Newsletter** — point `newsletterEndpoint` at Formspree/FormSubmit.
4. **Affiliates** — edit the `affiliates` array in config.

## Premium tool gating

- Free users get **1 use per day** per premium tool (tracked in localStorage).
- Pro users get **unlimited** access.
- Config in `src/lib/config.ts`: `PREMIUM_DAILY_LIMIT` and `PREMIUM_TOOL_IDS`.
- The gate UI is in `src/pages/ToolPage.tsx` and the hook is `src/lib/usePremium.ts`.

## SEO checklist

- Replace domain references in `public/sitemap.xml`, `index.html`, and `SITE.url` in config.
- Submit `sitemap.xml` in Google Search Console.
- Each tool page has unique meta tags. Premium tools have `offers.price: "6"` schema.
