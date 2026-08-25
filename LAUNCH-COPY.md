# OmniTools Launch Copy

Everything below is ready to copy-paste. URLs:
- Live site: https://omnitoolsapp.pages.dev
- GitHub: https://github.com/kkrish09/omnitools

---

## 1. Reddit — r/InternetIsBeautiful

**Title (max 100 chars):**
I built a site with 31 free browser tools — PDF, image, QR, AI writing, calculators. Nothing uploaded anywhere.

**Post body (optional, helps engagement):**
Every tool runs entirely in your browser. Your files never leave your device — not even a server touches them. There's also free AI (summarizer, paraphraser, etc.) powered by Cloudflare's free tier. Everything is MIT licensed on GitHub.

**First comment (post this immediately after posting):**
Some highlights:
- Merge/split PDFs and convert images to PDF
- Compress, resize and convert images (JPG, PNG, WebP)
- Word counter with keyword density
- Apple-style calculator with scientific mode + history tape
- QR code generator with custom colors
- Password generator with entropy meter
- 5 free AI writing tools (summarizer, paraphraser, title generator...)
- Color converter, palette generator, gradient maker
- Loan/EMI calculator with full amortization schedule
- Unit converter (length, mass, temp, data, speed, area, volume)

Live: https://omnitoolsapp.pages.dev
Open source: https://github.com/kkrish09/omnitools

---

## 2. Reddit — r/SideProject

**Title:**
I launched OmniTools — 31 free online tools with AI. Costs $0 to host. Here's how.

**Body:**
Hey r/SideProject! Been building this for the past few days and wanted to share.

**What it is:** 31 free tools (PDF, image, text, design, developer, calculators, AI writing) in one clean website.

**What makes it different:**
- Every tool runs in your browser — files never touch a server
- AI tools included (summarizer, paraphraser, title generator, product descriptions) using Cloudflare Workers AI free tier
- Hosted on Cloudflare Pages — literally $0/month
- MIT licensed, fully open source

**The stack:** React + TypeScript + Tailwind v4 + pdf-lib + Cloudflare Pages + Workers AI

**Monetization plan:** AdSense (placed, waiting for approval) + $6/month Pro plan via Stripe (just needs a payment link)

**What's next:** More tools, SEO content, and waiting for AdSense approval. Goal is $500/month within 6 months.

Would love feedback on the tools or the approach. Happy to answer any questions about the tech or the business model.

Live: https://omnitoolsapp.pages.dev
GitHub: https://github.com/kkrish09/omnitools

---

## 3. Reddit — r/webdev

**Title:**
I built a 31-tool website that costs $0 to run. React + Cloudflare Pages + Workers AI.

**Body:**
Quick breakdown for fellow devs:

**Architecture:**
- Vite + React 18 + TypeScript (strict) + Tailwind CSS v4
- 31 tools across 7 categories, all lazy-loaded
- Every client-side tool uses Web APIs (Canvas, Web Crypto, pdf-lib) — no backend needed
- AI tools call a Cloudflare Pages Function that proxies to Workers AI free tier
- Service worker for offline caching, PWA manifest for installability

**The interesting bits:**
- PDF operations use pdf-lib (merge, split, images-to-PDF) entirely in-browser
- Image compression/resizing via Canvas API — no server processing
- SHA hashing via Web Crypto API
- QR codes via the `qrcode` npm package
- AI rate limiting done in localStorage (client-side) with a 1/day free limit
- Error boundary per tool so one crash doesn't break the whole app
- JSON-LD structured data on every tool page for SEO

**Cost:** $0/month. Cloudflare Pages (free) + Workers AI (free tier: 10k neurons/day).

**What I learned:**
- Tailwind v4 dropped `@apply` for custom classes — had to compose utility classes differently
- Cloudflare Pages now randomizes `.pages.dev` subdomains for new projects with taken names
- Web Crypto API only works on HTTPS (and localhost)

Open to questions about the stack or architecture.

Live: https://omnitoolsapp.pages.dev
GitHub: https://github.com/kkrish09/omnitools

---

## 4. Reddit — r/opensource

**Title:**
OmniTools — 31 free browser tools (PDF, image, AI, calculators). MIT licensed, zero server uploads.

**Body:**
Everything runs in your browser. Your files never leave your device.

**Categories:**
- PDF: merge, split, images-to-PDF
- Image: compress, resize, convert, base64, favicon generator
- Text: word counter, case converter, text diff, lorem ipsum, slug generator
- Design: color converter, palette generator, CSS gradient maker
- Developer: JSON formatter, hash generator, UUID, password generator, QR code
- Calculators: Apple-style calculator with scientific mode, percentage, loan/EMI, BMI, age, unit converter
- AI: summarizer, paraphraser, blog title generator, product description writer (free tier via Cloudflare Workers AI)

**Tech:** React + TypeScript + Tailwind v4 + Vite. Deployed on Cloudflare Pages.

