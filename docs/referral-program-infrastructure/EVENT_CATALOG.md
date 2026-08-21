# Event Catalog and State Contracts

## Envelope

Every internal and external event is normalized to this envelope before processing:

```json
{
  "event_id": "evt_01J...",
  "event_type": "resume.uploaded.v1",
  "occurred_at": "2026-08-21T18:05:00Z",
  "received_at": "2026-08-21T18:05:01Z",
  "producer": "resume-service",
  "subject_id": "usr_01J...",
  "correlation_id": "ref_01J...",
  "schema_version": 1,
  "data": {}
}
```

Rules:

- `event_id` is globally unique and immutable.
- `occurred_at` comes from the source service; `received_at` comes from ingress.
- The raw envelope is stored before business processing.
- Consumers deduplicate on `event_id` and validate `event_type` plus `schema_version`.
- PII is referenced by internal ID, not copied into the envelope.
- Breaking payload changes require a new event version.

## Canonical events

### Referral and attribution

| Event | Required data | Producer | Main consumers |
| --- | --- | --- | --- |
| `referral.link_created.v1` | `referral_code_id`, `referrer_user_id` | Referral API | Email/read model |
| `referral.link_clicked.v1` | `click_id`, `referral_code_id`, `expires_at`, approved campaign fields | Referral API | Attribution analytics |
| `referral.attributed.v1` | `referral_id`, `click_id`, `referred_user_id`, terms/rate snapshot | Account service | Activation evaluator, tracker |
| `referral.expired.v1` | `referral_id`, `reason` | Activation evaluator | Tracker, email |

### Product activation

| Event | Required data | Producer |
| --- | --- | --- |
| `account.created.v1` | `user_id`, `created_at` | Account service |
| `extension.installed.v1` | `user_id`, `installation_id`, `installed_at` | Extension service |
| `resume.uploaded.v1` | `user_id`, `resume_asset_id`, `uploaded_at`, `integrity_status` | Résumé service |
| `identity.uniqueness_evaluated.v1` | `user_id`, `result`, `risk_case_id` | Trust service |

The referral service stores only the résumé asset reference and result. It must not copy résumé contents.

### Reward and review

| Event | Required data |
| --- | --- |
| `activation.verification_started.v1` | `referral_id` |
| `activation.manual_review_requested.v1` | `referral_id`, `risk_case_id`, `reason_code` |
| `activation.verified.v1` | `referral_id`, `verified_at`, `hold_ends_at` |
| `activation.rejected.v1` | `referral_id`, `reason_code`, `appealable` |
| `reward.pending_created.v1` | `reward_id`, `referral_id`, `amount_cents`, `terms_version` |
| `reward.released.v1` | `reward_id`, `released_at` |
| `reward.reversed.v1` | `reward_id`, `adjustment_entry_id`, `reason_code` |
| `reward.cap_reached.v1` | `participant_id`, `tax_year`, `cap_cents` |

### Membership and applications

| Event | Required data |
| --- | --- |
| `campus.application_received.v1` | `application_id`, `applicant_user_id`, `submission_id` |
| `campus.application_decided.v1` | `application_id`, `decision`, `decided_by` |
| `campus.membership_started.v1` | `membership_id`, `user_id`, `effective_at`, `cohort_id` |
| `campus.membership_ended.v1` | `membership_id`, `ended_at`, `reason_code` |
| `campus.event_proposal_submitted.v1` | `proposal_id`, `membership_id` |
| `campus.event_proposal_decided.v1` | `proposal_id`, `decision`, `approved_budget_cents` |

### Payout and email

| Event | Required data |
| --- | --- |
| `payout.onboarding_required.v1` | `participant_id` |
| `payout.account_ready.v1` | `participant_id`, `provider_account_id` |
| `payout.batch_created.v1` | `batch_id`, `participant_id`, `amount_cents` |
| `payout.submitted.v1` | `payout_id`, `provider_transfer_id` |
| `payout.paid.v1` | `payout_id`, `paid_at` |
| `payout.failed.v1` | `payout_id`, `failure_code`, `action_required` |
| `email.requested.v1` | `message_key`, `template_key`, `recipient_user_id`, `template_data` |
| `email.delivered.v1` | `message_key`, `provider_message_id` |
| `email.bounced.v1` | `message_key`, `bounce_type` |

## Idempotency keys

Recommended stable keys:

```text
product event ingestion:    producer/event_id
reward creation:            reward/referral_id/terms_version
email:                      email/template_key/domain_entity_id/template_version
payout batch:               payout/participant_id/batch_id
provider payout:            provider-payout/batch_id
manual adjustment:          adjustment/approved_change_request_id
```

Do not generate a fresh key on retry. A retry must reuse the key of the same logical operation.

## Processing contract

For each queued event:

1. Begin a database transaction.
2. Insert `processed_event(event_id, consumer_name)`. If the unique constraint conflicts, acknowledge and stop.
3. Lock the affected referral/participant aggregate.
4. Validate transition and invariants.
5. Apply state changes and ledger entries.
6. Insert any follow-up events into `outbox_event` in the same transaction.
7. Commit.
8. Acknowledge the queue message.

If step 3–6 fails, roll back and retry. The chosen job system must make repeated failures visible to the team rather than silently dropping them. A dead-letter queue is one option; a failed-jobs table and alert is also sufficient for an initial implementation. The application still needs deduplication because jobs may be retried.

## Reason codes

Use stable machine-readable reason codes and separate participant-safe explanations.

```text
attribution_expired
existing_figwork_user
self_referral
duplicate_referred_person
activation_incomplete
identity_unverified
suspected_fabrication
terms_violation
annual_cap_reached
payout_details_required
payout_provider_rejected
manual_review_required
operator_adjustment
```

Never return `suspected_fabrication` or a detailed fraud signal directly to the participant. Map it to a reviewed, legally approved explanation.
