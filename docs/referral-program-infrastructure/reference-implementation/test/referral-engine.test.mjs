import assert from "node:assert/strict";
import test from "node:test";
import { ConsoleMailer, MockPaymentProvider } from "../src/adapters.mjs";
import { InMemoryStore } from "../src/in-memory-store.mjs";
import { ReferralEngine } from "../src/referral-engine.mjs";

function setup({ now = new Date("2026-09-01T00:00:00.000Z"), config } = {}) {
  let currentTime = now;
  const store = new InMemoryStore();
  const mailer = new ConsoleMailer();
  const payments = new MockPaymentProvider();
  const engine = new ReferralEngine({
    store,
    mailer,
    payments,
    now: () => currentTime,
    ...(config ? { config } : {}),
  });
  const advance = (date) => { currentTime = date; };
  return { engine, store, mailer, payments, advance };
}

function register(engine, userId = "referrer_1") {
  return engine.registerParticipant({
    userId,
    email: `${userId}@example.com`,
    eligibility: {
      age18OrOlder: true,
      physicallyInUnitedStates: true,
      visaCategory: "none",
      usTaxEligibilityConfirmed: true,
      figworkEmployee: false,
      immediateFamilyOfEmployee: false,
    },
  });
}

function startReferral(engine, { referrer = "referrer_1", referred = "new_user_1" } = {}) {
  const code = engine.getOrCreateReferralCode(referrer);
  const click = engine.captureClick({
    code: code.code,
    visitorId: `visitor_${referred}`,
    requestId: `request_${referrer}_${referred}`,
  });
  return engine.attachAccount({ clickId: click.id, referredUserId: referred });
}

function finishActivation(engine, referred = "new_user_1") {
  engine.recordProductEvent({ eventId: `install_${referred}`, type: "extension.installed", userId: referred });
  return engine.recordProductEvent({ eventId: `resume_${referred}`, type: "resume.uploaded", userId: referred });
}

test("open referral creates one $5 held reward only after all required facts", () => {
  const { engine, store } = setup();
  register(engine);
  const referral = startReferral(engine);
  engine.recordProductEvent({ eventId: "install_only", type: "extension.installed", userId: "new_user_1" });
  assert.equal(store.rewards.size, 0);
  const result = engine.recordProductEvent({ eventId: "resume_1", type: "resume.uploaded", userId: "new_user_1" });
  assert.equal(result.reward.amountCents, 500);
  assert.equal(result.reward.status, "pending_hold");
  assert.equal(referral.track, "open_referral");
});

test("selected campus rate is frozen at click time", () => {
  const { engine } = setup();
  register(engine);
  engine.addCampusMembership({
    userId: "referrer_1",
    effectiveAt: new Date("2026-08-31T00:00:00.000Z"),
    selectedBy: "ops_1",
  });
  const referral = startReferral(engine);
  finishActivation(engine);
  assert.equal(referral.track, "campus_selected");
  assert.equal(referral.rateCents, 1_000);
});

test("selection after a click does not retroactively change its rate", () => {
  const { engine } = setup();
  register(engine);
  const referral = startReferral(engine);
  engine.addCampusMembership({
    userId: "referrer_1",
    effectiveAt: new Date("2026-09-02T00:00:00.000Z"),
    selectedBy: "ops_1",
  });
  finishActivation(engine);
  assert.equal(referral.track, "open_referral");
  assert.equal(referral.rateCents, 500);
});

test("product event retries are idempotent and cannot create two rewards", () => {
  const { engine, store } = setup();
  register(engine);
  startReferral(engine);
  engine.recordProductEvent({ eventId: "same_install", type: "extension.installed", userId: "new_user_1" });
  engine.recordProductEvent({ eventId: "same_install", type: "extension.installed", userId: "new_user_1" });
  engine.recordProductEvent({ eventId: "same_resume", type: "resume.uploaded", userId: "new_user_1" });
  engine.recordProductEvent({ eventId: "same_resume", type: "resume.uploaded", userId: "new_user_1" });
  assert.equal(store.rewards.size, 1);
});

