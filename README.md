# Figwork Campus Partners

<p align="center">
  <img src="./public/figwork-logo-light.png" alt="Figwork" width="420" />
</p>

Production-ready source and handoff documentation for the Figwork Campus Partners / Student Ambassador Program website, its terms and conditions, and the planned referral-program infrastructure.

> The supplied light Figwork logo is intentionally cream-colored and is designed for a dark or rust background. The exact source asset is stored at [`public/figwork-logo-light.png`](./public/figwork-logo-light.png).

## Important links

| Resource | Link |
| --- | --- |
| Published website | [figwork-campus-partners.david-lin1521.chatgpt.site](https://figwork-campus-partners.david-lin1521.chatgpt.site/) |
| Published terms and conditions | [Open terms](https://figwork-campus-partners.david-lin1521.chatgpt.site/terms) |
| Campus-program application | [Apply through Tally](https://tally.so/r/PdZv5x) |
| Program support | [businessdevelopment@figwork.ai](mailto:businessdevelopment@figwork.ai) |
| Website handoff | [docs/WEBSITE_HANDOFF.md](./docs/WEBSITE_HANDOFF.md) |
| Referral infrastructure handoff | [docs/referral-program-infrastructure](./docs/referral-program-infrastructure/README.md) |

## What this repository contains

- The complete responsive marketing website.
- A separate, scrollable terms-and-conditions route.
- Downloadable PDFs of both pages.
- Approved Figwork logo, favicon, and social-preview assets.
- SEO metadata for the Student Ambassador Program page and terms page.
- Rendered-HTML regression tests for current copy, links, and routes.
- A detailed implementation handoff for attribution, verified activations, automated email, payouts, fraud review, tax operations, and program administration.

The live website is intentionally presentation-only. It does not yet implement the referral ledger, participant accounts, automated payouts, or application administration described in the infrastructure specification.

## Routes

| Route | Purpose | Source |
| --- | --- | --- |
| `/` | Main Campus Partners / Student Ambassador Program page | [`app/page.tsx`](./app/page.tsx) |
| `/student-ambassador-program` | SEO-friendly alias of the main page | [`app/student-ambassador-program/page.tsx`](./app/student-ambassador-program/page.tsx) |
| `/terms` | Program terms and conditions | [`app/terms/page.tsx`](./app/terms/page.tsx) |

The application buttons open [the approved Tally form](https://tally.so/r/PdZv5x) in a separate tab. The application section also embeds the same form.

## Technology

- React 19 and TypeScript
- vinext application routing
- Vite build pipeline
- Cloudflare Workers-compatible output
- OpenAI Sites hosting metadata
- Plain CSS for the page-specific visual system

No database is connected to the live marketing site. The included D1/Drizzle files are inactive scaffolding and can be used later if the team chooses that architecture. The referral handoff does not mandate a backend or database; it includes an illustrative PostgreSQL schema only to show the records and relationships the future system needs.

## Local development

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm run build   # production build
npm test        # build plus rendered-route tests
npm run lint    # source linting
```

## Project structure

```text
.
├── app/
│   ├── page.tsx                         # Main page content and components
│   ├── globals.css                      # Main page visual system
│   ├── layout.tsx                       # Main SEO and social metadata
│   ├── student-ambassador-program/      # SEO route alias
│   └── terms/
│       ├── page.tsx                     # Full terms content
│       ├── terms.css                    # Terms-specific styles
│       └── layout.tsx                   # Terms metadata
├── docs/
│   ├── WEBSITE_HANDOFF.md               # Website maintenance guide
│   └── referral-program-infrastructure/ # Backend/program implementation spec
├── public/
│   ├── downloads/                       # Static PDFs for both pages
│   ├── figwork-logo-light.png           # Supplied official light logo
│   ├── favicon.svg                      # Browser icon
│   └── og.png                           # Social sharing image
├── tests/
│   └── rendered-html.test.mjs           # Current route/copy/link checks
├── worker/                              # Cloudflare-compatible entry point
├── build/                               # Sites packaging helper
└── .openai/hosting.json                 # Sites project metadata; no secrets
```

## Safe content updates

The main content arrays, Tally form ID, and support email are at the top of [`app/page.tsx`](./app/page.tsx). Terms content is in [`app/terms/page.tsx`](./app/terms/page.tsx). SEO titles and descriptions are in the two layout files.

When changing public program rules:

1. Update the marketing page, terms page, and relevant email/infrastructure documentation together.
2. Update the rendered-HTML tests.
3. Regenerate the downloadable PDFs so they match the website.
4. Run the build and tests.
5. Have Legal/Tax review changes to eligibility, compensation, tax, disclosure, fraud, or employment language.

See [the website handoff](./docs/WEBSITE_HANDOFF.md) for exact file locations and release checks.

## Deployment

The current public deployment is managed by OpenAI Sites:

[https://figwork-campus-partners.david-lin1521.chatgpt.site/](https://figwork-campus-partners.david-lin1521.chatgpt.site/)

The Sites project identifier in `.openai/hosting.json` is deployment metadata, not a credential. Runtime secrets must never be committed. The site currently requires no runtime secrets.

## Program implementation handoff

Start with [`docs/referral-program-infrastructure/README.md`](./docs/referral-program-infrastructure/README.md). The package includes:

- System architecture and service boundaries
- Referral attribution and activation state machines
- Technology-neutral data requirements with an optional PostgreSQL example
- Canonical event contracts
- Automated email lifecycle and draft templates
- Provider-neutral payout, ledger, reconciliation, and tax design
- Fraud review, appeals, support, and incident operations
- Phased implementation and launch criteria

The specification clearly marks decisions that still require Legal, Tax, Finance, Privacy, and Stripe approval.

## Ownership and licensing

This repository is public so the handoff team can view and clone it without an invitation. No open-source license has been granted; the project remains Figwork proprietary material unless Figwork adds a license explicitly.
