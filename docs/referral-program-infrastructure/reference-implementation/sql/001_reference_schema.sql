-- Optional PostgreSQL starter. Adapt names, user references, encryption, and
-- migration conventions to Figwork's existing database before production.

begin;

create table referral_program_config (
  version text primary key,
  terms_version text not null,
  open_rate_cents integer not null check (open_rate_cents > 0),
  campus_rate_cents integer not null check (campus_rate_cents > 0),
  annual_cap_cents integer not null check (annual_cap_cents > 0),
  activation_window_days integer not null check (activation_window_days > 0),
  verification_hold_days integer not null check (verification_hold_days >= 0),
  effective_at timestamptz not null,
  retired_at timestamptz,
  created_at timestamptz not null default now()
);

create table referral_participant (
  user_id uuid primary key,
  eligibility_status text not null check (eligibility_status in ('eligible', 'blocked', 'review')),
  eligibility_reason text,
  tax_profile_status text not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campus_membership (
  id uuid primary key,
  user_id uuid not null references referral_participant(user_id),
  status text not null check (status in ('active', 'ended', 'removed')),
  effective_at timestamptz not null,
  ended_at timestamptz,
  selected_by uuid not null,
  decision_reason text,
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= effective_at)
);
create index campus_membership_lookup_idx on campus_membership(user_id, effective_at, ended_at);

create table referral_code (
  id uuid primary key,
  participant_user_id uuid not null unique references referral_participant(user_id),
  code_hash text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create table referral_click (
  id uuid primary key,
  referral_code_id uuid not null references referral_code(id),
  referrer_user_id uuid not null references referral_participant(user_id),
  request_id text unique,
  visitor_token_hash text not null,
  clicked_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (expires_at > clicked_at)
);
create index referral_click_expiry_idx on referral_click(expires_at);

create table referral (
  id uuid primary key,
  click_id uuid not null unique references referral_click(id),
  referrer_user_id uuid not null references referral_participant(user_id),
  referred_user_id uuid not null unique,
  campus_membership_id uuid references campus_membership(id),
  track text not null check (track in ('open_referral', 'campus_selected')),
  rate_cents integer not null check (rate_cents > 0),
  annual_cap_cents integer not null check (annual_cap_cents > 0),
  config_version text not null references referral_program_config(version),
  terms_version text not null,
  attributed_at timestamptz not null,
  activation_deadline_at timestamptz not null,
  status text not null check (status in ('started', 'in_review', 'verified', 'expired', 'rejected', 'cap_reached', 'paid')),
  final_reason_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (referrer_user_id <> referred_user_id),
  check ((track = 'campus_selected' and campus_membership_id is not null) or track = 'open_referral')
);
create index referral_tracker_idx on referral(referrer_user_id, status, created_at desc);

create table product_event (
  event_id text primary key,
  event_type text not null check (event_type in ('account.created', 'extension.installed', 'resume.uploaded')),
  referred_user_id uuid not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create table referral_fact (
  referral_id uuid not null references referral(id),
  fact_type text not null,
  source_event_id text not null references product_event(event_id),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (referral_id, fact_type),
  unique (source_event_id)
);

create table risk_case (
  id uuid primary key,
  referral_id uuid not null references referral(id),
  status text not null check (status in ('open', 'in_review', 'approved', 'rejected', 'closed')),
  reason_codes text[] not null,
  evidence_encrypted bytea,
  decided_by uuid,
  decision_reason text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index risk_review_queue_idx on risk_case(status, created_at);

create table reward (
  id uuid primary key,
  referral_id uuid not null unique references referral(id),
  participant_user_id uuid not null references referral_participant(user_id),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency = 'usd'),
  tax_year integer not null,
  status text not null check (status in ('pending_hold', 'ready_for_payout', 'paid', 'payout_failed', 'reversed')),
  verified_at timestamptz not null,
  hold_ends_at timestamptz not null,
  config_version text not null references referral_program_config(version),
  terms_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reward_cap_lookup_idx on reward(participant_user_id, tax_year, status);

create table payout_account (
  participant_user_id uuid primary key references referral_participant(user_id),
  provider text not null,
  provider_account_id text not null unique,
  payouts_enabled boolean not null default false,
  onboarding_status text not null,
  tax_status text not null default 'unknown',
  updated_at timestamptz not null default now()
);

create table payout (
  id uuid primary key,
  participant_user_id uuid not null references referral_participant(user_id),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency = 'usd'),
  status text not null check (status in ('draft', 'approved', 'submitted', 'paid', 'failed', 'reversed')),
  idempotency_key text not null unique,
  provider_transfer_id text unique,
  approved_by uuid,
  approved_at timestamptz,
  submitted_at timestamptz,
  paid_at timestamptz,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payout_item (
  payout_id uuid not null references payout(id),
  reward_id uuid not null unique references reward(id),
  amount_cents integer not null check (amount_cents > 0),
  primary key (payout_id, reward_id)
);

create table ledger_entry (
  id uuid primary key,
  participant_user_id uuid not null references referral_participant(user_id),
  reward_id uuid references reward(id),
  payout_id uuid references payout(id),
  entry_type text not null check (entry_type in ('reward_pending', 'reward_available', 'payout', 'reversal', 'adjustment')),
  amount_cents integer not null check (amount_cents <> 0),
  currency text not null default 'usd' check (currency = 'usd'),
  tax_year integer not null,
  reason_code text,
  reverses_entry_id uuid references ledger_entry(id),
  created_by uuid,
  created_at timestamptz not null default now()
);
create index ledger_audit_idx on ledger_entry(participant_user_id, tax_year, created_at);

create table outbox_event (
  id uuid primary key,
  message_key text not null unique,
  event_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now()
);
create index outbox_ready_idx on outbox_event(available_at) where processed_at is null;

create table audit_log (
  id uuid primary key,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  reason text,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

commit;
