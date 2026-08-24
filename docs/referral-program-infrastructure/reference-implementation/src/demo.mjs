import { ConsoleMailer, MockPaymentProvider } from "./adapters.mjs";
import { InMemoryStore } from "./in-memory-store.mjs";
import { ReferralEngine } from "./referral-engine.mjs";

let currentTime = new Date("2026-09-01T12:00:00.000Z");
const store = new InMemoryStore();
const mailer = new ConsoleMailer();
const payments = new MockPaymentProvider();
const engine = new ReferralEngine({ store, mailer, payments, now: () => currentTime });

engine.registerParticipant({
  userId: "participant_123",
  email: "participant@example.com",
  eligibility: {
    age18OrOlder: true,
    physicallyInUnitedStates: true,
    visaCategory: "none",
    usTaxEligibilityConfirmed: true,
    figworkEmployee: false,
    immediateFamilyOfEmployee: false,
  },
});
engine.addCampusMembership({
  userId: "participant_123",
  effectiveAt: new Date("2026-08-25T00:00:00.000Z"),
  selectedBy: "program_ops_1",
});
const code = engine.getOrCreateReferralCode("participant_123");
const click = engine.captureClick({
  code: code.code,
  visitorId: "visitor_cookie_abc",
  requestId: "landing_request_1",
});
const referral = engine.attachAccount({ clickId: click.id, referredUserId: "new_user_456" });
engine.recordProductEvent({
  eventId: "extension_event_1",
  type: "extension.installed",
  userId: "new_user_456",
});
engine.recordProductEvent({
  eventId: "resume_event_1",
  type: "resume.uploaded",
  userId: "new_user_456",
});
await engine.processOutbox();

currentTime = new Date("2026-09-12T12:00:00.000Z");
engine.runHoldSweep();
engine.setPayoutAccount({
  participantUserId: "participant_123",
  connectedAccountId: "acct_reference_only",
  payoutsEnabled: true,
});
const preview = await engine.runPayoutSweep();
const paid = await engine.runPayoutSweep({ approvedBy: "finance_approver_1", execute: true });
await engine.processOutbox();

console.log(JSON.stringify({
  referral: {
    id: referral.id,
    track: referral.track,
    rateCents: referral.rateCents,
    status: referral.status,
  },
  payoutPreview: preview,
  payoutResult: paid,
  sentEmails: mailer.sent.map(({ messageKey, subject, to }) => ({ messageKey, subject, to })),
}, null, 2));
