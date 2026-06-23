/**
 * src/lib/ai/prompts.ts
 *
 * System and user prompts for CRM Sales AI.
 */
import type { LeadInput, EmailInput, DealInput } from "./provider";

// --- Lead Summary ---
export const LEAD_SUMMARY_SYSTEM = "You are an expert CRM sales assistant.";

export function getLeadSummaryUserPrompt(input: LeadInput): string {
  return `Analyze this CRM lead:
- Deal: ${input.title} | Company: ${input.company ?? "Unknown"}
- Contact: ${input.contactName ?? "Unknown"} | Value: $${input.value.toLocaleString()}
- Stage: ${input.stage} | Priority: ${input.priority}
- Notes: ${input.notes ?? "None"}

You must respond with a JSON object containing precisely these keys:
{
  "riskScore": (number between 0 and 100 representing risk),
  "suggestedPriority": ("low" | "medium" | "high"),
  "summary": (brief string summary of lead status),
  "nextBestAction": (actionable next step)
}`;
}

// --- Email Generator ---
export const EMAIL_GENERATOR_SYSTEM = "You are a professional B2B sales email copywriter.";

export function getEmailGeneratorUserPrompt(input: EmailInput, purpose: string, tone: string): string {
  return `Write a B2B sales email:
- Recipient: ${input.contactName ?? "there"} at ${input.company ?? "their company"}
- Product/Context: ${input.title}
- Purpose: ${purpose}
- Tone: ${tone}

You must respond with a JSON object containing precisely these keys:
{
  "subject": (email subject line),
  "body": (email body, including a "[Your Name]" placeholder at the end)
}`;
}

// --- Sales Insights ---
export const SALES_INSIGHTS_SYSTEM = "You are a strategic sales consultant providing executive pipeline analysis.";

export function getSalesInsightsUserPrompt(deals: DealInput[]): string {
  const total = deals.reduce((s, d) => s + d.value, 0);
  return `Analyze these ${deals.length} active pipeline deals (total value: $${total.toLocaleString()}):
${JSON.stringify(deals, null, 2)}

You must respond with a JSON object containing precisely these keys:
{
  "healthScore": (overall pipeline health score between 0 and 100),
  "observations": (array of 3-5 strings detailing key observations or risks),
  "recommendations": (array of 3-5 strings detailing actionable strategic recommendations)
}`;
}
