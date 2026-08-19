import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:#x27|apos);/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

test("server-renders the Campus Partners page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  const text = visibleText(html);

  assert.match(html, /<title>Figwork Campus Partners<\/title>/i);
  assert.match(text, /Run growth for a real startup\. On your campus\./);
  assert.match(text, /How it works/);
  assert.match(text, /What Partners get/i);
  assert.match(text, /Turn your campus into your campaign\./);
  assert.match(text, /Bring Figwork to your campus\./);
  assert.ok((text.match(/Apply now/gi) ?? []).length >= 3);
  assert.match(text, /Apply for fall\/winter/);
  assert.match(
    text,
    /cash earnings require US work authorization and being 18 or older\./,
  );
  assert.match(html, /https:\/\/tally\.so\/embed\/5Baz1o/);
  assert.ok((html.match(/href="\/terms"/g) ?? []).length >= 3);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|SkeletonPreview/);
});

test("visible copy avoids the legally restricted terms", async () => {
  const response = await render();
  const text = visibleText(await response.text());

  assert.doesNotMatch(
    text,
    /\b(job|role|position|hire|offer|interview|salary|wage|hours|shift)\b|work for us/i,
  );
  assert.doesNotMatch(text, /\$\s*\d|top earners|leaderboard|only \d+ spots/i);
});

test("server-renders the draft program terms page", async () => {
  const response = await render("/terms");
  assert.equal(response.status, 200);

  const html = await response.text();
  const text = visibleText(html);

  assert.match(text, /Terms and conditions\./);
  assert.match(text, /The details, plainly\./);
  assert.match(text, /What counts as a verified activation\?/);
  assert.match(text, /DRAFT - not effective until reviewed by counsel and published\./);
  assert.match(text, /capped at \$2,000 per participant per calendar year/);
  assert.doesNotMatch(text, /COUNSEL:|qualifying product action|\[CAP\]|\[PARTNER CAP\]|\$\[RATE\]/);
  assert.match(text, /\[CONTACT EMAIL\]/);
});
