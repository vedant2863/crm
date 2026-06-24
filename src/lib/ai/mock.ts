/**
 * @file src/lib/ai/mock.ts
 * @description JSON Schema-compliant mock data engines.
 *
 * These are served when:
 *  - The user's 24-hour AI quota is exhausted (rate-limit hit)
 *  - Both Gemini and Groq fail with an error during generation
 *  - No API keys are configured
 *
 * Every mock is deterministic and schema-compliant so the UI renders
 * identically to a real AI response (no null-checks needed downstream).
 */

import type {
  AILeadSummaryResult,
  AIEmailResult,
  AISalesInsightsResult,
  LeadInput,
  EmailInput,
  DealInput,
} from "./provider";

// ─── Lead Summary Mock ────────────────────────────────────────────────────────

export function mockLeadSummary(input: LeadInput): AILeadSummaryResult {
  const isHighValue = input.value > 50_000;
  const isLateStage = ["proposal", "negotiation", "won"].includes(input.stage);
  const isLost = input.stage === "won" ? false : input.stage === "lost";

  let riskScore = 50;
  let suggestedPriority: "low" | "medium" | "high" = "medium";

  if (isLost) {
    riskScore = 95;
    suggestedPriority = "low";
  } else if (isHighValue && isLateStage) {
    riskScore = 25;
    suggestedPriority = "high";
  } else if (isHighValue) {
    riskScore = 40;
    suggestedPriority = "high";
  } else if (isLateStage) {
    riskScore = 30;
    suggestedPriority = "medium";
  }

  const stageLabels: Record<string, string> = {
    new: "early prospecting",
    qualified: "qualification",
    proposal: "proposal review",
    negotiation: "active negotiation",
    won: "closed-won",
    lost: "closed-lost",
  };

  const stageLabel = stageLabels[input.stage] ?? input.stage;
  const company = input.company ?? "the client";
  const contact = input.contactName ?? "the contact";

  return {
    riskScore,
    suggestedPriority,
    summary: `${contact} at ${company} is currently in ${stageLabel}. This is a $${input.value.toLocaleString()} opportunity with ${suggestedPriority} priority. ${input.notes ? `Notes: ${input.notes}` : "No additional notes on file."}`,
    nextBestAction: isLost
      ? "Conduct a post-mortem review and schedule a re-engagement follow-up in 90 days."
      : isLateStage
      ? "Prepare a tailored proposal and schedule a closing call within the next 5 business days."
      : "Schedule a discovery call to align on requirements, budget, and timeline.",
  };
}

// ─── Email Generator Mock ─────────────────────────────────────────────────────

export function mockEmail(
  input: EmailInput,
  purpose: string,
  tone: string
): AIEmailResult {
  const contact = input.contactName ?? "there";
  const company = input.company ?? "your organisation";
  const product = input.title;
  const toneAdverb = tone === "formal" ? "formally" : tone === "casual" ? "casually" : "professionally";

  return {
    subject: `Following up on ${product} — Next Steps for ${company}`,
    body: `Hi ${contact},\n\nI hope this message finds you well. I'm reaching out ${toneAdverb} regarding your interest in "${product}" for ${company}.\n\n${
      purpose === "follow-up"
        ? "I wanted to check in to see if you've had a chance to review the information I sent over, and to find out if you have any questions or concerns I can address."
        : purpose === "introduction"
        ? `I'd love to introduce you to how "${product}" can help ${company} achieve its goals. Our solution has helped similar companies increase efficiency and drive results.`
        : `I'd like to schedule a quick 15-minute demo to walk you through "${product}" and explore how it fits your needs at ${company}.`
    }\n\nWould you be available for a brief call this week? I'm happy to work around your schedule.\n\nLooking forward to connecting,\n\n[Your Name]\n[Your Title]\n[Your Phone]\n[Your Company]`,
  };
}

// ─── Sales Insights Mock ──────────────────────────────────────────────────────

export function mockSalesInsights(deals: DealInput[]): AISalesInsightsResult {
  if (deals.length === 0) {
    return {
      healthScore: 0,
      observations: ["No active deals in the pipeline."],
      recommendations: [
        "Add leads to your pipeline to get started.",
        "Import existing opportunities from your CRM or spreadsheet.",
      ],
    };
  }

  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const wonCount = deals.filter((d) => d.stage === "won").length;
  const lostCount = deals.filter((d) => d.stage === "lost").length;
  const proposalCount = deals.filter((d) => d.stage === "proposal").length;
  const highPriorityCount = deals.filter((d) => d.priority === "high").length;
  const winRate = deals.length > 0 ? Math.round((wonCount / deals.length) * 100) : 0;

  // Health score: weighted formula
  const healthScore = Math.min(
    100,
    Math.max(
      0,
      50 +
        winRate * 0.3 -
        (lostCount / deals.length) * 30 +
        (proposalCount / deals.length) * 20 +
        (highPriorityCount > 0 ? 10 : 0)
    )
  );

  return {
    healthScore: Math.round(healthScore),
    observations: [
      `Pipeline contains ${deals.length} deal${deals.length !== 1 ? "s" : ""} with a total value of $${totalValue.toLocaleString()}.`,
      `Win rate stands at ${winRate}% (${wonCount} won, ${lostCount} lost).`,
      proposalCount > 0
        ? `${proposalCount} deal${proposalCount !== 1 ? "s are" : " is"} in the Proposal stage — a key conversion checkpoint.`
        : "No deals are currently in the Proposal stage.",
      highPriorityCount > 0
        ? `${highPriorityCount} high-priority deal${highPriorityCount !== 1 ? "s require" : " requires"} immediate attention.`
        : "No high-priority deals flagged — review prioritisation.",
    ],
    recommendations: [
      "Focus on advancing Proposal-stage deals to reduce sales cycle length.",
      winRate < 40
        ? "Win rate is below 40% — review lost deal reasons and refine qualification criteria."
        : "Maintain current qualification standards that are driving a healthy win rate.",
      highPriorityCount > 2
        ? "Too many high-priority deals may dilute focus — re-evaluate urgency scoring."
        : "Schedule follow-ups for all active deals within the next 3 business days.",
      "Ensure every deal has a clearly defined next action and expected close date.",
    ],
  };
}
