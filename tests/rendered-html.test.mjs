import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

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
  assert.match(html, /<meta name="description" content="Become a Figwork campus ambassador through our student ambassador program: run real referral campaigns, earn cash per activation, and build your resume\."/i);
  assert.match(html, /<link rel="canonical" href="https:\/\/figwork\.ai\/student-ambassador-program"/i);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  assert.match(text, /Run campus growth for a real startup\./);
  assert.doesNotMatch(text, /Run campus growth for a real startup\. On your campus\./);
  assert.match(text, /FIGWORK STUDENT AMBASSADOR PROGRAM Run campus growth/);
  assert.doesNotMatch(text, /FIGWORK CAMPUS PARTNERS Run/);
  assert.doesNotMatch(text, /FIGWORK CAMPUS PARTNERS · STUDENT AMBASSADOR PROGRAM/);
  assert.match(text, /Figwork's college student ambassador program helps students find the recruiter behind a career posting\. Be a university ambassador on your campus, run a real campaign, and track what you make happen\./);
  assert.match(text, /How the Student Ambassador Program works/);
  assert.match(text, /Get paid for every verified activation/);
  assert.doesNotMatch(text, /Cash for every verified activation/);
  assert.match(text, /Your brand ambassador campaign\. Your results\./);
  assert.match(html, /class="section-number section-number--right section-number--top"[^>]*>02<\/div>/);
  assert.match(text, /Turn your campus into your campaign\./);
  assert.match(text, /Ambassador Program FAQs/);
  assert.match(text, /Apply for fall\/winter/);
  assert.equal((html.match(/<h2\b/gi) ?? []).length, 6);
  assert.ok((html.match(/<h3\b/gi) ?? []).length >= 20);
  assert.doesNotMatch(html, /<h3[^>]*>\s*Referral progress\s*<\/h3>/i);
  assert.match(text, /Campus Growth Partners earn \$10 per verified activation/);
  assert.match(text, /Open referral participants earn \$5/);
  assert.match(text, /Figwork Campus Growth Partner, Campus Partner, or Student Ambassador on a resume/);
  assert.match(text, /Build skills in a startup growth role/);
  assert.match(text, /check the terms and conditions page/);
  assert.doesNotMatch(text, /we'll show you how/);
  assert.match(text, /It doesn't create an employment relationship\./);
  assert.doesNotMatch(text, /we're careful to keep it that way/);
  assert.doesNotMatch(text, /\b(?:job|position|hire|interview|hours|shift|salary|wage)\b/i);
  assert.ok((text.match(/Apply now/gi) ?? []).length >= 3);
  assert.ok((html.match(/href="#application"/g) ?? []).length >= 3);
  assert.doesNotMatch(html, /href="https:\/\/tally\.so\/r\/PdZv5x"/);
  assert.match(html, /https:\/\/tally\.so\/embed\/PdZv5x/);
  assert.ok((html.match(/href="\/terms"/g) ?? []).length >= 3);
  assert.match(html, /href="\/downloads\/figwork-campus-growth-partners\.pdf"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|SkeletonPreview/);
});

test("SEO alias renders the same program", async () => {
  const response = await render("/student-ambassador-program");
  assert.equal(response.status, 200);

  const text = visibleText(await response.text());
  assert.match(text, /Run campus growth for a real startup\./);
  assert.match(text, /Apply for fall\/winter/);
});

test("server-renders the current terms and conditions", async () => {
  const response = await render("/terms");
  assert.equal(response.status, 200);

  const html = await response.text();
  const text = visibleText(html);

  assert.match(html, /<title>Terms and Conditions \| Figwork Student Ambassador Program<\/title>/i);
  assert.match(html, /<link rel="canonical" href="https:\/\/figwork\.ai\/student-ambassador-program\/terms"/i);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1);
  assert.equal((html.match(/<h2\b/gi) ?? []).length, 1);
  assert.equal((html.match(/<h3\b/gi) ?? []).length, 9);
  assert.match(text, /Terms and conditions\./);
  assert.match(text, /FIGWORK STUDENT AMBASSADOR PROGRAM Terms and conditions\./);
  assert.doesNotMatch(text, /FIGWORK CAMPUS PARTNERS · STUDENT AMBASSADOR PROGRAM/);
  assert.match(text, /The rules for the Figwork referral program and selected campus partner program\./);
  assert.doesNotMatch(text, /The plain-language rules for the Figwork referral program/);
  assert.match(text, /The details, plainly\./);
  assert.match(text, /What counts as a verified activation\?/);
  assert.match(text, /capped at \$2,000 per participant per calendar year/);
  assert.match(text, /current open referral rate is \$5 per verified activation/);
  assert.match(text, /Selected Campus Growth Partners earn \$10 per verified activation/);
  assert.match(text, /Find your personal referral link in your Figwork account/);
  assert.match(text, /Figwork Campus Growth Partner, Figwork Campus Partner, or Figwork Student Ambassador/);
  assert.match(text, /businessdevelopment@figwork\.ai/);
  assert.match(html, /href="\/student-ambassador-program"[^>]*>Back to program<\/a>/);
  assert.doesNotMatch(html, /href="\/downloads\/figwork-terms-and-conditions\.pdf"/);
  assert.doesNotMatch(text, /COUNSEL:|qualifying product action|\[CAP\]|\[PARTNER CAP\]|\$\[RATE\]|\[CONTACT EMAIL\]/);
});

test("referral infrastructure matches the current public program", async () => {
  const infrastructureReadme = await readFile(
    new URL("../docs/referral-program-infrastructure/README.md", import.meta.url),
    "utf8",
  );
  const diagrams = await readFile(
    new URL("../docs/referral-program-infrastructure/SYSTEM_DIAGRAMS.md", import.meta.url),
    "utf8",
  );

  for (const required of [
    "$5",
    "$10",
    "$2,000",
    "14 days",
    "10-day",
    "https://tally.so/r/PdZv5x",
    "businessdevelopment@figwork.ai",
  ]) {
    assert.match(infrastructureReadme, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(diagrams, /## 1\. Program and user flow/);
  assert.match(diagrams, /## 2\. Engineering system architecture/);
  assert.match(diagrams, /PostgreSQL/);
  assert.match(diagrams, /Cloudflare Queues/);
  assert.match(diagrams, /Stripe Connect/);
  assert.match(diagrams, /Resend/);
  assert.doesNotMatch(`${infrastructureReadme}\n${diagrams}`, /5Baz1o|SPRING COHORT/i);
});
