/**
 * src/lib/ai/schemas.ts
 *
 * Structured JSON response schemas for Gemini structured outputs.
 */

export const LEAD_SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    riskScore: { type: "integer", description: "A score from 0 to 100 representing deal risk." },
    suggestedPriority: { type: "string", enum: ["low", "medium", "high"], description: "Recommended priority level." },
    summary: { type: "string", description: "Short paragraph summarizing lead status and relationship state." },
    nextBestAction: { type: "string", description: "Most strategic next step to advance the deal." },
  },
  required: ["riskScore", "suggestedPriority", "summary", "nextBestAction"],
};

export const EMAIL_GENERATOR_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", description: "Professional subject line." },
    body: { type: "string", description: "Polished B2B email body text." },
  },
  required: ["subject", "body"],
};

export const SALES_INSIGHTS_SCHEMA = {
  type: "object",
  properties: {
    healthScore: { type: "integer", description: "Pipeline health score from 0 to 100." },
    observations: {
      type: "array",
      items: { type: "string" },
      description: "3 to 5 bullet point observations about risks, velocity, or trends.",
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
      description: "3 to 5 actionable strategic recommendations to optimize sales velocity.",
    },
  },
  required: ["healthScore", "observations", "recommendations"],
};
