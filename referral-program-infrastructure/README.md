# Figwork Referral Program Infrastructure

This folder is the implementation handoff for the Figwork referral program and the selected-campus program. It describes the current rules, the recommended production architecture, the data and event contracts, automated communications, payouts, fraud controls, operations, testing, and rollout.

The public marketing pages remain the source for approved customer-facing copy. This package is the source for product and engineering behavior. When the two conflict, stop the launch and resolve the conflict with Program Operations and counsel; do not silently change either one.

## Current program, in one page

Figwork has two related tracks that use the same referral infrastructure.

| Track | Entry | Current reward | What the participant receives |
| --- | --- | ---: | --- |
| Open referral program | Available to any eligible Figwork user; no application | $5 per verified activation | Cash rewards and an in-account tracker |
| Selected campus program | Application and Figwork selection required | $10 per verified activation for referrals started after selection | Cash rewards, a partner brand kit, permission to propose approved campus events, and the right to use “Figwork Campus Growth Partner,” “Figwork Campus Partner,” or “Figwork Student Ambassador” on a résumé or professional profile |

Open-referral participants are not selected campus partners and cannot use a campus-program title or receive the partner brand kit.

The personal referral link is available in the participant’s Figwork account. The selected-campus application currently opens at [Tally](https://tally.so/r/PdZv5x). Program support goes to [businessdevelopment@figwork.ai](mailto:businessdevelopment@figwork.ai).

### Verified activation

A reward is created only when a new, unique referred person completes all required steps within 14 days of the attributed referral click:

1. Installs the Figwork Chrome extension.
2. Creates a Figwork account.
3. Uploads a résumé.
4. Passes Figwork’s uniqueness, authenticity, eligibility, and fraud checks.

An install by itself does not qualify. A referred person can generate at most one reward, ever. Duplicate, shared, self-referred, or fabricated accounts do not qualify. Recruiting another referrer never earns a reward.

Rewards enter an approximately 10-day verification hold before becoming payable. The current annual reward cap is $2,000 per participant across both tracks. Program rates may change prospectively with notice, but each referral must keep the rate, track, terms version, and attribution window recorded when it started.

## Documents in this package

- [HANDOFF_SPEC.md](./HANDOFF_SPEC.md) — complete system design and product behavior.
- [DATA_MODEL.sql](./DATA_MODEL.sql) — proposed PostgreSQL schema and integrity constraints.
- [EVENT_CATALOG.md](./EVENT_CATALOG.md) — canonical event names, payloads, and state transitions.
- [EMAIL_AUTOMATIONS.md](./EMAIL_AUTOMATIONS.md) — lifecycle messages, templates, delivery rules, and suppression handling.
- [PAYMENTS_AND_TAX.md](./PAYMENTS_AND_TAX.md) — reward ledger, Stripe Connect, payout batching, reconciliation, tax gates, and failure handling.
- [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) — daily operations, fraud review, support, incidents, and audit procedures.
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — phased build plan, ownership, tests, rollout, and definition of done.
- [ACCESS_AND_HANDOFF.md](./ACCESS_AND_HANDOFF.md) — repository access and handoff checklist.

## Recommended production stack

Use the existing Figwork application, authentication, account, and product-event services wherever possible. The recommended incremental stack is:

- TypeScript API and workers in the existing Figwork backend.
- PostgreSQL as the system of record.
- A transactional outbox plus a durable queue. If Figwork continues on Cloudflare, use Cloudflare Queues and Workflows. Queues are at-least-once, so every consumer must be idempotent; failed messages must go to a dead-letter queue. [Cloudflare delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/), [Cloudflare Workflows](https://developers.cloudflare.com/workflows/)
- Stripe Connect hosted or embedded onboarding for payout identity and bank details. Do not collect bank details in Figwork. [Stripe Connect overview](https://docs.stripe.com/connect/how-connect-works)
- Resend behind an email-provider adapter for transactional email, using a unique idempotency key per message. [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)
- The existing analytics platform for aggregate funnels only; do not send résumé content, tax identifiers, bank details, or raw identity data to analytics.

## Non-negotiable engineering principles

1. The reward ledger is append-only. Corrections are new adjustment entries, never destructive edits.
2. Every externally received event and every externally issued payment/email has an idempotency key.
3. Product state, reward state, and payout state are separate state machines.
4. The server determines attribution, eligibility, rate, cap, and reward status. The browser never does.
5. A referral snapshots its commercial terms when it begins.
6. Every manual decision is attributable to an operator and stored in an audit log.
7. No payment leaves the platform until identity, tax, fraud, cap, and hold checks all pass.

## Decisions required before production

These are launch blockers, not implementation details to guess:

- Legal approval of participant eligibility, including the F-1/J-1 restriction and state-specific rules.
- Tax counsel’s determination of reward classification, W-9 timing, backup withholding, and which party files information returns.
- Stripe approval of the exact Connect configuration and funds flow.
- Privacy approval for attribution cookies, résumé-derived verification signals, retention, and deletion.
- Final definition of “verified activation,” including what identity evidence is necessary and proportionate.
- Program Operations ownership of fraud appeals, payout exceptions, campus selection, event-budget approvals, and participant removal.
- Configurable dates for each seasonal cohort; dates must not be hard-coded into the referral engine.

This material is an engineering and operations specification, not legal or tax advice.
