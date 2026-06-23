/**
 * src/lib/ai/config.ts
 *
 * Configurable defaults for AI models and provider endpoints.
 */

export const AI_CONFIG = {
  gemini: {
    defaultModel: "gemini-2.5-flash",
    defaultUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  },
  groq: {
    defaultModel: "llama-3.3-70b-versatile",
    defaultUrl: "https://api.groq.com/openai/v1/chat/completions",
  },
};
