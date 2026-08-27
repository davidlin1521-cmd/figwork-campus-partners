# Website Handoff

This document explains how the current Figwork Student Ambassador Program website is assembled, where each piece of content lives, and how to change or incorporate the code without accidentally changing program behavior.

For a new owner who wants the shortest path to the source, standalone HTML, and copy-ready snippets, begin with [`handoff/README.md`](../handoff/README.md).

## Production references

- Website: https://figwork-campus-partners.david-lin1521.chatgpt.site/
- Terms: https://figwork-campus-partners.david-lin1521.chatgpt.site/terms
- Application: https://tally.so/r/PdZv5x
- Support: businessdevelopment@figwork.ai

## Scope

The repository contains a public marketing site and terms page. It does not contain a working referral backend, account integration, referral tracker, Tally application database, or payout system.

The “Referral progress” panel is a visual preview. Its initials, stages, and progress bars are static sample presentation data and must not be mistaken for production referral records.

The future backend and operating model are specified in [`referral-program-infrastructure/`](./referral-program-infrastructure/README.md).

## Routing

### Main page

`app/page.tsx` renders both:

- `/`
- `/student-ambassador-program`, through a simple re-export in `app/student-ambassador-program/page.tsx`

The second route exists as an SEO-friendly path. Both routes intentionally share one component so they cannot drift.

### Terms

`app/terms/page.tsx` renders `/terms`. The terms page has its own stylesheet and metadata layout:

- `app/terms/terms.css`
- `app/terms/layout.tsx`

The accordion sections open normally on click. Adding `?pdf` to either page activates the static export presentation and opens content needed for the scrollable PDFs.

## Main page anatomy

`app/page.tsx` is organized in the same order as the visible page:

1. Constants for the approved Tally form and support email.
2. Content arrays for referral steps, benefits, campus ideas, FAQs, and tracker-preview rows.
3. Small visual components: `Stamp`, `Reveal`, and `Tracker`.
4. The full page component containing:
   - Hero and primary calls to action
   - How referrals work
   - Referral-progress preview
   - Student ambassador benefits
   - Campus playbook
   - FAQs and program notes
   - Application section and Tally embed
   - Footer and downloadable PDF

The site uses native anchors, buttons, `<details>` accordions, and an iframe. There is no client-side router or application state beyond reveal animations and PDF-export display mode.

## Content source map

| Content | File/location |
| --- | --- |
| Tally application form ID | `app/page.tsx` → `TALLY_FORM_URL` |
| Public Tally URL | Derived from `TALLY_FORM_URL` |
| Support email | `app/page.tsx` → `CONTACT_EMAIL`; repeated in terms footer |
| How-it-works cards | `app/page.tsx` → `steps` |
| Six benefit cards | `app/page.tsx` → `benefits` |
| Campus playbook | `app/page.tsx` → `campusMoves` |
| FAQs | `app/page.tsx` → `faq` |
| Tracker preview | `app/page.tsx` → `stages` and `referrals` |
| Program terms | `app/terms/page.tsx` |
| Main SEO metadata | `app/layout.tsx` |
| Terms SEO metadata | `app/terms/layout.tsx` |
| Main styles | `app/globals.css` |
| Terms styles | `app/terms/terms.css` |

## External integrations

### Tally

Approved form:

```text
https://tally.so/r/PdZv5x
```

`TALLY_FORM_URL` stores only `PdZv5x`. The code derives:

- Public application link: `https://tally.so/r/PdZv5x`
- Embedded application URL: `https://tally.so/embed/PdZv5x?...`

All Apply buttons use `href="#application"` and scroll to the embedded form at the bottom of the page. The public Tally URL remains available for direct sharing.

If the form changes, replace only the ID and then update tests, README links, any application automation, and the downloadable PDF.

### Email

The website uses a normal `mailto:` link for `businessdevelopment@figwork.ai`. There is no email API in this website. Automated program emails belong in the future referral infrastructure.

### Hosting

The project builds to a Cloudflare Workers-compatible output through vinext and Vite. `.openai/hosting.json` associates it with the existing OpenAI Sites project. It contains no secret.

## Assets

| Asset | Purpose |
| --- | --- |
| `public/figwork-logo-light.png` | Exact supplied Figwork light logo used in both page headers |
| `public/favicon.svg` | Browser/favicon asset |
| `public/og.png` | Social preview used by Open Graph and X metadata |
| `public/downloads/figwork-campus-growth-partners.pdf` | Scrollable static PDF of the main page |
| `public/downloads/figwork-terms-and-conditions.pdf` | Scrollable static PDF of the terms page |

