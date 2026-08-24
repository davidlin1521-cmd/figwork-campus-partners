# Figwork Referral Program Infrastructure

## Start here

This folder explains what Figwork needs to build behind the Campus Partners website. It is written so a person who has never seen the program can understand the product, the required systems, and the next decisions.

**No technology stack has been locked by this document.** It still includes a practical recommended baseline so the next team is not starting from a blank page. Figwork should reuse its existing account, backend, database, email, payment, and hosting systems whenever they can meet the requirements below; use the recommendations when an existing system does not already answer the choice.

For an executive or project owner, this README is enough to understand the project. The other files are optional implementation references for the teams that eventually build and operate it.

Start with [SYSTEM_DIAGRAMS.md](./SYSTEM_DIAGRAMS.md) when you want to see how the participant journey, tracking, fraud review, dashboards, money, and technical components connect.

For working starter code, use the [optional standalone reference implementation](./reference-implementation/README.md). It includes executable referral logic, tests, a local end-to-end demo, provider adapters, and a PostgreSQL starting schema. It is code to edit and integrate later, not a required stack or an approved production service.

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
- Public eligibility rules: participant is 18 or older, physically in the United States, not participating on an F-1 or J-1 student visa, has a valid U.S. taxpayer identification number, and can complete a Form W-9 when required.
- Figwork employees and their immediate family cannot earn referral rewards; college athletes remain responsible for applicable school or athletic-association reporting.

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

## Recommended technical baseline

This is the default recommendation if discovery does not identify an existing Figwork tool that already solves the problem:

- **Backend:** add the referral module to Figwork's existing authenticated backend. If a separate API is unavoidable, keep it small and use the language the team already supports.
- **Database:** use Figwork's existing relational database; choose PostgreSQL if the team needs a new database.
- **Background work:** use the existing job runner. If Figwork continues on Cloudflare and has no job system, evaluate Cloudflare Queues plus scheduled Workflows or Cron.
- **Applications:** keep Tally for the first campus cohort and import or receive submissions into a simple internal queue.
- **Payments:** evaluate Stripe Connect with hosted onboarding first, while Finance and tax counsel confirm the provider model, funds flow, and reporting responsibility.
- **Email:** use Figwork's existing transactional provider. If none exists, evaluate Resend or Postmark behind a replaceable adapter.
- **Administration:** begin with a protected internal page for applications, referral review, corrections, and payout exceptions.
- **Monitoring:** use Figwork's existing logs and alerts; make failed jobs, delayed events, and payout mismatches visible.

This baseline is intentionally one application, one primary database, and a few managed services. It is not a microservice requirement. See [SYSTEM_DIAGRAMS.md](./SYSTEM_DIAGRAMS.md) for both the executive flow and engineering architecture.

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

## Public wording and legal-feedback alignment

The current website, terms, and this handoff use the same operating rules:

| Topic | Current rule carried through the project |
| --- | --- |
| Program structure | Open referral program for eligible Figwork users plus an application-only selected campus program |
| Program names | Figwork Campus Growth Partner, Figwork Campus Partner, and Figwork Student Ambassador are permitted only for selected participants |
| Current rates | $5 for open referrals; $10 for referrals that begin after selected-campus membership becomes effective |
| Verified activation | New unique person, valid attribution, account created, extension installed, and resume uploaded within 14 days; install alone never pays |
| Reward timing | Approximately 10-day verification hold before payout |
| Program cap | $2,000 per participant per calendar year across both tracks |
| Employment boundary | No employment, contractor, or agency relationship; no schedules, duties, quotas, scripts, or required posting |
| Sharing and endorsements | Personal sharing only; no automated or mass sending; material connections must be clearly disclosed when posting |
| Fraud | No self-referrals, duplicate/fabricated accounts, downstream-referrer rewards, or silent deletion of financial history |
| Support and application | `businessdevelopment@figwork.ai` and `https://tally.so/r/PdZv5x` |

This is a consistency check, not legal approval. Before a Figwork-owned launch, Legal and Tax still need to approve the final eligibility/visa language, tax classification and forms, payment flow, disclosure training, terms effective date, and any state-specific requirements. The website currently leaves the effective date as `[DATE]` so it cannot be mistaken for a completed legal sign-off.

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
| [SYSTEM_DIAGRAMS.md](./SYSTEM_DIAGRAMS.md) | Bosses, product, and engineering | Executive program flow plus engineering architecture and recommended baseline |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Project owner and engineering lead | Suggested phases and launch checklist |
| [HANDOFF_SPEC.md](./HANDOFF_SPEC.md) | Product and engineering | Detailed behavior and system boundaries; technology-neutral requirements |
| [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) | Program Operations, Support, Finance | How to review referrals, run payouts, and handle incidents |
| [EMAIL_AUTOMATIONS.md](./EMAIL_AUTOMATIONS.md) | Program and lifecycle teams | Email triggers and draft copy; most are optional after MVP |
| [PAYMENTS_AND_TAX.md](./PAYMENTS_AND_TAX.md) | Finance and engineering | Provider-neutral payout workflow, reconciliation, and tax decisions |
| [EVENT_CATALOG.md](./EVENT_CATALOG.md) | Engineering | Optional example of how product systems can exchange referral events |
| [DATA_MODEL.sql](./DATA_MODEL.sql) | Engineering | Illustrative PostgreSQL schema, not a required database choice or ready migration |
| [ACCESS_AND_HANDOFF.md](./ACCESS_AND_HANDOFF.md) | Repository owners | Ownership, access, and transfer checklist |
| [reference-implementation/](./reference-implementation/README.md) | Engineering | Optional runnable code from unique referral code through verification, hold, and payout |

## Decisions required before real payouts

- Legal approval of participant eligibility and program terms.
- Tax/Finance decision on payment classification, tax forms, and the annual reporting process.
- Choice of a payment provider and confirmation of what information it collects.
- Privacy approval for referral attribution, fraud signals, and data retention.
- A named owner for campus selection, referral appeals, payout exceptions, and event budgets.
- Final cohort dates and an effective date for the terms.

The website and this handoff describe the intended program. They do not replace Legal, Tax, Finance, Privacy, or payment-provider approval.
