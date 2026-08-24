export const PROGRAM_CONFIG = Object.freeze({
  version: "starter-2026-v1",
  termsVersion: "REPLACE_WITH_LEGAL_APPROVED_VERSION",
  currency: "usd",
  openReferralRateCents: 500,
  campusSelectedRateCents: 1_000,
  annualParticipantCapCents: 200_000,
  activationWindowDays: 14,
  verificationHoldDays: 10,
});

export const REQUIRED_FACTS = Object.freeze([
  "account.created",
  "extension.installed",
  "resume.uploaded",
]);

export function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1_000);
}

export function taxYear(date) {
  return date.getUTCFullYear();
}
