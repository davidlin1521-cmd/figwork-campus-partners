-- Figwork referral program: proposed PostgreSQL schema.
-- This is a design artifact, not a ready-to-run migration. Adapt identity types,
-- naming, extensions, RLS, partitioning, and migration conventions to Figwork's backend.

create type referral_track as enum ('open_referral', 'campus_selected');
create type referral_status as enum (
  'started',
  'account_created',
  'extension_installed',
  'resume_uploaded',
  'verification_pending',
  'manual_review',
  'hold_pending',
  'payable',
  'payout_queued',
  'paid',
  'expired',
  'rejected',
  'reversed',
  'payout_failed'
);
create type membership_status as enum ('selected', 'active', 'ended', 'removed');
create type application_status as enum ('received', 'in_review', 'waitlisted', 'selected', 'declined', 'withdrawn');
create type ledger_entry_type as enum (
  'reward_pending',
  'reward_released',
  'reward_reversal',
  'manual_adjustment',
  'payout_reserved',
  'payout_settled',
  'payout_returned'
);
create type payout_status as enum ('draft', 'approved', 'submitted', 'paid', 'failed', 'returned', 'cancelled');

create table program_configuration (
  id uuid primary key,
  version text not null unique,
  effective_at timestamptz not null,
  ends_at timestamptz,
  open_rate_cents integer not null check (open_rate_cents >= 0),
  campus_rate_cents integer not null check (campus_rate_cents >= 0),
  attribution_window_seconds integer not null check (attribution_window_seconds > 0),
  hold_seconds integer not null check (hold_seconds >= 0),
  annual_cap_cents integer not null check (annual_cap_cents >= 0),
  terms_version text not null,
  config jsonb not null default '{}'::jsonb,
  approved_by uuid not null,
  approved_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > effective_at)
);

