/**
 * @file src/lib/config/envconfig.ts
 * @description Centralized environment variable configuration.
 *
 * All environment variables used across the project are accessed
 * through this single module to provide type-safety, default values,
 * and clear documentation of required vs optional variables.
 */

const envConfig = {
  // ─── Database ──────────────────────────────────────────────────────────────
  /** MongoDB connection URI */
  MONGODB_URI: process.env.MONGODB_URI || "",

  // ─── NextAuth / Authentication ─────────────────────────────────────────────
  /** Public base URL for NextAuth callbacks */
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  /** JWT signing secret for NextAuth sessions */
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",

  // ─── AI Provider Selection ─────────────────────────────────────────────────
  /**
   * Active AI provider:
   * - "gemini" → GeminiProvider (needs GEMINI_API_KEY)
   * - "groq"   → GroqProvider   (needs GROQ_API_KEY)
   * - unset    → FallbackProvider (Gemini → Groq)
   */
  AI_PROVIDER: (process.env.AI_PROVIDER ?? "gemini").toLowerCase(),

  // ─── Google Gemini ─────────────────────────────────────────────────────────
  /** Google Gemini API key (https://aistudio.google.com/app/apikey) */
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  /** Gemini model name override (default: gemini-2.5-flash) */
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  /** Gemini API endpoint override */
  GEMINI_API_URL:
    process.env.GEMINI_API_URL ??
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",

  // ─── Groq ──────────────────────────────────────────────────────────────────
  /** Groq API key (https://console.groq.com/keys) — supports legacy GROK_ prefix */
  GROQ_API_KEY: process.env.GROQ_API_KEY ?? process.env.GROK_API_KEY ?? "",
  /** Groq model name override (default: llama-3.3-70b-versatile) */
  GROQ_MODEL:
    process.env.GROQ_MODEL ?? process.env.GROK_MODEL ?? "llama-3.3-70b-versatile",

  // ─── Email / Resend ────────────────────────────────────────────────────────
  /** Resend API key for transactional emails (https://resend.com) */
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  /** Verified sender email address */
  EMAIL_FROM: process.env.EMAIL_FROM || "CRM OS <onboarding@resend.dev>",

  // ─── Application ──────────────────────────────────────────────────────────
  /** Node environment: development | production | test */
  NODE_ENV: process.env.NODE_ENV || "development",
  /** Whether the app is running in development mode */
  IS_DEV: process.env.NODE_ENV === "development",
  /** Whether the app is running in production mode */
  IS_PROD: process.env.NODE_ENV === "production",
} as const;

export default envConfig;