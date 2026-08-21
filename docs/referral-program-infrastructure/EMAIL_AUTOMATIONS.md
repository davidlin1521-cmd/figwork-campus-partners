# Automated Email Specification

No email provider is required by this specification. Reuse Figwork’s existing transactional email system if possible. If the team later chooses Resend, Postmark, SendGrid, or another provider, keep provider-specific code behind a small interface so it can be replaced without changing program rules.

Whatever provider is used, configure a verified Figwork sending domain and make each logical email safe to retry without sending duplicates. Store a permanent local message key; do not rely only on the provider’s temporary deduplication window.

Transactional messages must describe an existing program event; do not use the transaction stream for marketing campaigns.

## Sender identities

- Program lifecycle: `Figwork Programs <programs@figwork.ai>`
- Payouts and tax: `Figwork Payments <payments@figwork.ai>`
- Reply-to for program questions: `businessdevelopment@figwork.ai`
- Security-sensitive payout emails should direct users to log into Figwork; never include bank or tax data.

Final aliases must be provisioned and monitored before launch. If only the support address exists, send from a verified no-reply address and use `businessdevelopment@figwork.ai` as reply-to.

## Trigger matrix

The first launch does not need every message below. Start with application confirmation/decision, referral outcome, payout setup, and payout outcome. Add progress reminders only when participant support data shows they are needed.

| Template key | Trigger | Recipient | Send timing | Stop/suppress condition |
| --- | --- | --- | --- | --- |
| `referral_link_ready_v1` | First link created | Referrer | Immediate | Link revoked |
| `referral_started_v1` | New person attributed | Referrer | Within 15 minutes | Referral rejected as self/duplicate before send |
| `activation_progress_v1` | Installed or résumé uploaded | Referrer | At most one digest per 24 hours | Paid/rejected/expired |
| `activation_verified_v1` | Verification passes | Referrer | Immediate | None |
| `activation_not_eligible_v1` | Final rejection/expiry | Referrer | Immediate after review | Pending appeal |
| `payout_onboarding_required_v1` | First payable/pending reward and no ready payout account | Referrer | Immediate; reminders day 3 and 10 | Account ready or participant removed |
| `payout_scheduled_v1` | Batch approved | Referrer | Immediate | Batch cancelled before send |
| `payout_paid_v1` | Verified provider success | Referrer | Immediate | None |
| `payout_failed_v1` | Provider failure | Referrer | Immediate | Failure auto-resolved before send |
| `annual_cap_reached_v1` | Eligible reward blocked by cap | Referrer | Once per tax year | None |
| `campus_application_received_v1` | Tally submission ingested | Applicant | Immediate | Duplicate submission: send once |
| `campus_selected_v1` | Selection recorded | Applicant | At `effective_at` or decision | Decision withdrawn before effective time |
| `campus_not_selected_v1` | Decline recorded | Applicant | After final review | Decision changed before send |
| `campus_membership_ended_v1` | Membership ends | Participant | Immediate | None |
| `event_proposal_received_v1` | Proposal submitted | Participant | Immediate | Duplicate submission |
| `event_proposal_decided_v1` | Decision recorded | Participant | Immediate | None |
| `terms_material_change_v1` | Future program terms/rate change | Active participants | Before effective date | Legally approved audience only |
| `tax_action_required_v1` | Missing/invalid tax status before payout | Referrer | Immediate; weekly reminder | Resolved or no payable balance |

## Message rules

- Never promise a reward until `activation.verified` and cap checks have passed.
- Use “pending verification” during the hold.
- State the amount from the referral snapshot, not a global current-rate variable.
- Do not disclose the referred person’s résumé, full name, email, or fraud signals. Use a masked identifier or participant-safe label approved by Privacy.
- Every reward email links to the authenticated tracker.
- Every payout email links to Figwork, not directly to an unverified URL in webhook data.
- Campus selection email clearly states the membership effective date. It must not imply employment.
- Social-post guidance must require a clear relationship disclosure when a participant posts. The FTC says disclosures should be placed with the endorsement and be easy to notice and understand. [FTC Disclosures 101](https://www.ftc.gov/system/files/documents/plain-language/1001a-influencer-guide-508_1.pdf?type=standard)
- No email encourages reviews in the Chrome Web Store or other app stores while the user participates.

## Approved draft copy blocks

These are operational drafts. Brand and legal review are required before production.

### Referral link ready

Subject: `Your Figwork referral link is ready`

Body:

> Your personal referral link is available in your Figwork account. Share it directly with people who may genuinely find Figwork useful. A reward is earned only after a new, unique person completes every required activation step and passes verification. View your link and progress in Figwork.

### Referral started

Subject: `A new Figwork referral started`

Body:

> Someone used your referral link and started the Figwork activation process. No reward has been earned yet. You can follow the participant-safe status in your tracker.

### Activation verified

Subject: `Your referral was verified`

Body variables: `reward_amount`, `hold_end_date`, `tracker_url`.

> Your referral completed the required activation steps and passed initial verification. A {{reward_amount}} reward is pending through {{hold_end_date}} while final checks are completed. We’ll notify you when it is ready for payout.

### Not eligible

Subject: `Update on a Figwork referral`

> This referral did not meet the program’s verified-activation requirements, so it will not earn a reward. View the status and support options in your Figwork account.

Do not put a detailed fraud reason in this email.

### Payout setup required

Subject: `Set up payouts for your Figwork rewards`

> You have a Figwork reward moving toward payout. Complete secure payout onboarding from your Figwork account. Figwork does not collect your bank details; the payment provider handles the secure onboarding flow.

### Payout paid

Subject: `Your Figwork reward was paid`

Body variables: `amount`, `payout_date`, `tracker_url`.

> We sent {{amount}} for your verified Figwork rewards on {{payout_date}}. Your reward history is available in your Figwork account. Rewards may be taxable income; keep this email and your account history for your records.

### Campus application received

Subject: `We received your Figwork campus application`

> Your application for the selected Figwork campus program is in review. Applying does not change your open referral rate. If selected, we’ll confirm your effective date, campus-program benefits, and the rate that applies to new referrals from that date forward.

### Campus selected

Subject: `Welcome to the Figwork campus program`

> You’ve been selected for the Figwork campus program effective {{effective_date}}. From that time, new eligible referrals begin at the selected-participant rate. Your Figwork account includes the brand kit and program resources. You may use “Figwork Campus Growth Partner,” “Figwork Campus Partner,” or “Figwork Student Ambassador” on your résumé or professional profile while permitted by the current program terms.

## Delivery implementation

1. Business transaction inserts `email.requested.v1` into the outbox.
2. Queue consumer renders an immutable template version.
3. Insert `email_message` with unique `message_key`.
4. Send with provider idempotency key equal to `message_key`.
5. Save provider message ID and request metadata, never the full secret-bearing provider response.
6. Verify delivery webhooks and deduplicate by webhook ID.
7. Mark hard bounces and complaints on the suppression table immediately.
8. Retry temporary errors and place messages that continue failing in a visible failed-jobs list for staff or engineering review.

Store template key, version, subject, recipient ID, provider ID, status, and timestamps. Retain rendered content only for the legally approved period.

## Testing

- Snapshot-test every template at desktop and mobile widths.
- Test missing optional variables and locale/time-zone formatting.
- Verify the same event cannot send the same template twice.
- Verify a template update does not change already-queued messages.
- Test hard bounce, soft bounce, complaint, provider timeout, duplicate webhook, and invalid signature.
- Run seed-list deliverability tests before every major cohort launch.
