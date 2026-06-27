/**
 * @file src/lib/config/envconfig.ts
 * @description Centralized environment configuration.
 */

const envConfig = {
  db: {
    uri: process.env.MONGODB_URI ?? "",
  },

  auth: {
    url: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    secret: process.env.NEXTAUTH_SECRET ?? "",
  },

  ai: {
    provider: (process.env.AI_PROVIDER ?? "gemini").toLowerCase(),

    gemini: {
      apiKey: process.env.GEMINI_API_KEY ?? "",
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    },

    groq: {
      apiKey: process.env.GROQ_API_KEY ?? "",
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    },
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM ?? "CRM OS <onboarding@resend.dev>",
  },

  app: {
    nodeEnv: process.env.NODE_ENV ?? "development",
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
  },
} as const;

export default envConfig;
