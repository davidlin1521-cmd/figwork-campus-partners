export class InMemoryStore {
  constructor() {
    this.participants = new Map();
    this.memberships = new Map();
    this.codes = new Map();
    this.codeByParticipant = new Map();
    this.clicks = new Map();
    this.clickByRequest = new Map();
    this.referrals = new Map();
    this.referralByReferredUser = new Map();
    this.processedEvents = new Set();
    this.factsByReferral = new Map();
    this.rewards = new Map();
    this.rewardByReferral = new Map();
    this.payoutAccounts = new Map();
    this.payouts = new Map();
    this.outbox = new Map();
  }

  activeCampusMembership(userId, at) {
    const memberships = this.memberships.get(userId) ?? [];
    return memberships.find((membership) => {
      const started = membership.status === "active" && membership.effectiveAt <= at;
      const notEnded = !membership.endedAt || membership.endedAt > at;
      return started && notEnded;
    }) ?? null;
  }

  saveReferral(referral) {
    if (this.referralByReferredUser.has(referral.referredUserId)) {
      throw new Error("REFERRED_USER_ALREADY_ATTRIBUTED");
    }
    this.referrals.set(referral.id, referral);
    this.referralByReferredUser.set(referral.referredUserId, referral.id);
  }

  referralForReferredUser(userId) {
    const referralId = this.referralByReferredUser.get(userId);
    return referralId ? this.referrals.get(referralId) : null;
  }

  addFact(referralId, fact) {
    const facts = this.factsByReferral.get(referralId) ?? new Map();
    if (!facts.has(fact.type)) facts.set(fact.type, fact);
    this.factsByReferral.set(referralId, facts);
  }

  factTypes(referralId) {
    return new Set(this.factsByReferral.get(referralId)?.keys() ?? []);
  }

  saveReward(reward) {
    if (this.rewardByReferral.has(reward.referralId)) {
      throw new Error("REWARD_ALREADY_EXISTS");
    }
    this.rewards.set(reward.id, reward);
    this.rewardByReferral.set(reward.referralId, reward.id);
  }

  rewardForReferral(referralId) {
    const rewardId = this.rewardByReferral.get(referralId);
    return rewardId ? this.rewards.get(rewardId) : null;
  }

  countedRewardTotal(participantUserId, year) {
    const countedStatuses = new Set(["pending_hold", "ready_for_payout", "paid"]);
    return [...this.rewards.values()]
      .filter((reward) =>
        reward.participantUserId === participantUserId &&
        reward.taxYear === year &&
        countedStatuses.has(reward.status))
      .reduce((total, reward) => total + reward.amountCents, 0);
  }

  enqueue(message) {
    if (!this.outbox.has(message.messageKey)) {
      this.outbox.set(message.messageKey, message);
    }
  }
}
