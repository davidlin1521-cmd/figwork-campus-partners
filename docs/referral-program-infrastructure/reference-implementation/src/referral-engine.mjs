import { randomBytes, randomUUID } from "node:crypto";
import { addDays, PROGRAM_CONFIG, REQUIRED_FACTS, taxYear } from "./program-config.mjs";
import { ApproveUnlessFlaggedRiskPolicy } from "./adapters.mjs";

const ALLOWED_FACTS = new Set(REQUIRED_FACTS);

export class ReferralEngine {
  constructor({
    store,
    mailer,
    payments,
    riskPolicy = new ApproveUnlessFlaggedRiskPolicy(),
    config = PROGRAM_CONFIG,
    now = () => new Date(),
    id = () => randomUUID(),
  }) {
    if (!store || !mailer || !payments) throw new Error("STORE_MAILER_AND_PAYMENTS_REQUIRED");
    this.store = store;
    this.mailer = mailer;
    this.payments = payments;
    this.riskPolicy = riskPolicy;
    this.config = config;
    this.now = now;
    this.id = id;
  }

  registerParticipant(input) {
    const participant = {
      userId: input.userId,
      email: input.email,
      eligibility: {
        age18OrOlder: Boolean(input.eligibility.age18OrOlder),
        physicallyInUnitedStates: Boolean(input.eligibility.physicallyInUnitedStates),
        visaCategory: input.eligibility.visaCategory ?? "none",
        usTaxEligibilityConfirmed: Boolean(input.eligibility.usTaxEligibilityConfirmed),
        figworkEmployee: Boolean(input.eligibility.figworkEmployee),
        immediateFamilyOfEmployee: Boolean(input.eligibility.immediateFamilyOfEmployee),
      },
      createdAt: input.createdAt ?? this.now(),
    };
    this.assertEligible(participant);
    this.store.participants.set(participant.userId, participant);
    return participant;
  }

  assertEligible(participant) {
    const eligibility = participant.eligibility;
    const disallowedVisa = new Set(["f1", "f-1", "j1", "j-1"]);
    if (!eligibility.age18OrOlder) throw new Error("PARTICIPANT_MUST_BE_18");
    if (!eligibility.physicallyInUnitedStates) throw new Error("PARTICIPANT_MUST_BE_IN_US");
    if (disallowedVisa.has(String(eligibility.visaCategory).toLowerCase())) {
      throw new Error("VISA_CATEGORY_NOT_ELIGIBLE");
    }
    if (!eligibility.usTaxEligibilityConfirmed) throw new Error("US_TAX_ELIGIBILITY_REQUIRED");
    if (eligibility.figworkEmployee || eligibility.immediateFamilyOfEmployee) {
      throw new Error("EMPLOYEE_OR_FAMILY_NOT_ELIGIBLE");
    }
  }

  addCampusMembership({ userId, effectiveAt, selectedBy, endedAt = null }) {
    if (!this.store.participants.has(userId)) throw new Error("PARTICIPANT_NOT_FOUND");
    const membership = {
      id: this.id(),
      userId,
      status: "active",
      effectiveAt,
      endedAt,
      selectedBy,
      createdAt: this.now(),
    };
    const memberships = this.store.memberships.get(userId) ?? [];
    memberships.push(membership);
    this.store.memberships.set(userId, memberships);
    return membership;
  }

  getOrCreateReferralCode(userId) {
    if (!this.store.participants.has(userId)) throw new Error("PARTICIPANT_NOT_FOUND");
    const existingId = this.store.codeByParticipant.get(userId);
    if (existingId) return this.store.codes.get(existingId);
    const code = {
      id: this.id(),
      userId,
      code: randomBytes(12).toString("base64url"),
      active: true,
      createdAt: this.now(),
    };
    this.store.codes.set(code.id, code);
    this.store.codeByParticipant.set(userId, code.id);
    return code;
  }

  captureClick({ code, visitorId, requestId, clickedAt = this.now() }) {
    if (requestId && this.store.clickByRequest.has(requestId)) {
      return this.store.clicks.get(this.store.clickByRequest.get(requestId));
    }
    const referralCode = [...this.store.codes.values()].find((item) => item.code === code && item.active);
    if (!referralCode) throw new Error("REFERRAL_CODE_NOT_FOUND");
    const click = {
      id: this.id(),
      referralCodeId: referralCode.id,
      referrerUserId: referralCode.userId,
      visitorId,
      clickedAt,
      expiresAt: addDays(clickedAt, this.config.activationWindowDays),
    };
    this.store.clicks.set(click.id, click);
    if (requestId) this.store.clickByRequest.set(requestId, click.id);
    return click;
  }

