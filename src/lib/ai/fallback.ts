/**
 * @file src/lib/ai/fallback.ts
 * @description AI Provider wrapper that runs Gemini as the primary provider and falls back to Groq if rate limits or network issues arise.
 */

import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import type {
  AIProvider,
  LeadInput,
  EmailInput,
  DealInput,
  AILeadSummaryResult,
  AIEmailResult,
  AISalesInsightsResult,
} from "./provider";

/**
 * Hybrid AI provider executing Gemini first and routing to Groq if errors or quotas are hit.
 */
export class FallbackProvider implements AIProvider {
  readonly name = "Gemini (with Groq Fallback)";
  private readonly gemini: GeminiProvider;
  private readonly groq: GroqProvider;

  constructor() {
    this.gemini = new GeminiProvider();
    this.groq = new GroqProvider();
  }

  /**
   * Determines if either Gemini or Groq services are online and authenticated.
   * 
   * @returns {Promise<boolean>} True if at least one provider is responsive.
   */
  async isAvailable(): Promise<boolean> {
    const geminiOk = await this.gemini.isAvailable();
    if (geminiOk) return true;
    return this.groq.isAvailable();
  }

  /**
   * Generates a lead analysis summary with fallback protection.
   * 
   * @param {LeadInput} input Raw lead profile data
   * @returns {Promise<AILeadSummaryResult>} The resulting summary analysis
   */
  async getLeadSummary(input: LeadInput): Promise<AILeadSummaryResult> {
    const geminiOk = await this.gemini.isAvailable();
    if (geminiOk) {
      try {
        const res = await this.gemini.getLeadSummary(input);
        if (!res.noApiKey) {
          return res;
        }
      } catch (err) {
        console.warn("⚠️ [Gemini] getLeadSummary failed, falling back to Groq:", err);
      }
    }
    return this.groq.getLeadSummary(input);
  }

  async generateEmail(input: EmailInput, purpose: string, tone: string): Promise<AIEmailResult> {
    const geminiOk = await this.gemini.isAvailable();
    if (geminiOk) {
      try {
        const res = await this.gemini.generateEmail(input, purpose, tone);
        if (!res.noApiKey) {
          return res;
        }
      } catch (err) {
        console.warn("⚠️ [Gemini] generateEmail failed, falling back to Groq:", err);
      }
    }
    return this.groq.generateEmail(input, purpose, tone);
  }

  async getSalesInsights(deals: DealInput[]): Promise<AISalesInsightsResult> {
    const geminiOk = await this.gemini.isAvailable();
    if (geminiOk) {
      try {
        const res = await this.gemini.getSalesInsights(deals);
        if (!res.noApiKey) {
          return res;
        }
      } catch (err) {
        console.warn("⚠️ [Gemini] getSalesInsights failed, falling back to Groq:", err);
      }
    }
    return this.groq.getSalesInsights(deals);
  }
}
