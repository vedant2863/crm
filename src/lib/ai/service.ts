/**
 * src/lib/ai/service.ts
 *
 * AIService class wrapping the AI model provider via constructor dependency injection.
 */
import type {
  AIProvider,
  LeadInput,
  EmailInput,
  DealInput,
  AILeadSummaryResult,
  AIEmailResult,
  AISalesInsightsResult,
} from "./provider";

export class AIService {
  private readonly ai: AIProvider;

  constructor(aiProvider: AIProvider) {
    this.ai = aiProvider;
  }

  /**
   * Generates a structured lead analysis.
   */
  async getLeadSummary(input: LeadInput): Promise<AILeadSummaryResult> {
    return this.ai.getLeadSummary(input);
  }

  /**
   * Generates a B2B sales email.
   */
  async generateEmail(input: EmailInput, purpose: string, tone: string): Promise<AIEmailResult> {
    return this.ai.generateEmail(input, purpose, tone);
  }

  /**
   * Analyzes active pipeline deals and suggests observations & recommendations.
   */
  async getSalesInsights(deals: DealInput[]): Promise<AISalesInsightsResult> {
    return this.ai.getSalesInsights(deals);
  }

  /**
   * Verifies if the underlying AI model is responsive.
   */
  async isAvailable(): Promise<boolean> {
    return this.ai.isAvailable();
  }

  /**
   * Exposes the active provider name.
   */
  get providerName(): string {
    return this.ai.name;
  }
}