Contributions welcome: https://github.com/kkrish09/omnitools

Live: https://omnitoolsapp.pages.dev

---

## 5. Hacker News (Show HN)

**Title:**
Show HN: OmniTools – 31 free browser tools, zero server uploads

**URL:** https://omnitoolsapp.pages.dev

**First comment (post immediately):**
Hi HN! I built OmniTools — a collection of 31 free tools (PDF, image, text, design, developer, calculators, AI writing) that all run entirely in the browser. Your files never touch a server.

Key points:
- PDF operations (merge, split, images→PDF) use pdf-lib client-side
- Image compression/resizing via Canvas API — no server processing
- AI tools (summarizer, paraphraser, etc.) use Cloudflare Workers AI free tier via a Pages Function
- Everything is open source under MIT: https://github.com/kkrish09/omnitools
- Costs $0/month to host on Cloudflare Pages

The AI tools have a 1/day free limit (200/day on the $6/month Pro plan) — designed to stay within Cloudflare's free tier.

Would love feedback, especially on the tool selection and architecture choices.

---

## 6. Dev.to Article

**Title:** How I Built a Free Tools Website That Costs $0 to Host

**Tags:** `webdev`, `javascript`, `react`, `tutorial`

**Cover image:** (use your site's hero section screenshot)

---

I built [OmniTools](https://omnitoolsapp.pages.dev) — 31 free online tools (PDF, image, text, design, developer, calculators, and AI writing tools) that all run entirely in the browser. It costs me $0/month to run.

Here's how I built it, why it costs nothing, and what I learned.

### Why a free tools site?

Free online tools are one of the most reliable ways to build a website that earns money. Sites like TinyPNG and iLovePDF make millions from AdSense on tool traffic. The key insight: tools have **evergreen search demand** — people will always need to merge PDFs, compress images, and generate QR codes.

### The stack

- **React 18 + TypeScript + Tailwind CSS v4** — fast development, type safety, beautiful UI
- **Vite 6** — instant builds, code splitting out of the box
- **pdf-lib** — PDF operations without any server
- **Cloudflare Pages** — free hosting with global CDN
- **Cloudflare Workers AI** — free-tier AI for the writing tools

### Why it costs $0

The secret: **almost everything runs client-side**. When you compress an image or merge a PDF, it happens in your browser using Canvas API and pdf-lib. No server needed. The only server-side piece is the AI tools, which proxy through a Cloudflare Pages Function to Workers AI's free tier (10,000 neurons/day).

Cloudflare Pages is free for static sites. Workers AI has a generous free tier. Total monthly cost: $0.

### The tools

Here's what's included across 31 tools:

| Category | Tools |
|----------|-------|
| PDF | Merge, split/extract, images→PDF |
| Image | Compress, resize, convert (JPG/PNG/WebP), base64 encode, favicon generator |
| Text | Word counter (with keyword density), case converter, text diff, lorem ipsum, slug generator |
| Design | Color converter (HEX/RGB/HSL with tints/shades), palette generator (5 harmonies), CSS gradient maker |
| Developer | JSON formatter, SHA hash generator, UUID generator, password generator (with entropy), QR code maker |
| Calculators | Apple-style calculator with scientific mode, percentage, loan/EMI with amortization, BMI, age, unit converter |
| AI | Summarizer, paraphraser, blog title generator, product description writer |

### The monetization plan

1. **AdSense** — ad slots are placed across every page. Waiting for Google's approval.
2. **Pro plan** — $6/month for 200 AI generations/day, zero ads, batch processing. Stripe payment link ready to connect.

The free tier gets 1 AI generation/day — enough to try it, not enough for daily use. That's the conversion lever.

### Lessons learned

1. **Tailwind v4 broke `@apply` for custom classes.** You can't compose your own utility classes inside `@apply`. I had to expand base styles into each variant manually.

2. **Cloudflare Pages randomizes subdomains.** If someone already owns `omnitoolspages.dev`, you get `omnitoolspapp-abc.pages.dev`. You can't control this — pick a unique name or use a custom domain.

3. **Web Crypto API requires HTTPS.** Your hash generator, password generator, and UUID generator won't work over plain HTTP. Fine for production (Cloudflare serves HTTPS), but you need `localhost` or HTTPS for local development.

4. **Error boundaries save single-tool sites.** I wrap every tool in a React error boundary so if one tool crashes (rare, but possible with edge cases), the rest of the site stays functional.

### What's next

- More tools targeting high-CPC keywords (mortgage calculator, salary tax calculator)
- Long-tail SEO landing pages for each tool
- More content depth for AdSense approval

The full source code is MIT licensed: [github.com/kkrish09/omnitools](https://github.com/kkrish09/omnitools)

Live site: [omnitoolsapp.pages.dev](https://omnitoolsapp.pages.dev)

---

*If this was helpful, I'd appreciate a ⭐ on the GitHub repo!*
