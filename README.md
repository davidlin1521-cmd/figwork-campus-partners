# Figwork Student Ambassador Program

<p align="center">
  <img src="./public/figwork-logo-light.png" alt="Figwork" width="420" />
</p>

Production-ready source and handoff documentation for the Figwork Student Ambassador Program website, its terms and conditions, and the planned referral-program infrastructure.

> The supplied light Figwork logo is intentionally cream-colored and is designed for a dark or rust background. The exact source asset is stored at [`public/figwork-logo-light.png`](./public/figwork-logo-light.png).

## Important links

| Resource | Link |
| --- | --- |
| Published website | [figwork-campus-partners.david-lin1521.chatgpt.site](https://figwork-campus-partners.david-lin1521.chatgpt.site/) |
| Published terms and conditions | [Open terms](https://figwork-campus-partners.david-lin1521.chatgpt.site/terms) |
| Campus-program application | [Apply through Tally](https://tally.so/r/PdZv5x) |
| Program support | [businessdevelopment@figwork.ai](mailto:businessdevelopment@figwork.ai) |
| Start-here handoff package | [handoff/README.md](./handoff/README.md) |
| Standalone program HTML | [handoff/static-html/ambassador-page.html](./handoff/static-html/ambassador-page.html) |
| Standalone terms HTML | [handoff/static-html/terms-and-conditions.html](./handoff/static-html/terms-and-conditions.html) |
| Website handoff | [docs/WEBSITE_HANDOFF.md](./docs/WEBSITE_HANDOFF.md) |
| Referral infrastructure handoff | [docs/referral-program-infrastructure](./docs/referral-program-infrastructure/README.md) |
| Referral system diagrams | [Executive flow and engineering architecture](./docs/referral-program-infrastructure/SYSTEM_DIAGRAMS.md) |
| Contribution and release workflow | [CONTRIBUTING.md](./CONTRIBUTING.md) |

## What this repository contains

- The complete responsive marketing website.
- A separate, scrollable terms-and-conditions route.
- Downloadable PDFs of both pages.
- Approved Figwork logo, favicon, and social-preview assets.
- SEO metadata for the Student Ambassador Program page and terms page.
- Rendered-HTML regression tests for current copy, links, and routes.
- Standalone, self-contained HTML exports of both pages for direct viewing or copying.
- Framework-neutral Tally embed and Apply-link snippets.
- GitHub Actions checks for pull requests and the `main` branch.
- A detailed implementation handoff for attribution, verified activations, automated email, payouts, fraud review, tax operations, and program administration.

The live website is intentionally presentation-only. It does not yet implement the referral ledger, participant accounts, automated payouts, or application administration described in the infrastructure specification.

## Routes

| Route | Purpose | Source |
| --- | --- | --- |
| `/` | Main Student Ambassador Program page | [`app/page.tsx`](./app/page.tsx) |
| `/student-ambassador-program` | SEO-friendly alias of the main page | [`app/student-ambassador-program/page.tsx`](./app/student-ambassador-program/page.tsx) |
| `/terms` | Program terms and conditions | [`app/terms/page.tsx`](./app/terms/page.tsx) |

Every Apply button scrolls to the embedded [approved Tally form](https://tally.so/r/PdZv5x) in the application section at the bottom of the page. The direct Tally link remains available for sharing.

## Technology

- React 19 and TypeScript
- vinext application routing
- Vite build pipeline
- Cloudflare Workers-compatible output
- OpenAI Sites hosting metadata
- Plain CSS for the page-specific visual system

No database is connected to the live marketing site. The included D1/Drizzle files are inactive scaffolding and can be used later if the team chooses that architecture. The referral handoff does not lock a backend or database. It includes a recommended baseline and an illustrative PostgreSQL schema so a new team has a concrete starting point while remaining free to reuse Figwork's actual stack.

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
npm run export:html # regenerate the copy-ready standalone HTML files
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
├── handoff/
│   ├── README.md                         # Start here for a new developer
│   ├── INTEGRATION_GUIDE.md              # Porting and release instructions
│   ├── PROGRAM_REFERENCE.md              # Current links, names, and rates
│   ├── snippets/                         # Copy-ready Tally and Apply HTML
│   └── static-html/                      # Self-contained page exports
├── public/
│   ├── downloads/                       # Static PDFs for both pages
│   ├── figwork-logo-light.png           # Supplied official light logo
│   ├── favicon.svg                      # Browser icon
│   └── og.png                           # Social sharing image
├── tests/
│   └── rendered-html.test.mjs           # Current route/copy/link checks
├── scripts/
│   └── export-static-html.mjs            # Regenerates tracked HTML exports
├── .github/workflows/quality.yml         # Automated lint, build, and test checks
├── CONTRIBUTING.md                       # Change and release workflow
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

For a new owner, start with [the copy-ready handoff package](./handoff/README.md). It separates the canonical React source, standalone HTML, integration instructions, framework-neutral snippets, and future referral infrastructure so the marketing website cannot be confused with an implemented payout backend.

## Deployment

The current public deployment is managed by OpenAI Sites:

[https://figwork-campus-partners.david-lin1521.chatgpt.site/](https://figwork-campus-partners.david-lin1521.chatgpt.site/)

The Sites project identifier in `.openai/hosting.json` is deployment metadata, not a credential. Runtime secrets must never be committed. The site currently requires no runtime secrets.

## Program implementation handoff

Start with [`docs/referral-program-infrastructure/README.md`](./docs/referral-program-infrastructure/README.md). The package includes:

- System architecture and service boundaries
- Executive program flow and engineering architecture diagrams
- Practical default technology recommendations with replaceable alternatives
- Referral attribution and activation state machines
- Technology-neutral data requirements with an optional PostgreSQL example
- Canonical event contracts
- Automated email lifecycle and draft templates
- Provider-neutral payout, ledger, reconciliation, and tax design
- Fraud review, appeals, support, and incident operations
- Phased implementation and launch criteria

The specification clearly marks decisions that still require Legal, Tax, Finance, Privacy, Engineering, and the chosen payment provider.

## Ownership and licensing

This repository is public so the handoff team can view and clone it without an invitation. No open-source license has been granted; the project remains Figwork proprietary material unless Figwork adds a license explicitly.
