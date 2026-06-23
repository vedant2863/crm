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

import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import { FallbackProvider } from "./fallback";
import type { AIProvider } from "./provider";

export class AIManager {
  private static instance: AIManager | null = null;
  private activeProvider: AIProvider;

  private constructor() {
    const name = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();

    if (name === "groq") {
      this.activeProvider = new GroqProvider();
    } else if (name === "gemini") {
      this.activeProvider = new FallbackProvider();
    } else {
      this.activeProvider = new GeminiProvider();
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