test("one referred user cannot be attributed twice", () => {
  const { engine } = setup();
  register(engine, "referrer_1");
  register(engine, "referrer_2");
  startReferral(engine, { referrer: "referrer_1", referred: "new_user_1" });
  assert.throws(
    () => startReferral(engine, { referrer: "referrer_2", referred: "new_user_1" }),
    /REFERRED_USER_ALREADY_ATTRIBUTED/,
  );
});

test("activation outside the 14-day window expires without a reward", () => {
  const { engine, store } = setup();
  register(engine);
  const referral = startReferral(engine);
  engine.recordProductEvent({
    eventId: "late_install",
    type: "extension.installed",
    userId: "new_user_1",
    occurredAt: new Date("2026-09-16T00:00:00.000Z"),
  });
  assert.equal(referral.status, "expired");
  assert.equal(store.rewards.size, 0);
});

test("fraud flags require an audited manual decision", () => {
  const { engine, store } = setup();
  register(engine);
  const referral = startReferral(engine);
  engine.flagReferral({ referralId: referral.id, reason: "duplicate_device" });
  finishActivation(engine);
  assert.equal(referral.status, "in_review");
  assert.equal(store.rewards.size, 0);
  engine.resolveReview({
    referralId: referral.id,
    decision: "approve",
    decidedBy: "trust_1",
    reason: "false_positive",
  });
  assert.equal(store.rewards.size, 1);
});

test("a later fraud rejection stops an unpaid reward", () => {
  const { engine, store, advance } = setup();
  register(engine);
  const referral = startReferral(engine);
  finishActivation(engine);
  engine.flagReferral({ referralId: referral.id, reason: "fabricated_account" });
  engine.resolveReview({
    referralId: referral.id,
    decision: "reject",
    decidedBy: "trust_1",
    reason: "confirmed_fabrication",
  });
  advance(new Date("2026-09-20T00:00:00.000Z"));
  assert.equal(engine.runHoldSweep().length, 0);
  assert.equal([...store.rewards.values()][0].status, "reversed");
  assert.equal(referral.status, "rejected");
});

test("the annual cap blocks a reward that would exceed the frozen limit", () => {
  const config = {
    version: "cap-test",
    termsVersion: "cap-test",
    currency: "usd",
    openReferralRateCents: 500,
    campusSelectedRateCents: 1_000,
    annualParticipantCapCents: 500,
    activationWindowDays: 14,
    verificationHoldDays: 10,
  };
  const { engine, store } = setup({ config });
  register(engine);
  startReferral(engine, { referred: "new_user_1" });
  finishActivation(engine, "new_user_1");
  const second = startReferral(engine, { referred: "new_user_2" });
  finishActivation(engine, "new_user_2");
  assert.equal(store.rewards.size, 1);
  assert.equal(second.status, "cap_reached");
});

test("payouts stay in preview until Finance explicitly executes them", async () => {
  const { engine, store, payments, advance } = setup();
  register(engine);
  startReferral(engine);
  finishActivation(engine);
  advance(new Date("2026-09-12T00:00:00.000Z"));
  engine.runHoldSweep();
  engine.setPayoutAccount({
    participantUserId: "referrer_1",
    connectedAccountId: "acct_1",
    payoutsEnabled: true,
  });
  const preview = await engine.runPayoutSweep();
  assert.equal(preview.executed, false);
  assert.equal(payments.transfers.size, 0);
  await assert.rejects(() => engine.runPayoutSweep({ execute: true }), /FINANCE_APPROVAL_REQUIRED/);
  const result = await engine.runPayoutSweep({ execute: true, approvedBy: "finance_1" });
  assert.equal(result.batches.length, 1);
  assert.equal(payments.transfers.size, 1);
  assert.equal([...store.rewards.values()][0].status, "paid");
});

test("ineligible participants are rejected without storing a raw tax identifier", () => {
  const { engine, store } = setup();
  assert.throws(() => engine.registerParticipant({
    userId: "ineligible_1",
    email: "ineligible@example.com",
    eligibility: {
      age18OrOlder: true,
      physicallyInUnitedStates: true,
      visaCategory: "F-1",
      usTaxEligibilityConfirmed: true,
    },
  }), /VISA_CATEGORY_NOT_ELIGIBLE/);
  assert.equal(store.participants.size, 0);
});
