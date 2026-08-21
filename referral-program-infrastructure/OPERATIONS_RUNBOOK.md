# Referral Program Operations Runbook

## Ownership

Assign named owners before launch:

| Area | Primary owner | Backup |
| --- | --- | --- |
| Program policy and campus selection | Program Operations | Business Development lead |
| Referral support | Customer Support | Program Operations |
| Fraud review and appeals | Trust and Safety | Designated trained reviewer |
| Payout batches and reconciliation | Finance | Finance backup |
| Tax configuration and filings | Finance + tax counsel | Controller |
| Service health and incidents | Engineering on-call | Backend lead |
| Privacy requests and retention | Privacy/Legal | Security lead |

Do not launch with an owner column blank.

## Daily checklist

1. Check ingestion lag, queue retries, and dead-letter queues.
2. Review referrals waiting beyond the normal state SLA.
3. Work the manual-review queue oldest first, except urgent payout/security cases.
4. Review incomplete payout onboarding and failed payouts.
5. Confirm previous payout batches reconciled.
6. Check hard bounces, complaints, and support replies.
7. Review program-volume and reward-amount anomaly alerts.
8. Record completion in the operations log.

## Manual referral review

Reviewer sees:

- Participant-safe referral timeline.
- Required activation facts.
- Risk reason categories and supporting evidence allowed for that role.
- Related prior review decisions.
- Terms/rate/cap snapshot.

Reviewer actions:

- Verify and begin hold.
- Extend hold with a reason and review date.
- Reject with stable reason code.
- Escalate to Trust and Safety, Finance, Privacy, or counsel.

The same reviewer should not both create and approve a financial adjustment. Every decision requires notes sufficient for a later auditor, but notes must avoid copying unnecessary résumé or identity data.

## Appeal flow

1. Support opens an appeal tied to referral ID.
2. Preserve the original decision and evidence.
3. A different reviewer evaluates the appeal when practical.
4. If approved, append new state/ledger entries; never erase the rejection.
5. Send an approved participant-safe outcome.
6. Track appeal rate and overturned decisions for model/rule quality.

## Campus selection

1. Reconcile Tally submissions against ingested applications.
2. Confirm applicant has or can create a Figwork account.
3. Apply the documented selection rubric consistently.
4. Record selected/waitlisted/declined with reviewer and timestamp.
5. For selected applicants, set an explicit future or current `effective_at`.
6. Confirm brand-kit access and onboarding email.
7. Verify future referrals use the selected rate; existing referrals retain their snapshot.
8. Removal ends membership prospectively and records the reason.

Applicants may not be told they are selected until the system contains the membership decision and effective date.

## Event proposal handling

Before approval, confirm:

- Active selected-campus membership.
- Event purpose and audience.
- Date, vendor, exact budget, cancellation terms, and responsible Figwork approver.
- Brand and disclosure compliance.
- Accessibility and safety requirements.
- Payment method: vendor-direct is preferred.

An approval includes a maximum amount and expiration date. Out-of-pocket reimbursement requires a separate approved policy and receipt workflow; never improvise it through referral rewards.

## Payout day

1. Confirm the previous batch reconciled.
2. Review payable-total anomaly report.
3. Confirm no incident, provider degradation, or unresolved cap bug.
4. Freeze the batch.
5. Finance reviews participant count, amount, adjustments, and holds.
6. Submit with stable idempotency keys.
7. Monitor signed provider events.
8. Reconcile successful and failed outcomes.
9. Release participant emails only from confirmed state.

## Support macros

### Why is my referral still in review?

> Every activation goes through verification before a reward becomes payable. Your tracker shows the current participant-safe status. If the status does not change after the displayed review period, reply with the referral reference from your account and we will investigate.

### Why didn’t this install earn a reward?

> An install alone is not a verified activation. A new, unique referred person must complete every required activation step within the attribution window and pass verification. Your tracker shows whether the referral is still progressing or was not eligible.

### Why is my rate $5 instead of $10?

> The $10 rate applies only to referrals that start while your selected campus-program membership is active. Open-referral activity and referrals that began before selection use the rate recorded when they started.

### Where is my referral link?

> Your personal referral link is in your Figwork account. You do not need to apply to use the open referral program.

### How do I update payout information?

> Sign in to Figwork and open payout settings. The secure payment-provider flow handles payout details; please do not email bank or tax information.

## Incident severity

- **SEV-1:** Incorrect or duplicate money movement, broad data exposure, compromised payment credentials. Stop payouts, page Engineering/Finance/Security, preserve evidence, and begin the incident plan immediately.
- **SEV-2:** Reward-state corruption, widespread attribution failure, webhooks down, growing DLQ, or participant tracker broadly incorrect. Pause affected processing and notify owners.
- **SEV-3:** Individual stuck referral, email issue, or isolated provider failure. Route through normal queues with SLA.

Never delete or “repair” financial rows during an incident. Disable the worker or feature flag, preserve the state, and correct through tested append-only operations.

## Monthly controls

- Review access and remove departed operators.
- Sample manual decisions and adjustments.
- Reconcile ledger, provider, bank, and accounting records.
- Review fraud false-positive and appeal rates.
- Review email complaints and deliverability.
- Confirm program configuration matches public terms.
- Confirm tax thresholds and cohort dates are current.
- Exercise payout-webhook replay and DLQ recovery in a non-production environment.
- Review retention/deletion queues with Privacy.
