# Standalone HTML exports

These two files are self-contained snapshots of the current website:

- `ambassador-page.html`
- `terms-and-conditions.html`

Download both files into the same folder and open either one directly in a browser. The CSS and Figwork logo are embedded, so no project setup is required. The two pages use relative links to each other, the Tally form remains an external embed, and public assets use the GitHub repository instead of the OpenAI-hosted site.

These files are for review, copying, and archival. The canonical editable source is under `app/`. After editing the React source, regenerate both exports with `npm run export:html`; do not hand-edit the generated files.
