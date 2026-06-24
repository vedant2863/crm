/**
 * @file src/lib/ai/groq.ts
 * @description Groq API provider implementation utilizing the official groq-sdk for low-latency Llama inference fallback.
 */

import { Groq } from "groq-sdk";
import { fromCache, toCache } from "../provider";
import { AI_CONFIG } from "../config";
import {
  LEAD_SUMMARY_SYSTEM,
  getLeadSummaryUserPrompt,
  EMAIL_GENERATOR_SYSTEM,
  getEmailGeneratorUserPrompt,
  SALES_INSIGHTS_SYSTEM,
  getSalesInsightsUserPrompt,
} from "../prompts";
import type {
  AIProvider,
  LeadInput,
  EmailInput,
  DealInput,
  AILeadSummaryResult,
  AIEmailResult,
  AISalesInsightsResult,
} from "../provider";

export class GroqProvider implements AIProvider {
  readonly name = "Groq";
  private readonly hasKey: boolean;
  private readonly client: Groq | null = null;
  private readonly model: string;

  constructor() {
    const key = process.env.GROQ_API_KEY ?? process.env.GROK_API_KEY ?? "";
    this.model = process.env.GROQ_MODEL ?? process.env.GROK_MODEL ?? AI_CONFIG.groq.defaultModel;
    this.hasKey = !!key;
    this.client = this.hasKey ? new Groq({ apiKey: key }) : null;
  }

  private async call(system: string, user: string): Promise<string> {
    if (!this.client) {
      throw new Error("Groq client not initialized");
    }

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: `${system} Respond ONLY with valid JSON. No markdown.` },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || "";
  }

  async getLeadSummary(input: LeadInput): Promise<AILeadSummaryResult> {
    if (!(await this.isAvailable())) {
      return { riskScore: 0, suggestedPriority: "medium", summary: "", nextBestAction: "", noApiKey: true };
    }

    const key = `groq:lead:${input.title}:${input.stage}:${input.value}`;
    const hit = fromCache<AILeadSummaryResult>(key);
    if (hit) {
      console.info("✅ [Groq Cache HIT] Lead Summary");
      return hit;
    }

    const text = await this.call(LEAD_SUMMARY_SYSTEM, getLeadSummaryUserPrompt(input));
    const result = JSON.parse(text) as AILeadSummaryResult;
    toCache(key, result);
    return result;
  }

  async generateEmail(input: EmailInput, purpose: string, tone: string): Promise<AIEmailResult> {
    if (!(await this.isAvailable())) {
      return { subject: "", body: "", noApiKey: true };
    }

    const key = `groq:email:${input.title}:${input.company}:${purpose}:${tone}`;
    const hit = fromCache<AIEmailResult>(key);
    if (hit) {
      console.info("✅ [Groq Cache HIT] Email");
      return hit;
    }

    const text = await this.call(EMAIL_GENERATOR_SYSTEM, getEmailGeneratorUserPrompt(input, purpose, tone));
    const result = JSON.parse(text) as AIEmailResult;
    toCache(key, result);
    return result;
  }

  async getSalesInsights(deals: DealInput[]): Promise<AISalesInsightsResult> {
    if (!(await this.isAvailable())) {
      return { healthScore: 0, observations: [], recommendations: [], noApiKey: true };
    }

    const total = deals.reduce((s, d) => s + d.value, 0);
    const key = `groq:insights:${deals.length}:${total}`;
    const hit = fromCache<AISalesInsightsResult>(key);
    if (hit) {
      console.info("✅ [Groq Cache HIT] Sales Insights");
      return hit;
    }

    const text = await this.call(SALES_INSIGHTS_SYSTEM, getSalesInsightsUserPrompt(deals));
    const result = JSON.parse(text) as AISalesInsightsResult;
    toCache(key, result);
    return result;
  }

  /**
   * Availability is determined by whether a key is configured.
   * A live models.list() call is intentionally avoided — it consumes quota
   * and can throw before any generation even begins.
   */
  async isAvailable(): Promise<boolean> {
    return this.hasKey && this.client !== null;
  }
}
