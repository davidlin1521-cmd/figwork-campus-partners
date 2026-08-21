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

test("server-renders the current Campus Partners page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  const text = visibleText(html);

  assert.match(html, /<title>Student Ambassador Program - Figwork<\/title>/i);
  assert.match(text, /Run growth for a real startup\. On your campus\./);
  assert.match(text, /How the Student Ambassador Program works/);
  assert.match(text, /Your brand ambassador campaign\. Your results\./);
  assert.match(text, /Turn your campus into your campaign\./);
  assert.match(text, /Ambassador Program FAQs/);
  assert.match(text, /Apply for fall\/winter/);
  assert.match(text, /Campus Growth Partners earn \$10 per verified activation/);
  assert.match(text, /Open referral participants earn \$5/);
  assert.ok((text.match(/Apply now/gi) ?? []).length >= 3);
  assert.match(html, /https:\/\/tally\.so\/r\/PdZv5x/);
  assert.match(html, /https:\/\/tally\.so\/embed\/PdZv5x/);
  assert.ok((html.match(/href="\/terms"/g) ?? []).length >= 3);
  assert.match(html, /href="\/downloads\/figwork-campus-growth-partners\.pdf"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|SkeletonPreview/);
});

test("SEO alias renders the same program", async () => {
  const response = await render("/student-ambassador-program");
  assert.equal(response.status, 200);

  const text = visibleText(await response.text());
  assert.match(text, /Run growth for a real startup\. On your campus\./);
  assert.match(text, /Apply for fall\/winter/);
});

test("server-renders the current terms and conditions", async () => {
  const response = await render("/terms");
  assert.equal(response.status, 200);

  const html = await response.text();
  const text = visibleText(html);

  assert.match(html, /<title>Terms and Conditions \| Figwork Student Ambassador Program<\/title>/i);
  assert.match(text, /Terms and conditions\./);
  assert.match(text, /The details, plainly\./);
  assert.match(text, /What counts as a verified activation\?/);
  assert.match(text, /capped at \$2,000 per participant per calendar year/);
  assert.match(text, /current open referral rate is \$5 per verified activation/);
  assert.match(text, /Selected Campus Growth Partners earn \$10 per verified activation/);
  assert.match(text, /Find your personal referral link in your Figwork account/);
  assert.match(text, /Figwork Campus Growth Partner, Figwork Campus Partner, or Figwork Student Ambassador/);
  assert.match(text, /businessdevelopment@figwork\.ai/);
  assert.match(html, /href="\/downloads\/figwork-terms-and-conditions\.pdf"/);
  assert.doesNotMatch(text, /COUNSEL:|qualifying product action|\[CAP\]|\[PARTNER CAP\]|\$\[RATE\]|\[CONTACT EMAIL\]/);
});
