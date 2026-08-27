# Integration guide

This guide explains how to move the current pages into another Figwork website or give the project to a new developer without losing behavior, styling, SEO, or program wording.

## Recommended handoff path

Use the React source as the canonical version:

| Page concern | Canonical source |
| --- | --- |
| Program markup and copy | `app/page.tsx` |
| Program styling | `app/globals.css` |
| Program metadata | `app/layout.tsx` |
| SEO alias | `app/student-ambassador-program/page.tsx` |
| Terms markup and copy | `app/terms/page.tsx` |
| Terms styling | `app/terms/terms.css` |
| Terms metadata | `app/terms/layout.tsx` |
| Logo, favicon, social image, PDFs | `public/` |

Copy the component and its stylesheet together. The class names are part of the layout contract; porting only the markup or only the CSS will break alignment and responsive behavior.

## Three ways to use this repository

### 1. Keep the project as its own site

This is the lowest-risk option. Clone the repository, install dependencies, edit the existing source, run the checks, and deploy it through the existing Sites project or the team's preferred compatible host.

### 2. Integrate the React pages into the main Figwork application

1. Create the destination routes for `/student-ambassador-program` and `/student-ambassador-program/terms`.
2. Copy `app/page.tsx` and `app/terms/page.tsx` into those routes.
3. Copy both stylesheets and preserve their class names until visual parity is confirmed.
4. Copy the public assets, preserving filenames or updating every reference.
5. Port the title, description, canonical URL, Open Graph, and X metadata from both layout files.
6. Keep the Tally form external until Figwork replaces application intake.
7. Keep the referral tracker static until authenticated referral APIs exist.
8. Verify the desktop and mobile layouts, the form embed, all internal links, and the terms accordions.

The source currently imports `useSearchParams` from `next/navigation`, but it is built with vinext. If the destination is not Next-compatible, replace the PDF query check with the destination router or with `new URLSearchParams(window.location.search)` inside a client effect.

### 3. Use standalone HTML

The files under `static-html/` contain the rendered markup, inlined CSS, and embedded logo. They do not require React, a build tool, or this repository. They are useful for review, archival, rapid prototypes, and copying visible markup into another CMS.

The HTML exports intentionally omit the React runtime. Native links, the Tally iframe, and `<details>` accordions continue to work, while pointer-follow and reveal effects do not. For a full-fidelity production integration, use the React source.

## Regenerate the standalone HTML

After changing the website source:

1. Start the site locally in one terminal:

   ```bash
   npm run build
   npm run start
   ```

2. In another terminal, run:

   ```bash
   npm run export:html
   ```

The exporter reads `http://127.0.0.1:3000` and writes both files to `handoff/static-html/`. Override the source or public host only when needed:

```bash
BASE_URL=http://127.0.0.1:4173 \
PUBLIC_ORIGIN=https://figwork.ai \
npm run export:html
```

Commit the regenerated HTML with the source change so reviewers can open the exact current version directly from the repository.

## Application behavior

- Form ID: `PdZv5x`
- Public form: `https://tally.so/r/PdZv5x`
- Embedded form: `https://tally.so/embed/PdZv5x?...`
- Application section anchor: `#application`
- Every Apply button uses `href="#application"` and scrolls to the embedded form on the same page.

If the Tally form changes, update the single `TALLY_FORM_URL` constant near the top of `app/page.tsx`, then update the snippets, tests, README, PDFs, static HTML exports, and relevant program automation documents.

## SEO behavior

The intended Figwork-owned canonical URLs are:

- `https://figwork.ai/student-ambassador-program`
- `https://figwork.ai/student-ambassador-program/terms`

The current Sites hostname is the published handoff site. Preserve one H1 per route and the existing semantic heading structure. Do not replace headings with visual-only text solely for styling.

## Program and legal consistency

Before publishing changed program language, compare:

- Marketing page content
- Terms and conditions
- Tally form copy
- Current rates and annual cap
- Infrastructure and email documentation
- Public FAQs and support responses

Changes involving eligibility, visa language, payment amounts, tax reporting, disclosures, fraud, or employment status require the appropriate Figwork legal, tax, and finance approval.

## Final verification checklist

- [ ] `/` and `/student-ambassador-program` show the same program.
- [ ] `/terms` opens and every accordion expands and collapses correctly.
- [ ] Every Apply button scrolls to `#application`.
- [ ] The embedded form uses `PdZv5x` and is large enough to complete.
- [ ] Terms links return to the program route correctly.
- [ ] The logo, favicon, and social image load.
- [ ] Metadata uses the intended canonical URLs.
- [ ] Rates, cap, titles, eligibility, and support email agree everywhere.
- [ ] Desktop and mobile layouts are visually checked.
- [ ] `npm test` and `npm run lint` pass.
- [ ] Static HTML and PDFs are regenerated after visible changes.
