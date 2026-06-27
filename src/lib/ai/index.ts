/**
 * @file src/lib/ai/index.ts
 *
 * Dependency injection entry point.
 *
 * Usage in API routes:
 *   import { getAIProvider } from "@/lib/ai";
 *   const ai = getAIProvider();          // ← injected provider
 *   const result = await ai.getLeadSummary(input);
 *
 * Switch provider by setting AI_PROVIDER in .env:
 *   AI_PROVIDER=gemini   →  GeminiProvider  (needs GEMINI_API_KEY)
 *   AI_PROVIDER=groq     →  GroqProvider    (needs GROQ_API_KEY)
 */

import { GeminiProvider } from "./models/gemini";
import { GroqProvider } from "./models/groq";
import { FallbackProvider } from "./fallback";
import type { AIProvider } from "./provider";
import envConfig from "@/lib/config/envconfig";

export class AIManager {
  private static instance: AIManager | null = null;
  private activeProvider: AIProvider;

  private constructor() {
    const name = envConfig.ai.provider;

    if (name === "groq") {
      this.activeProvider = new GroqProvider();
    } else if (name === "gemini") {
      this.activeProvider = new GeminiProvider();
    } else {
      // Default: try Gemini first, fall back to Groq
      this.activeProvider = new FallbackProvider();
    }

    console.info(
      `🤖 [AI] Active provider: ${this.activeProvider.name}`
    );
  }

  public static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  public getProvider(): AIProvider {
    return this.activeProvider;
  }

  public setProvider(provider: AIProvider): void {
    this.activeProvider = provider;
    console.info(`🤖 [AI] Dynamically switched active provider to: ${provider.name}`);
  }
}

export function getAIProvider(): AIProvider {
  return AIManager.getInstance().getProvider();
}

// Re-export types so routes only need one import path
export type { AIProvider } from "./provider";
export type {
  AILeadSummaryResult,
  AIEmailResult,
  AISalesInsightsResult,
  LeadInput,
  EmailInput,
  DealInput,
} from "./provider";