create table referral_code (
  id uuid primary key,
  user_id uuid not null unique,
  code text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table referral_click (
  id uuid primary key,
  referral_code_id uuid not null references referral_code(id),
  clicked_at timestamptz not null,
  expires_at timestamptz not null,
  country_code text,
  request_fingerprint_hmac text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  consent_version text,
  created_at timestamptz not null default now(),
  check (expires_at > clicked_at)
);
create index referral_click_code_time_idx on referral_click(referral_code_id, clicked_at desc);

create table campus_cohort (
  id uuid primary key,
  slug text not null unique,
  display_name text not null,
  application_opens_at timestamptz,
  application_closes_at timestamptz,
  decisions_at timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table campus_application (
  id uuid primary key,
  cohort_id uuid not null references campus_cohort(id),
  applicant_user_id uuid,
  applicant_email_normalized text not null,
  provider text not null default 'tally',
  provider_submission_id text not null unique,
  status application_status not null default 'received',
  response_payload_encrypted bytea not null,
  received_at timestamptz not null,
  decided_at timestamptz,
  decided_by uuid,
  decision_reason text,
  created_at timestamptz not null default now()
);
create index campus_application_queue_idx on campus_application(cohort_id, status, received_at);

create table campus_membership (
  id uuid primary key,
  user_id uuid not null,
  cohort_id uuid not null references campus_cohort(id),
  application_id uuid references campus_application(id),
  status membership_status not null,
  selected_at timestamptz not null,
  effective_at timestamptz not null,
  ended_at timestamptz,
  decided_by uuid not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= effective_at)
);
create index campus_membership_user_effective_idx on campus_membership(user_id, effective_at, ended_at);

create table referral (
  id uuid primary key,
  referral_click_id uuid not null unique references referral_click(id),
  referral_code_id uuid not null references referral_code(id),
  referrer_user_id uuid not null,
  referred_user_id uuid not null unique,
  campus_membership_id uuid references campus_membership(id),
  track referral_track not null,
  rate_cents integer not null check (rate_cents >= 0),
  annual_cap_cents integer not null check (annual_cap_cents >= 0),
  terms_version text not null,
  config_version text not null references program_configuration(version),
  attributed_at timestamptz not null,
  activation_deadline_at timestamptz not null,
  status referral_status not null default 'started',
  hold_ends_at timestamptz,
  final_reason_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (referrer_user_id <> referred_user_id),
  check (activation_deadline_at > attributed_at),
  check ((track = 'campus_selected' and campus_membership_id is not null) or track = 'open_referral')
);
create index referral_referrer_status_idx on referral(referrer_user_id, status, created_at desc);

create table product_event (
  event_id text primary key,
  event_type text not null,
  schema_version integer not null,
  producer text not null,
  subject_id uuid,
  correlation_id uuid,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  payload jsonb not null
);
create index product_event_subject_idx on product_event(subject_id, occurred_at);

create table processed_event (
  event_id text not null references product_event(event_id),
  consumer_name text not null,
  processed_at timestamptz not null default now(),
  primary key (event_id, consumer_name)
);

create table referral_fact (
  referral_id uuid not null references referral(id),
  fact_type text not null,
  source_event_id text not null references product_event(event_id),
  occurred_at timestamptz not null,
  result text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (referral_id, fact_type, source_event_id)
);

create table risk_case (
  id uuid primary key,
  referral_id uuid not null references referral(id),
  status text not null check (status in ('open', 'in_review', 'approved', 'rejected', 'appealed', 'closed')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  reason_codes text[] not null,
  evidence_encrypted bytea,
  assigned_to uuid,
  review_by timestamptz,
  decided_at timestamptz,
  decided_by uuid,
  decision_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index risk_case_queue_idx on risk_case(status, review_by, created_at);

create table reward (
  id uuid primary key,
  referral_id uuid not null unique references referral(id),
  participant_user_id uuid not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency = 'usd'),
  tax_year integer not null,
  hold_ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index reward_participant_year_idx on reward(participant_user_id, tax_year);

create table payout_batch (
  id uuid primary key,
  participant_user_id uuid not null,
  provider_account_id text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency = 'usd'),
  status payout_status not null default 'draft',
  provider_transfer_id text unique,
  idempotency_key text not null unique,
  approved_by uuid,
  approved_at timestamptz,
  submitted_at timestamptz,
  paid_at timestamptz,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ledger_entry (
  id uuid primary key,
  participant_user_id uuid not null,
  reward_id uuid references reward(id),
  payout_batch_id uuid references payout_batch(id),
  entry_type ledger_entry_type not null,
  amount_cents integer not null check (amount_cents <> 0),
  currency text not null default 'usd' check (currency = 'usd'),
  tax_year integer not null,
  reverses_entry_id uuid references ledger_entry(id),
  reason_code text,
  approved_change_request_id uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index ledger_participant_year_idx on ledger_entry(participant_user_id, tax_year, created_at);
create unique index ledger_one_pending_per_reward_idx
  on ledger_entry(reward_id)
  where entry_type = 'reward_pending';

create table payout_batch_item (
  payout_batch_id uuid not null references payout_batch(id),
  reward_id uuid not null references reward(id),
  amount_cents integer not null check (amount_cents > 0),
  primary key (payout_batch_id, reward_id),
  unique (reward_id)
);

create table payout_account (
  participant_user_id uuid primary key,
  provider text not null default 'stripe',
  provider_account_id text not null unique,
  onboarding_status text not null,
  payouts_enabled boolean not null default false,
  requirements_due boolean not null default true,
  tax_status text not null default 'unknown',
  last_provider_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table provider_webhook_event (
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  livemode boolean,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  payload_encrypted bytea not null,
  primary key (provider, provider_event_id)
);

create table email_message (
  id uuid primary key,
  message_key text not null unique,
  recipient_user_id uuid not null,
  template_key text not null,
  template_version text not null,
  provider text not null default 'resend',
  provider_message_id text unique,
  status text not null check (status in ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'suppressed')),
  requested_at timestamptz not null,
  sent_at timestamptz,
  delivered_at timestamptz,
  updated_at timestamptz not null default now()
);

create table email_suppression (
  email_normalized text primary key,
  reason text not null,
  provider_event_id text,
  created_at timestamptz not null default now()
);

create table outbox_event (
  id uuid primary key,
  aggregate_type text not null,
  aggregate_id uuid not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  attempts integer not null default 0,
  last_error text
);
create index outbox_unpublished_idx on outbox_event(created_at) where published_at is null;

create table admin_audit_log (
  id uuid primary key,
  actor_user_id uuid not null,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  request_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_target_idx on admin_audit_log(target_type, target_id, created_at);

create table campus_event_proposal (
  id uuid primary key,
  membership_id uuid not null references campus_membership(id),
  status text not null check (status in ('submitted', 'in_review', 'approved', 'declined', 'cancelled', 'completed')),
  title text not null,
  description text not null,
  planned_at timestamptz,
  vendor_name text,
  requested_budget_cents integer check (requested_budget_cents >= 0),
  approved_budget_cents integer check (approved_budget_cents >= 0),
  approved_by uuid,
  approved_at timestamptz,
  approval_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Required implementation notes:
-- 1. Add foreign keys to the canonical users table after adapting schemas.
-- 2. Enforce one active campus membership per user/cohort with an appropriate partial index.
-- 3. Use row-level locks or a participant-year cap usage table while creating rewards.
-- 4. Restrict UPDATE/DELETE on ledger_entry in the application database role.
-- 5. Partition or archive high-volume click and raw-event tables per retention policy.
-- 6. Encrypt application, provider, risk, and tax-sensitive payloads with managed keys.
-- 7. Add RLS or service-specific database roles before exposing admin/read APIs.