  attachAccount({ clickId, referredUserId, accountCreatedAt = this.now() }) {
    const click = this.store.clicks.get(clickId);
    if (!click) throw new Error("REFERRAL_CLICK_NOT_FOUND");
    if (accountCreatedAt > click.expiresAt) throw new Error("ATTRIBUTION_WINDOW_EXPIRED");
    if (click.referrerUserId === referredUserId) throw new Error("SELF_REFERRAL_NOT_ALLOWED");
    if (this.store.referralForReferredUser(referredUserId)) {
      throw new Error("REFERRED_USER_ALREADY_ATTRIBUTED");
    }
    const referrer = this.store.participants.get(click.referrerUserId);
    this.assertEligible(referrer);
    const membership = this.store.activeCampusMembership(click.referrerUserId, click.clickedAt);
    const track = membership ? "campus_selected" : "open_referral";
    const referral = {
      id: this.id(),
      clickId,
      referrerUserId: click.referrerUserId,
      referredUserId,
      campusMembershipId: membership?.id ?? null,
      track,
      rateCents: track === "campus_selected"
        ? this.config.campusSelectedRateCents
        : this.config.openReferralRateCents,
      annualCapCents: this.config.annualParticipantCapCents,
      configVersion: this.config.version,
      termsVersion: this.config.termsVersion,
      attributedAt: click.clickedAt,
      activationDeadlineAt: click.expiresAt,
      status: "started",
      riskSignals: [],
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    this.store.saveReferral(referral);
    this.recordProductEvent({
      eventId: `account-created:${referral.id}`,
      type: "account.created",
      userId: referredUserId,
      occurredAt: accountCreatedAt,
    });
    return referral;
  }

  recordProductEvent({ eventId, type, userId, occurredAt = this.now() }) {
    if (!ALLOWED_FACTS.has(type)) throw new Error("UNSUPPORTED_PRODUCT_EVENT");
    if (this.store.processedEvents.has(eventId)) {
      return { duplicate: true, referral: this.store.referralForReferredUser(userId) };
    }
    const referral = this.store.referralForReferredUser(userId);
    if (!referral) return { ignored: true, reason: "NO_REFERRAL" };
    this.store.processedEvents.add(eventId);
    if (occurredAt > referral.activationDeadlineAt) {
      referral.status = "expired";
      referral.updatedAt = this.now();
      return { ignored: true, reason: "ACTIVATION_WINDOW_EXPIRED", referral };
    }
    this.store.addFact(referral.id, { type, eventId, occurredAt });
    this.evaluateReferral(referral);
    return { duplicate: false, referral, reward: this.store.rewardForReferral(referral.id) };
  }

  flagReferral({ referralId, reason }) {
    const referral = this.store.referrals.get(referralId);
    if (!referral) throw new Error("REFERRAL_NOT_FOUND");
    if (!referral.riskSignals.includes(reason)) referral.riskSignals.push(reason);
    if (!this.store.rewardForReferral(referral.id)) referral.status = "in_review";
    referral.updatedAt = this.now();
    return referral;
  }

  resolveReview({ referralId, decision, decidedBy, reason }) {
    const referral = this.store.referrals.get(referralId);
    if (!referral) throw new Error("REFERRAL_NOT_FOUND");
    if (!decidedBy || !reason) throw new Error("REVIEW_AUDIT_FIELDS_REQUIRED");
    if (!new Set(["approve", "reject"]).has(decision)) throw new Error("INVALID_REVIEW_DECISION");
    const reward = this.store.rewardForReferral(referral.id);
    if (decision === "reject" && reward?.status === "paid") {
      throw new Error("PAID_REWARD_REQUIRES_ADJUSTMENT_WORKFLOW");
    }
    referral.review = { decision, decidedBy, reason, decidedAt: this.now() };
    referral.riskSignals = [];
    if (decision === "reject") {
      if (reward) {
        reward.status = "reversed";
        reward.reversalReason = reason;
        reward.updatedAt = this.now();
      }
      referral.status = "rejected";
      referral.finalReasonCode = reason;
    } else if (decision === "approve") {
      referral.status = "started";
      this.evaluateReferral(referral, { manualApproval: true });
    }
    referral.updatedAt = this.now();
    return referral;
  }

  evaluateReferral(referral, { manualApproval = false } = {}) {
    if (["expired", "rejected", "verified", "paid"].includes(referral.status)) return;
    const facts = this.store.factTypes(referral.id);
    if (!REQUIRED_FACTS.every((fact) => facts.has(fact))) return;
    const risk = manualApproval ? { decision: "approve", reasons: [] } : this.riskPolicy.evaluate(referral);
    if (risk.decision === "reject") {
      referral.status = "rejected";
      referral.finalReasonCode = risk.reasons.join(",") || "RISK_REJECTED";
      return;
    }
    if (risk.decision === "review") {
      referral.status = "in_review";
      return;
    }
    this.createReward(referral);
  }

  createReward(referral) {
    if (this.store.rewardForReferral(referral.id)) return this.store.rewardForReferral(referral.id);
    const verifiedAt = this.now();
    const year = taxYear(verifiedAt);
    const earned = this.store.countedRewardTotal(referral.referrerUserId, year);
    if (earned + referral.rateCents > referral.annualCapCents) {
      referral.status = "cap_reached";
      referral.finalReasonCode = "ANNUAL_CAP_REACHED";
      return null;
    }
    const reward = {
      id: this.id(),
      referralId: referral.id,
      participantUserId: referral.referrerUserId,
      amountCents: referral.rateCents,
      currency: this.config.currency,
      taxYear: year,
      status: "pending_hold",
      verifiedAt,
      holdEndsAt: addDays(verifiedAt, this.config.verificationHoldDays),
      configVersion: referral.configVersion,
      termsVersion: referral.termsVersion,
      createdAt: verifiedAt,
      updatedAt: verifiedAt,
    };
    this.store.saveReward(reward);
    referral.status = "verified";
    referral.updatedAt = verifiedAt;
    this.store.enqueue({
      messageKey: `reward-verified:${reward.id}`,
      type: "reward.verified",
      participantUserId: reward.participantUserId,
      rewardId: reward.id,
      createdAt: verifiedAt,
      processedAt: null,
    });
    return reward;
  }

  runHoldSweep(at = this.now()) {
    const ready = [];
    for (const reward of this.store.rewards.values()) {
      if (reward.status !== "pending_hold" || reward.holdEndsAt > at) continue;
      const referral = this.store.referrals.get(reward.referralId);
      if (referral.riskSignals.length > 0 || referral.status === "in_review") continue;
      reward.status = "ready_for_payout";
      reward.updatedAt = at;
      ready.push(reward);
    }
    return ready;
  }

  setPayoutAccount({ participantUserId, connectedAccountId, payoutsEnabled }) {
    if (!this.store.participants.has(participantUserId)) throw new Error("PARTICIPANT_NOT_FOUND");
    const account = { participantUserId, connectedAccountId, payoutsEnabled, updatedAt: this.now() };
    this.store.payoutAccounts.set(participantUserId, account);
    return account;
  }

  async runPayoutSweep({ approvedBy = null, execute = false } = {}) {
    const grouped = new Map();
    for (const reward of this.store.rewards.values()) {
      if (reward.status !== "ready_for_payout") continue;
      const rewards = grouped.get(reward.participantUserId) ?? [];
      rewards.push(reward);
      grouped.set(reward.participantUserId, rewards);
    }
    const preview = [...grouped.entries()].map(([participantUserId, rewards]) => ({
      participantUserId,
      rewardIds: rewards.map((reward) => reward.id),
      amountCents: rewards.reduce((sum, reward) => sum + reward.amountCents, 0),
      currency: this.config.currency,
    }));
    if (!execute) return { executed: false, batches: preview };
    if (!approvedBy) throw new Error("FINANCE_APPROVAL_REQUIRED");

    const completed = [];
    for (const batch of preview) {
      const payoutAccount = this.store.payoutAccounts.get(batch.participantUserId);
      if (!payoutAccount?.payoutsEnabled) continue;
      const payout = {
        id: this.id(),
        ...batch,
        status: "submitted",
        approvedBy,
        approvedAt: this.now(),
        idempotencyKey: `payout:${batch.participantUserId}:${batch.rewardIds.sort().join(":")}`,
        createdAt: this.now(),
      };
      const providerResult = await this.payments.createTransfer({
        connectedAccountId: payoutAccount.connectedAccountId,
        amountCents: payout.amountCents,
        currency: payout.currency,
        idempotencyKey: payout.idempotencyKey,
        metadata: { participantUserId: payout.participantUserId, payoutId: payout.id },
      });
      payout.providerTransferId = providerResult.providerTransferId;
      payout.status = providerResult.status;
      payout.paidAt = providerResult.status === "paid" ? this.now() : null;
      this.store.payouts.set(payout.id, payout);
      for (const rewardId of payout.rewardIds) {
        const reward = this.store.rewards.get(rewardId);
        reward.status = providerResult.status === "paid" ? "paid" : "payout_failed";
        reward.payoutId = payout.id;
        reward.updatedAt = this.now();
        const referral = this.store.referrals.get(reward.referralId);
        if (providerResult.status === "paid") referral.status = "paid";
      }
      this.store.enqueue({
        messageKey: `payout-sent:${payout.id}`,
        type: "payout.sent",
        participantUserId: payout.participantUserId,
        payoutId: payout.id,
        createdAt: this.now(),
        processedAt: null,
      });
      completed.push(payout);
    }
    return { executed: true, batches: completed };
  }

  async processOutbox() {
    const processed = [];
    for (const message of this.store.outbox.values()) {
      if (message.processedAt) continue;
      const participant = this.store.participants.get(message.participantUserId);
      const content = this.emailContent(message);
      const result = await this.mailer.send({
        messageKey: message.messageKey,
        to: participant.email,
        ...content,
      });
      message.providerMessageId = result.providerMessageId;
      message.processedAt = this.now();
      processed.push(message);
    }
    return processed;
  }

  emailContent(message) {
    if (message.type === "reward.verified") {
      return {
        subject: "Your Figwork referral was verified",
        text: "Your referral was verified and is now in the approximately 10-day verification hold. We will update your tracker when it is ready for payout.",
      };
    }
    if (message.type === "payout.sent") {
      return {
        subject: "Your Figwork referral payout was sent",
        text: "Your referral payout was sent. Check your Figwork tracker for the included activations.",
      };
    }
    throw new Error("UNKNOWN_OUTBOX_MESSAGE");
  }
}
