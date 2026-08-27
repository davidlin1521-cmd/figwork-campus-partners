# Redeploying without the current OpenAI account

The GitHub repository is the permanent handoff. The current `chatgpt.site` address is only one hosting location. If that OpenAI Sites project is disabled, the source, standalone HTML, logo, PDFs, terms, and documentation remain in GitHub and can be redeployed by the new owner.

## Fastest recovery: static HTML

No Node.js or build step is required.

1. Download both files:
   - [`handoff/static-html/ambassador-page.html`](./handoff/static-html/ambassador-page.html)
   - [`handoff/static-html/terms-and-conditions.html`](./handoff/static-html/terms-and-conditions.html)
2. Upload the two files together to any static website host.
3. Set `ambassador-page.html` as the site's home page, or rename it to `index.html`.

The two pages link to each other with relative paths. Their CSS and Figwork logo are embedded. The application remains connected to Tally, while the PDFs, favicon, and social image use the public GitHub repository instead of the OpenAI-hosted site.

This option is ideal for an immediate backup or review site. It intentionally excludes the React-only pointer and reveal effects.

## Full website: Docker

The included [`Dockerfile`](./Dockerfile) gives the team a host-neutral build. Any platform that accepts a Dockerfile can build this repository without OpenAI Sites.

```bash
docker build -t figwork-student-ambassador .
docker run --rm -p 3000:3000 figwork-student-ambassador
```

Open `http://localhost:3000`. The container requires no database, API key, environment file, or secret because the current website is presentation-only and the application form is hosted by Tally.

For a managed host, connect this GitHub repository, select Dockerfile deployment, expose port `3000`, and deploy the `main` branch.

## Full website: Node.js without Docker

Any server with Node.js 22.13 or newer can run:

```bash
npm ci
npm run build
npm run start
```

The application listens on port `3000` by default. Place the host's normal HTTPS/domain proxy in front of it.

## After moving to a new domain

1. Update the canonical and social metadata in `app/layout.tsx` and `app/terms/layout.tsx` if the final Figwork URLs differ.
2. Set `PUBLIC_ORIGIN` while regenerating the standalone HTML only if a fallback link should use the new host:

   ```bash
   PUBLIC_ORIGIN=https://new-host.example npm run export:html
   ```

3. Confirm the Tally form ID remains `PdZv5x`.
4. Test `/`, `/student-ambassador-program`, `/terms`, all Apply buttons, the embedded form, the logo, and mobile layout.
5. Keep the current OpenAI Sites project only as an optional preview; it is not required by the code.

## Files the new owner should preserve

| Purpose | Location |
| --- | --- |
| Editable website | `app/` |
| Standalone HTML backup | `handoff/static-html/` |
| Official logo and social assets | `public/` |
| Terms | `app/terms/` |
| Application snippets | `handoff/snippets/` |
| Build dependencies | `package.json` and `package-lock.json` |
| Host-neutral container | `Dockerfile` |
| Future referral backend plan | `docs/referral-program-infrastructure/` |

The website and terms can therefore be restored from GitHub even if the original OpenAI account and Sites project are unavailable.
