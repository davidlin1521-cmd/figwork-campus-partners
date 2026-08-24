import { createHash } from "node:crypto";

export class ApproveUnlessFlaggedRiskPolicy {
  evaluate(referral) {
    if (referral.riskSignals.length > 0) {
      return { decision: "review", reasons: [...referral.riskSignals] };
    }
    return { decision: "approve", reasons: [] };
  }
}

export class ConsoleMailer {
  constructor() {
    this.sent = [];
  }

  async send(message) {
    this.sent.push(message);
    return { providerMessageId: `console_${message.messageKey}` };
  }
}

export class MockPaymentProvider {
  constructor() {
    this.transfers = new Map();
  }

  async createTransfer(input) {
    if (this.transfers.has(input.idempotencyKey)) {
      return this.transfers.get(input.idempotencyKey);
    }
    const transfer = {
      providerTransferId: `mock_${createHash("sha256").update(input.idempotencyKey).digest("hex").slice(0, 18)}`,
      status: "paid",
      amountCents: input.amountCents,
    };
    this.transfers.set(input.idempotencyKey, transfer);
    return transfer;
  }
}

export class ResendMailer {
  constructor({ apiKey, from }) {
    if (!apiKey || !from) throw new Error("RESEND_CONFIGURATION_REQUIRED");
    this.apiKey = apiKey;
    this.from = from;
  }

  async send({ messageKey, to, subject, text }) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": messageKey,
      },
      body: JSON.stringify({ from: this.from, to: [to], subject, text }),
    });
    if (!response.ok) throw new Error(`RESEND_FAILED_${response.status}`);
    const result = await response.json();
    return { providerMessageId: result.id };
  }
}

export class StripeConnectTransferAdapter {
  constructor({ secretKey }) {
    if (!secretKey) throw new Error("STRIPE_CONFIGURATION_REQUIRED");
    this.secretKey = secretKey;
  }

  async createTransfer({ connectedAccountId, amountCents, currency, idempotencyKey, metadata }) {
    const body = new URLSearchParams({
      amount: String(amountCents),
      currency,
      destination: connectedAccountId,
      "metadata[participant_user_id]": metadata.participantUserId,
      "metadata[payout_id]": metadata.payoutId,
    });
    const response = await fetch("https://api.stripe.com/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": idempotencyKey,
      },
      body,
    });
    if (!response.ok) throw new Error(`STRIPE_TRANSFER_FAILED_${response.status}`);
    const result = await response.json();
    return {
      providerTransferId: result.id,
      status: result.reversed ? "reversed" : "paid",
      amountCents: result.amount,
    };
  }
}
