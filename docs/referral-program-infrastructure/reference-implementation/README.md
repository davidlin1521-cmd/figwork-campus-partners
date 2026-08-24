# Optional referral infrastructure starter

This folder contains an **executable reference implementation**, not pseudocode. It gives Figwork a concrete place to start while leaving the final framework, database, queue, email provider, and payment provider open.

It is standalone infrastructure code. It is not connected to the Campus Partners website and does not change or deploy the website.

## What works now

- One stable, non-sequential referral code per eligible participant.
- Idempotent click capture with a 14-day attribution window.
- Account attachment without overwriting an existing referrer.
- Frozen $5 open-referral and $10 selected-campus rates at referral start.
- Account-created, extension-installed, and resume-uploaded activation facts.
- Event idempotency so retries cannot create a second reward.
- Install-alone protection and one reward per referred user.
- Eligibility checks without storing a raw taxpayer ID.
- Fraud-review, approval, and rejection hooks with reviewer audit fields.
- Approximately 10-day verification hold.
- $2,000 calendar-year cap across both tracks.
- Payout readiness and explicit Finance approval before execution.
- Replaceable email, risk, storage, and payment adapters.
- An outbox so email retries do not change reward state.
- A PostgreSQL reference migration with uniqueness and audit constraints.
- Automated tests for the core money and attribution rules.

## Run it

Node 22 or newer is the only requirement for the in-memory demo and tests.

```bash
cd docs/referral-program-infrastructure/reference-implementation
npm test
npm run demo
```

The demo creates a selected campus participant, captures a click, attaches a referred account, records the three required product facts, advances through the hold, and executes one mock payout.

## Folder map

| Path | Purpose |
| --- | --- |
| `src/program-config.mjs` | Current rates, cap, windows, and replace-before-launch terms version |
| `src/referral-engine.mjs` | Working referral, verification, hold, payout, and outbox logic |
| `src/in-memory-store.mjs` | Runnable local store and an explicit contract for a real database adapter |
| `src/adapters.mjs` | Safe mock adapters plus optional Resend and Stripe Connect HTTP adapters |
| `src/demo.mjs` | End-to-end example |
| `test/referral-engine.test.mjs` | Executable rules and regression checks |
| `sql/001_reference_schema.sql` | PostgreSQL starting schema for a production adapter |

## How to use this in Figwork later

1. Keep `ReferralEngine` and its tests as the initial domain layer.
2. Replace `InMemoryStore` with a transaction-safe adapter against Figwork's existing relational database. The SQL file shows the expected records and unique constraints.
3. Call `captureClick` from the referral link route and keep the returned `clickId` in an approved first-party cookie or server session.
4. Call `attachAccount` once the referred person creates or signs into a Figwork account.
5. Send the three trusted product events to `recordProductEvent` from Figwork's account, extension, and resume systems. Do not accept these facts directly from an untrusted browser.
6. Run `runHoldSweep` from the existing scheduler or job system.
7. Keep payout execution behind Finance authorization. `runPayoutSweep` defaults to preview mode and requires both `execute: true` and `approvedBy` before an adapter is called.
8. Replace the console mailer with Figwork's provider adapter and process the outbox from the normal worker system.
9. Add authentication, role checks, request signatures, monitoring, encryption, and provider webhooks before production.

## What remains replaceable

This starter deliberately does not lock:

- Which Figwork service owns the module.
- Which database library or migration tool is used.
- Which queue or scheduler runs background work.
- Whether Stripe Connect is the approved payment model.
- Whether Resend is the approved email provider.
- The final Legal-approved terms version and effective date.
- The final fraud signals and manual-review thresholds.
- The provider responsible for tax onboarding and reporting.

The provider adapters are examples and are disabled unless explicitly constructed with credentials. They are not approval to send production payouts before Finance, Tax, Legal, Security, and Privacy approve the funds flow.

## Production guardrails

- Use database transactions and the included unique constraints; do not rely on process memory.
- Authenticate every participant and staff action.
- Verify product events server-to-server and verify provider webhook signatures.
- Never put raw taxpayer IDs, bank details, or resume contents in this module.
- Keep the rate, cap, attribution window, hold length, and terms version on each referral or reward record.
- Preserve ledger and audit history; correct money with explicit reversals or adjustments.
- Make all queue jobs, emails, and provider requests idempotent.
- Re-run these tests when changing any program rule.

This is starter code the next engineer can edit. It is not a mandatory architecture or an already approved production service.
