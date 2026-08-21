# Figwork Referral Program Infrastructure

## Start here

This folder explains what Figwork needs to build behind the Campus Partners website. It is written so a person who has never seen the program can understand the product, the required systems, and the next decisions.

**No technology stack has been selected by this document.** References to databases, queues, Stripe, Resend, Cloudflare, or other products are examples for engineers to evaluate. Figwork should reuse its existing account, backend, database, email, payment, and hosting systems whenever they can meet the requirements below.

For an executive or project owner, this README is enough to understand the project. The other files are optional implementation references for the teams that eventually build and operate it.

## The program in 60 seconds

Figwork has one referral program with two ways to participate:

| Track | How someone joins | Current reward | Extra benefits |
| --- | --- | ---: | --- |
| Open referral program | Any eligible Figwork user uses the personal link in their Figwork account; no application | $5 per verified activation | Referral tracker and cash rewards |
| Selected campus program | A student applies and Figwork selects them | $10 per verified activation for referrals that begin after selection | Brand kit, campus-event proposals, and permission to use an approved Campus Partner / Student Ambassador title |

Open-referral participants are not selected campus participants. They do not receive the brand kit and cannot use the campus-program titles.

Application: [https://tally.so/r/PdZv5x](https://tally.so/r/PdZv5x)

Support: [businessdevelopment@figwork.ai](mailto:businessdevelopment@figwork.ai)

## What earns a reward

A new person must use the participant’s referral link and complete all required actions within 14 days:

1. Create a Figwork account.
2. Install the Figwork Chrome extension.
3. Upload a résumé.
4. Pass Figwork’s basic uniqueness and fraud checks.

An install alone does not earn a reward. A person can generate only one reward, ever. Self-referrals, duplicate accounts, fabricated accounts, and recruiting other referrers do not earn rewards.

After verification, the reward is held for approximately 10 days before payout. The current program cap is $2,000 per participant per calendar year across both tracks.

## What needs to be built

The first working version needs six connected pieces:

### 1. Personal referral links

Every eligible Figwork user receives one personal link in their account. When a new person uses the link, Figwork records which participant referred them and when the 14-day window ends.

### 2. Activation tracking

The existing Figwork product reports when the referred person creates an account, installs the extension, and uploads a résumé. The referral system combines those facts and decides when all requirements are complete.

### 3. Reward records and participant tracker

When an activation qualifies, the system creates one reward at the correct $5 or $10 rate. The participant sees a simple status such as link clicked, installed, résumé uploaded, in review, verified, or paid.

The system keeps a permanent history of rewards and adjustments so money cannot be duplicated or silently changed.

### 4. Basic review and administration

Figwork staff need a simple internal screen to:

- Review questionable or duplicate referrals.
- Approve or reject campus applications.
- Start or end selected-campus membership.
- See participant and referral history.
- Pause or correct a payout with a recorded reason.
- Review campus-event proposals.

This can begin as a small internal tool. It does not need to be an elaborate dashboard.

### 5. Payouts

Participants securely provide the information needed to receive money. Figwork groups verified rewards into payouts, sends them through the chosen payment provider, and records whether each payout succeeds or fails.

Figwork should not store bank details itself if the chosen payment provider can collect them securely.

### 6. Essential emails

The first version needs only a small set of automatic messages:

- Campus application received and decision.
- Referral verified or not eligible.
- Payout setup required.
- Payout sent or failed.
- Important terms or rate changes.

Additional progress emails can be added later if participants need them.

## Simple end-to-end flow

```text
Participant gets a personal link
        ↓
New person clicks the link
        ↓
Figwork remembers the referrer for 14 days
        ↓
New person creates an account, installs, and uploads a résumé
        ↓
Figwork checks that the person and activity are real and unique
        ↓
One $5 or $10 reward is created
        ↓
Approximately 10-day verification hold
        ↓
Reward is included in a payout
        ↓
Participant receives money and the tracker shows “paid”
```

## What is fixed versus undecided

### Current program requirements

- One personal referral link per participant.
- A 14-day activation window.
- Account creation, extension installation, résumé upload, and uniqueness verification.
- $5 open-referral rate.
- $10 selected-campus rate for referrals starting after selection.
- Approximately 10-day verification hold.
- $2,000 annual participant cap across both tracks.
- One reward per referred person.
- A participant-facing tracker.
- An application and selection process for the campus program.
- A recorded history of referrals, rewards, reviews, and payouts.

### Decisions the team can make later

- Backend language and framework.
- Database product.
- Whether background work uses a queue, scheduled jobs, or an existing workflow system.
- Payment and tax provider.
- Transactional email provider.
- Internal administration tool.
- Hosting and monitoring products.
- Exact payout schedule and whether a minimum payout balance is useful.
- How much fraud review is automated at launch.

The implementation should fit Figwork’s existing systems instead of creating a separate stack without a clear reason.

## Minimum launch protections

These are outcomes the system needs, regardless of technology:

- The same person cannot create two rewards.
- Retrying a request cannot send two emails or two payments.
- Old referrals keep the rate and terms that applied when they began.
- Every reward, adjustment, and payout has a traceable history.
- Staff changes record who made the change and why.
- Sensitive résumé, tax, and payment data are not exposed in the tracker or general analytics.
- Money is not sent until eligibility, the annual cap, the verification hold, and payout readiness are checked.

These protections can be implemented simply. They do not require a large microservice architecture.

## Suggested build order

1. Confirm the program rules, ownership, tax treatment, and payout approach.
2. Add personal referral links and attribution to the existing Figwork account experience.
3. Connect the three activation signals from the existing product.
4. Create the reward history and participant tracker.
5. Add a small internal review screen.
6. Add payment onboarding and controlled payout batches.
7. Add the essential emails.
8. Test internally without real payments.
9. Launch with a small group and manually review the first payouts.
10. Automate more only after the team sees where manual work is actually slowing things down.

## What each file is for

You do not need to read every file immediately.

| File | Audience | Purpose |
| --- | --- | --- |
| [README.md](./README.md) | Bosses and project owners | Plain-language program and build overview |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Project owner and engineering lead | Suggested phases and launch checklist |
| [HANDOFF_SPEC.md](./HANDOFF_SPEC.md) | Product and engineering | Detailed behavior and system boundaries; technology-neutral requirements |
| [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) | Program Operations, Support, Finance | How to review referrals, run payouts, and handle incidents |
| [EMAIL_AUTOMATIONS.md](./EMAIL_AUTOMATIONS.md) | Program and lifecycle teams | Email triggers and draft copy; most are optional after MVP |
| [PAYMENTS_AND_TAX.md](./PAYMENTS_AND_TAX.md) | Finance and engineering | Provider-neutral payout workflow, reconciliation, and tax decisions |
| [EVENT_CATALOG.md](./EVENT_CATALOG.md) | Engineering | Optional example of how product systems can exchange referral events |
| [DATA_MODEL.sql](./DATA_MODEL.sql) | Engineering | Illustrative PostgreSQL schema, not a required database choice or ready migration |
| [ACCESS_AND_HANDOFF.md](./ACCESS_AND_HANDOFF.md) | Repository owners | Ownership, access, and transfer checklist |

## Decisions required before real payouts

- Legal approval of participant eligibility and program terms.
- Tax/Finance decision on payment classification, tax forms, and the annual reporting process.
- Choice of a payment provider and confirmation of what information it collects.
- Privacy approval for referral attribution, fraud signals, and data retention.
- A named owner for campus selection, referral appeals, payout exceptions, and event budgets.
- Final cohort dates and an effective date for the terms.

The website and this handoff describe the intended program. They do not replace Legal, Tax, Finance, Privacy, or payment-provider approval.
