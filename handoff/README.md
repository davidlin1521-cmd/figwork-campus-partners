# Figwork website handoff: start here

This folder is the copy-ready handoff for the current Figwork Student Ambassador Program website. It is designed for someone who has not worked on this project before.

## Choose the format you need

| Need | Use this |
| --- | --- |
| Open the current pages without installing the project | [`static-html/ambassador-page.html`](./static-html/ambassador-page.html) and [`static-html/terms-and-conditions.html`](./static-html/terms-and-conditions.html) |
| Continue developing the full website | [`../app/page.tsx`](../app/page.tsx), [`../app/globals.css`](../app/globals.css), and [`../app/terms/`](../app/terms/) |
| Move the pages into Figwork's main codebase | [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) |
| Redeploy if the current OpenAI site is unavailable | [`../DEPLOYMENT.md`](../DEPLOYMENT.md) |
| Copy the application form or Apply link | [`snippets/`](./snippets/) |
| Check approved URLs, contacts, rates, and naming | [`PROGRAM_REFERENCE.md`](./PROGRAM_REFERENCE.md) |
| Understand future referral tracking and payouts | [`../docs/referral-program-infrastructure/`](../docs/referral-program-infrastructure/README.md) |

## What is production-ready now

- Responsive Student Ambassador Program marketing page
- Terms and conditions page with accessible native accordions
- Approved Figwork logo, favicon, and social-preview image
- Student Ambassador Program SEO metadata and canonical URLs
- Embedded Tally application form
- Apply buttons that scroll to the embedded form
- Current program copy, rates, titles, contact information, and terms
- Build and rendered-page regression tests

## What is not connected yet

The referral tracker shown on the page is a visual preview. This repository does not connect to live accounts, referrals, email automations, fraud review, or payouts. Those future systems are specified separately under [`docs/referral-program-infrastructure`](../docs/referral-program-infrastructure/README.md), including an optional reference implementation.

The website does not depend on the current OpenAI account. The self-contained HTML can be hosted anywhere, and the repository includes a Dockerfile for the full application.

## Required owner decisions before the Figwork-domain launch

- Replace the `[DATE]` effective-date placeholder in `app/terms/page.tsx` after approval.
- Have Legal/Tax reconfirm the published eligibility, visa, tax-reporting, disclosure, and program-status language.
- Confirm the final Figwork-domain routes and deploy the canonical URLs already used in metadata.
- Connect the tracker and payouts only after the separate referral infrastructure is implemented and reviewed.

## Fastest way to view the site locally

Install Node.js 22.13 or newer, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the program and `http://localhost:3000/terms` for the terms.

## Before handing a changed version back

```bash
npm run build
npm test
npm run lint
```

If public copy changes, keep the marketing page, terms, tests, PDFs, handoff exports, and referral-infrastructure documentation consistent. Legal/Tax review is required for changes to eligibility, compensation, taxes, disclosures, fraud, or employment language.
