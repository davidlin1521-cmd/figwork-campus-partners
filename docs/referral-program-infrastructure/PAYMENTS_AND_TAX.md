# Payments, Ledger, Reconciliation, and Tax

This document is a technical and operational design. Finance, tax counsel, and Stripe must approve the final funds flow before production.

## Recommended provider model

Use Stripe Connect with Stripe-hosted or embedded onboarding. This lets Stripe collect required identity and bank information while Figwork stores only connected-account IDs and readiness states. Connect supports connected-account onboarding, payout management, and tax-reporting tooling. [How Connect works](https://docs.stripe.com/connect/how-connect-works), [Connect integration guide](https://docs.stripe.com/connect/design-an-integration)

The exact connected-account configuration, controller properties, liability allocation, and transfer method must be chosen with Stripe. Do not assume that an e-commerce marketplace example maps directly to referral rewards.

### Required provider events

At minimum, listen for:

- `account.updated`
- external-account updates relevant to payouts
- transfer/payout success
- transfer/payout failure or return
- account deauthorization, if applicable

Stripe says Connect integrations should establish webhook endpoints, and a failed payout can disable the affected external account until it is updated. [Stripe Connect webhooks](https://docs.stripe.com/connect/webhooks)

Verify the Stripe signature against the raw body, check live/test mode, store each provider event ID once, and retrieve the object from Stripe when a financial decision needs confirmation.

## Participant onboarding

1. Participant has a pending or payable reward.
2. Figwork creates or retrieves the participant’s connected account.
3. Figwork creates a single-use hosted onboarding link or embedded session.
4. Participant completes identity, tax, and payout-destination requirements directly with Stripe.
5. `account.updated` advances local payout readiness only when the required payout fields/capabilities are satisfied.
6. Figwork reminds the participant about incomplete requirements without exposing the requirements in email.

Never infer readiness from the participant returning to Figwork. Use verified provider state.

## Reward lifecycle

```text
verified activation
  -> reward_pending
  -> approximately 10-day hold
  -> reward_released/payable
  -> payout_reserved
  -> provider submitted
  -> provider confirmed paid
```

At every transition, append a ledger entry and publish an outbox event in one database transaction.

## Batching policy

Do not send a separate provider payout for every $5 or $10 reward. Keep rewards itemized in the ledger, then batch payable entries by participant on a predictable schedule.

Recommended launch policy:

- Evaluate payable balances daily.
- Create payout batches weekly.
- Include only rewards whose hold has ended and whose participant is payout-ready.
- Skip a batch when the payable balance is below a Finance-approved minimum, unless the account is being closed or a maximum waiting period has elapsed.
- Freeze batch contents before approval.
- Require Finance approval for the first production batches and for any batch over a configured threshold.
- Use `stripe-transfer/{batch_id}` as the provider idempotency key.

Publish the actual cadence and any minimum/maximum wait in user-facing terms before launch.

## Annual cap

The current program-wide cap is $2,000 per participant per calendar year across both tracks.

Before creating a reward:

1. Lock the participant-year cap row.
2. Sum valid positive rewards less reversals for that cap year.
3. Reject a reward that would exceed the cap unless the approved terms explicitly permit partial rewards.
4. Store the cap decision and configuration version.
5. Notify the participant once per year when the cap is reached.

The cap is a program limit. It is separate from tax-reporting thresholds and must not be described as a way to avoid reporting.

## 2026 information-reporting note

IRS materials state that the reporting threshold for certain Form 1099-NEC payments is $2,000 for payments made in 2026, with later years subject to inflation adjustment. The IRS also notes that backup-withholding situations can require reporting regardless of amount. [IRS 2026 Publication 15](https://www.irs.gov/publications/p15), [IRS information-return guidance](https://www.irs.gov/businesses/small-businesses-self-employed/am-i-required-to-file-a-form-1099-or-other-information-return)

Before launch, tax counsel must determine:

- Whether these rewards are reportable as nonemployee compensation or another category.
- Whether Figwork or Stripe is responsible for collecting forms and filing information returns under the selected Connect model.
- When to collect W-9 information.
- How backup withholding is handled.
- How returned, reversed, or year-end pending rewards affect reporting.
- Whether state filings or lower state thresholds apply.
- The correct threshold for each payment year.

The product must treat the threshold as year-versioned configuration maintained by Finance, never a permanent hard-coded constant.

Participants remain responsible for their own taxes whether or not a form is issued, subject to counsel-approved wording.

## Payout batch algorithm

```text
for each payout-ready participant with payable entries:
  begin transaction
  lock payable ledger entries
  verify membership-independent rate snapshots
  verify no active payout/fraud/tax hold
  verify cap and ledger totals reconcile
  create payout_batch and payout_batch_items
  append payout_reserved entries
  commit

submit frozen batch to Stripe with stable idempotency key
record provider transfer ID
wait for signed provider event
append payout_settled only after confirmed success
```

If the submission times out, query by idempotency key/provider reference before retrying. Never create a new batch to “fix” an unknown result.

## Reconciliation

Run three levels:

**Per event**

- Provider amount/currency equals frozen batch.
- Provider connected account equals participant payout account.
- Provider event is live when production is live.

**Daily**

- Every submitted batch has exactly one current provider outcome.
- Sum of batch items equals batch total.
- Sum of settled ledger entries equals successful provider transfers.
- Failed/returned payments are restored to payable or review exactly once.

**Monthly/year-end**

- Ledger, Stripe, bank funding, and general ledger agree.
- Participant-year totals and tax-system totals agree.
- All manual adjustments have approval evidence.
- Unclaimed/incomplete-onboarding balances receive the approved notices and disposition.

Finance signs and stores a reconciliation report. Differences block new payout batches until understood.

## Failure handling

| Failure | System action | Participant communication |
| --- | --- | --- |
| Incomplete onboarding | Keep reward payable but blocked | Secure setup reminder |
| Provider requirement added | Pause new payouts; surface onboarding | Action-required email |
| Provider timeout | Query provider; retry with same key | No failure email until outcome known |
| Payout failed | Mark failed; restore or review ledger entries | Action-required email without bank detail |
| Payout returned | Append return entry; investigate | Support-guided notice |
| Confirmed fraud before payout | Reject/reverse; retain audit evidence | Approved eligibility explanation |
| Confirmed fraud after payout | Append reversal; apply permitted recovery | Individual review and notice |
| Annual cap reached | Do not create excess reward | One cap notice per year |

## Financial controls

- Separate Program Operations, payout approval, and reconciliation permissions.
- Two-person approval for manual positive adjustments and high-value batches.
- Daily and per-participant payout limits.
- No direct database edits to balances or payment status.
- Immutable operator, timestamp, reason, ticket, and before/after metadata for adjustments.
- Production Stripe access protected by MFA and least privilege.
- Test and live credentials, webhooks, and connected accounts remain strictly separated.
