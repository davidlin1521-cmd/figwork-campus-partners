# Contributing and release workflow

This repository is a Figwork handoff project. Keep changes small, reviewable, and consistent across the public program page, terms, and implementation documentation.

## Set up

Use Node.js 22.13 or newer and npm:

```bash
npm install
npm run dev
```

The main page is at `http://localhost:3000`; terms are at `http://localhost:3000/terms`.

## Make a website change

1. Create a branch from the current `main` branch.
2. Edit the canonical source under `app/`.
3. Update terms, tests, PDFs, handoff exports, and infrastructure documents if the public rule or copy appears in more than one place.
4. Check the result at desktop and mobile widths.
5. Run the required checks.
6. Open a pull request describing visible changes and any legal, tax, finance, or privacy review required.

## Required checks

```bash
npm run build
npm test
npm run lint
```

GitHub Actions runs lint, build, and rendered-page tests on every pull request and every push to `main`.

## Regenerate copy-ready HTML

Start the production build in one terminal:

```bash
npm run build
npm run start
```

Then run this in another terminal:

```bash
npm run export:html
```

Commit both files under `handoff/static-html/` with the source change.

## Do not commit

- API keys, access tokens, passwords, or payment-provider secrets
- Participant data, applications, referral records, or tax documents
- Build folders such as `dist/` or `.next/`
- Local screenshots or scratch exports that are not part of the approved handoff

## Approval triggers

Get the relevant Figwork reviewer before merging changes to eligibility, visa language, reward rates, annual limits, tax reporting, social disclosures, fraud rules, privacy, payment operations, or employment-status language.

See [`handoff/README.md`](./handoff/README.md) for the new-owner path and [`docs/WEBSITE_HANDOFF.md`](./docs/WEBSITE_HANDOFF.md) for the full source map.