The light logo is 1920 × 1080 with transparent/white space around the cream mark. CSS sizes it without modifying the original image. Preserve the original file when producing derived assets.

## Styling and motion

The main page visual system is contained in `app/globals.css`. It defines:

- Rust, cream, charcoal, slate, and accent colors
- Strong soft-wash backgrounds
- Responsive desktop/mobile grids
- Hero rings and pointer-follow interaction
- Reveal transitions
- Static how-it-works lines and tracker bars
- Buttons, cards, stamps, FAQs, form shell, and footer
- PDF-export overrides

The terms page intentionally has a simpler visual system in `app/terms/terms.css`.

When incorporating this design into another Figwork codebase, port the semantic markup and CSS together. Many class names are layout contracts; changing only one side can create alignment regressions.

## SEO

`app/layout.tsx` defines the main title, description, canonical URL, Open Graph metadata, and X card. The canonical target is the intended Figwork-owned production path:

```text
https://figwork.ai/student-ambassador-program
```

`app/terms/layout.tsx` uses:

```text
https://figwork.ai/student-ambassador-program/terms
```

The temporary Sites hostname is the current published preview/handoff site; the canonical URLs already point to the intended future Figwork domain.

The heading hierarchy is deliberate:

- One H1 per route
- H2 for major sections
- H3 for card titles, FAQ questions, program notes, and terms subsections
- “Referral progress” is styled text, not an H3

## Terms and legal content

The terms page covers:

- Difference between open referral participants and selected campus participants
- Participant eligibility
- Verified-activation requirements
- $5 open-referral and $10 selected-participant rates
- $2,000 annual program cap
- Verification hold and fraud recovery
- Taxes and 1099 information
- Social-disclosure rules
- Sharing and anti-spam rules
- Prospective program changes
- Approved program titles
- Event and brand-kit rules

The code currently displays an effective-date placeholder in the terms footer. Legal must replace it before the Figwork-owned launch. Legal/Tax must also reconfirm visa eligibility language, tax classification, reporting thresholds, disclosure language, and payment operations.

Do not treat the engineering infrastructure documents as legal approval.

## Downloadable PDFs and standalone HTML

The PDFs in `public/downloads/` are static snapshots, not generated at request time. After any visible copy or layout change:

1. Render the main page with `?pdf`.
2. Render `/terms?pdf`.
3. Regenerate both long-form PDFs.
4. Replace the files under the same stable names.
5. Verify every page is readable and links remain visible.

Keeping the names stable avoids breaking download links.

The tracked HTML files under `handoff/static-html/` are separate, self-contained exports for direct review and copying. Regenerate them from the current local build with:

```bash
npm run build
npm run start
# In a second terminal:
npm run export:html
```

The HTML exports are not a second source of truth. Edit the React source first and then regenerate them.

## Validation

Run:

```bash
npm run build
npm test
npm run lint
```

`tests/rendered-html.test.mjs` checks:

- Main and alias routes render
- Terms route renders
- Current Tally link and embed are present
- Current program rates and titles appear
- Terms/application links remain available
- Download links remain available
- Old placeholders and starter-preview code do not return

Visual changes should additionally be checked at desktop and mobile widths. This cleanup intentionally does not alter the live visual design.

## Incorporating into the main Figwork application

Recommended sequence:

1. Copy the route components and their CSS into the target application.
2. Move shared site chrome into the target design system only after visual parity is confirmed.
3. Replace static navigation with the target router’s link component if required.
4. Keep the Tally form external until application intake has a replacement.
5. Preserve canonical URLs and metadata.
6. Replace the static tracker preview only when authenticated referral APIs exist.
7. Implement backend work from the referral infrastructure handoff in phases.
8. Point buttons and account links to the new production routes only after end-to-end testing.
9. Regenerate PDFs and deploy both routes together.

The safest integration approach is visual parity first, infrastructure second, and dynamic participant data last.

## Release checklist

- [ ] Main page, SEO alias, and terms page render successfully.
- [ ] Every Apply button scrolls to the embedded form at `#application`.
- [ ] Embedded Tally form uses the same ID.
- [ ] Terms links and current PDF links work.
- [ ] Contact email is `businessdevelopment@figwork.ai` everywhere.
- [ ] Main page and terms wording agree on rates, cap, eligibility, and titles.
- [ ] Tests and build pass.
- [ ] PDFs match the current website.
- [ ] Standalone HTML exports were regenerated and contain no localhost references.
- [ ] Legal/Tax approve any changed program language.
- [ ] Social image, favicon, and logo load correctly.
- [ ] Deployment is verified before announcing the URL.
