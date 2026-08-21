# Implementation Plan

This is a suggested order, not a required project methodology. Combine phases when Figwork’s existing systems already provide the capability, and start with manual operations where automation would add more complexity than value.

## Phase 0 — decisions and ownership

Deliverables:

- Legal-approved eligibility, terms, disclosures, and appeal language.
- Finance/tax-approved reward classification and reporting flow.
- Finance- and provider-approved payout and funds-flow design.
- Privacy-approved attribution, fraud signals, retention, and deletion.
- Named Program Operations, Finance, Trust, Support, and Engineering owners.
- Versioned program configuration for $5/$10 rates, 14-day window, approximately 10-day hold, $2,000 cap, cohort dates, and titles.

Exit gate: every launch blocker in [README.md](./README.md) has an owner and written approval.

## Phase 1 — foundation and attribution

Build:

- Schema migration from [DATA_MODEL.sql](./DATA_MODEL.sql).
- Referral-code creation and in-account display.
- `/r/{code}` resolver, signed attribution token, consent behavior, and redirect.
- Account-creation redemption and immutable attribution.
- Product-event ingress, schema registry, raw event store, transactional outbox.
- Participant tracker read model with no financial payout yet.

Tests:

- Code cannot be enumerated or expose identity.
- Existing user and self-referral cannot create eligible attribution.
- Expired token is rejected.
- Concurrent account creation redeems once.
- Duplicate/out-of-order events produce the same final state.
- Analytics contains no prohibited PII.

## Phase 2 — activation, risk, and ledger

Build:

- Activation evaluator and state machine.
- Uniqueness and fraud-service interface.
- Manual-review queue and audit log.
- Append-only ledger.
- Transactional $2,000 cap enforcement.
- Hold workflow and reversal path.

Tests:

- Install alone never creates a reward.
- All required actions within 14 days create one reward.
- Same referred person can never reward two referrers.
- Selection boundary chooses $5 before and $10 after `effective_at`.
- Concurrent final actions cannot duplicate rewards or exceed cap.
- Reversal does not rewrite original ledger rows.

## Phase 3 — campus operations

Build:

- Tally application webhook and reconciliation export.
- Admin application queue and decisions.
- Membership effective dating.
- Brand-kit authorization.
- Event proposal and budget workflow.
- Campus application/decision emails.

Tests:

- Tally replay creates one application.
- Membership changes never rewrite existing referral snapshots.
- Open participants cannot access brand kit or event proposals.
- Selected participants can use all three approved program titles in displayed resources.

## Phase 4 — payouts and email

Build:

- Payment-provider sandbox onboarding.
- Payout readiness and signed webhook handlers.
- Weekly frozen payout batches and two-person approval.
- Reconciliation jobs and reports.
- Transactional email adapter, templates, provider updates, suppression list, and failed-job handling.
- Tax-status gates approved in Phase 0.

Tests:

- Full provider sandbox flow, including incomplete onboarding and failed payout.
- Provider timeout reuses idempotency key and cannot duplicate money movement.
- Duplicate webhook is harmless.
- Paid email sends only after confirmed success.
- Hard-bounced address is suppressed.
- Ledger, batch, provider, and reconciliation totals match.

## Phase 5 — shadow and limited rollout

1. Run activation logic in shadow mode without rewards for internal test accounts.
2. Compare decisions with human review and correct rule gaps.
3. Enable a small invited cohort with payout amount and daily-volume limits.
4. Require manual approval of every initial payout batch.
5. Monitor conversion, review age, false positives, support contacts, and reconciliation.
6. Expand gradually only after two clean payout cycles.

Rollback uses feature flags to stop new attribution, reward release, emails, or payouts independently. Never roll back by deleting data.

## Acceptance criteria

The infrastructure is production-ready only when:

- All program configuration is effective-dated and audited.
- One reward per referred person is enforced at the database level.
- Every queue and webhook consumer is idempotent.
- Every financial change is represented in the immutable ledger.
- Manual review and appeals are operational.
- Provider, ledger, bank, and accounting reconciliation has passed in sandbox and production canary.
- Email bounce/complaint handling is live.
- Security review, privacy review, threat model, and incident runbook are approved.
- Load tests cover expected peak plus 10x link clicks and 3x activation events.
- Accessibility review covers participant tracker, onboarding prompts, and admin tools.
- Support has macros, escalation paths, and participant-safe reason mappings.
- The marketing page, terms, email templates, and backend configuration agree.

## Suggested engineering work breakdown

| Workstream | Estimated sequence | Depends on |
| --- | --- | --- |
| Program configuration and schema | 1 | Phase 0 decisions |
| Referral link and attribution | 2 | Auth/account integration |
| Event ingress and outbox | 2 | Service authentication |
| Activation/risk evaluator | 3 | Product events, policy |
| Ledger and cap | 3 | Finance model |
| Tracker read model | 4 | Activation states |
| Campus admin | 4 | Application rubric |
| Payment onboarding and payouts | 5 | Provider/tax approval, ledger |
| Emails | 5 | Stable events and approved copy |
| Reconciliation/observability | 5 | Payouts and events |
| Shadow/canary rollout | 6 | All prior workstreams |

Do not estimate calendar dates until the owners and existing Figwork service boundaries are known.
