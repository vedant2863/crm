/**
 * @file src/lib/ai/gemini.ts
 * @description Google Gemini provider implementation utilizing the official @google/genai SDK for structured generation.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenAI } from "@google/genai";
import envConfig from "@/lib/config/envconfig";
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
import {
  LEAD_SUMMARY_SCHEMA,
  EMAIL_GENERATOR_SCHEMA,
  SALES_INSIGHTS_SCHEMA,
} from "../schemas";
import type {
  AIProvider,
  LeadInput,
  EmailInput,
  DealInput,
  AILeadSummaryResult,
  AIEmailResult,
  AISalesInsightsResult,
} from "../provider";

export class GeminiProvider implements AIProvider {
  readonly name = "Gemini";
  private readonly hasKey: boolean;
  private client: GoogleGenAI | null;
  private readonly model: string;
  private readonly url: string;

  constructor() {
    const key = envConfig.GEMINI_API_KEY;
    this.model = envConfig.GEMINI_MODEL;
    this.url = envConfig.GEMINI_API_URL;
    this.hasKey = !!key;
    this.client = this.hasKey ? new GoogleGenAI({ apiKey: key }) : null;
  }

  private async call(prompt: string, schema: any): Promise<string> {
    const res = await this.client!.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return res.text!;
  }

  async getLeadSummary(input: LeadInput): Promise<AILeadSummaryResult> {
    if (!(await this.isAvailable())) {
      return { riskScore: 0, suggestedPriority: "medium", summary: "", nextBestAction: "", noApiKey: true };
    }

    const key = `gemini:lead:${input.title}:${input.stage}:${input.value}`;
    const hit = fromCache<AILeadSummaryResult>(key);
    if (hit) {
      console.info("✅ [Gemini Cache HIT] Lead Summary");
      return hit;
    }

    const prompt = `${LEAD_SUMMARY_SYSTEM}\n\n${getLeadSummaryUserPrompt(input)}`;
    const text = await this.call(prompt, LEAD_SUMMARY_SCHEMA);
    const result = JSON.parse(text) as AILeadSummaryResult;
    toCache(key, result);
    return result;
  }

  async generateEmail(input: EmailInput, purpose: string, tone: string): Promise<AIEmailResult> {
    if (!(await this.isAvailable())) {
      return { subject: "", body: "", noApiKey: true };
    }

    const key = `gemini:email:${input.title}:${input.company}:${purpose}:${tone}`;
    const hit = fromCache<AIEmailResult>(key);
    if (hit) {
      console.info("✅ [Gemini Cache HIT] Email");
      return hit;
    }

    const prompt = `${EMAIL_GENERATOR_SYSTEM}\n\n${getEmailGeneratorUserPrompt(input, purpose, tone)}`;
    const text = await this.call(prompt, EMAIL_GENERATOR_SCHEMA);
    const result = JSON.parse(text) as AIEmailResult;
    toCache(key, result);
    return result;
  }

  async getSalesInsights(deals: DealInput[]): Promise<AISalesInsightsResult> {
    if (!(await this.isAvailable())) {
      return { healthScore: 0, observations: [], recommendations: [], noApiKey: true };
    }

    const total = deals.reduce((s, d) => s + d.value, 0);
    const key = `gemini:insights:${deals.length}:${total}`;
    const hit = fromCache<AISalesInsightsResult>(key);
    if (hit) {
      console.info("✅ [Gemini Cache HIT] Sales Insights");
      return hit;
    }

    const prompt = `${SALES_INSIGHTS_SYSTEM}\n\n${getSalesInsightsUserPrompt(deals)}`;
    const text = await this.call(prompt, SALES_INSIGHTS_SCHEMA);
    const result = JSON.parse(text) as AISalesInsightsResult;
    toCache(key, result);
    return result;
  }

  /**
   * Availability is determined by whether a key is configured.
   * A live models.list() call is intentionally avoided — it consumes quota
   * and throws 500s when the key is rate-limited, defeating the purpose.
   */
  async isAvailable(): Promise<boolean> {
    return this.hasKey && this.client !== null;
  }
}
