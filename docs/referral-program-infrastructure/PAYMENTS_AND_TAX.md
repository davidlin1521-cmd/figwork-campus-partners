# Payments, Ledger, Reconciliation, and Tax

This document describes the payout behavior Figwork needs. Finance, tax counsel, and the eventual provider must approve the final funds flow before production.

## Payment-provider requirements

Choose a provider that can securely onboard participants, collect payout details, report payout readiness, send payments, report failures or returns, and support the tax process approved by Finance. Reuse an existing Figwork provider if it meets those needs.

If Figwork does not already have a suitable payout system, **Stripe Connect with Stripe-hosted onboarding is the recommended first option to evaluate**. Connect supports connected-account onboarding and payouts, while hosted onboarding can collect identity and payout information outside Figwork's application. Other managed payout platforms or an existing company payment workflow may be a better fit after Finance review. The implementation must follow the selected provider’s actual model rather than assuming that an e-commerce marketplace example maps directly to referral rewards. [Stripe Connect overview](https://docs.stripe.com/connect/how-connect-works), [Stripe-hosted onboarding](https://docs.stripe.com/connect/hosted-onboarding)

Do not assume that choosing Stripe automatically makes Stripe responsible for Figwork's tax filing. Stripe's tax-form features depend on the Connect configuration and enabled capabilities, and some collection features can be limited or separately configured. Finance and tax counsel must confirm who collects W-9 information, who files, and how forms are delivered before implementation. [Stripe tax verification requirements](https://docs.stripe.com/connect/required-verification-information-taxes)

### Required provider events

At minimum, receive or regularly retrieve:

- Participant onboarding/readiness changes.
- Payout success.
- Payout failure or return.
- Account closure or deauthorization, if applicable.

If the provider sends webhooks, verify their signatures, keep test and live events separate, and store each provider event only once. If it does not use webhooks, schedule a reliable reconciliation job.

## Participant onboarding

1. Participant has a pending or payable reward.
2. Figwork creates or retrieves the participant’s provider account.
3. Figwork opens the provider’s secure onboarding flow.
4. Participant completes identity, tax, and payout-destination requirements directly with the provider.
5. Verified provider status advances local payout readiness when the required information is complete.
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

At every transition, record the change in the reward history. The implementation may use database transactions, an event system, or existing Figwork financial tooling, but it must not leave the reward and payout records disagreeing.

## Batching policy

Do not send a separate provider payout for every $5 or $10 reward. Keep rewards itemized in the ledger, then batch payable entries by participant on a predictable schedule.

Possible launch policy—the final cadence is a business decision:

- Evaluate payable balances daily.
- Create payout batches weekly.
- Include only rewards whose hold has ended and whose participant is payout-ready.
- A minimum balance is optional. Do not add one unless Finance sees a cost or operational reason.
- Freeze batch contents before approval.
- Require manual review of the first production batches; automate approval later if volume and controls justify it.
- Use `provider-payout/{batch_id}` as the provider idempotency key.

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

IRS materials state that the reporting threshold for certain Form 1099-NEC payments is $2,000 for payments made in 2026, with later years subject to inflation adjustment. The IRS also notes that backup-withholding situations can require reporting regardless of amount. [IRS information-return guidance](https://www.irs.gov/businesses/small-businesses-self-employed/am-i-required-to-file-a-form-1099-or-other-information-return), [2026 Form 1099-MISC/1099-NEC instructions](https://www.irs.gov/instructions/i1099mec)

Before launch, tax counsel must determine:

- Whether these rewards are reportable as nonemployee compensation or another category.
- Whether Figwork or the selected provider is responsible for collecting forms and filing information returns.
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

submit frozen batch to the provider with a stable idempotency key
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

- Ledger, payment provider, bank funding, and general ledger agree.
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
- Follow Figwork’s existing approval policy for manual adjustments and high-value batches. Add a second approver where Finance considers the risk material.
- Daily and per-participant payout limits.
- No direct database edits to balances or payment status.
- Immutable operator, timestamp, reason, ticket, and before/after metadata for adjustments.
- Production payment-provider access protected by MFA and least privilege.
- Test and live credentials, webhooks, and connected accounts remain strictly separated.
