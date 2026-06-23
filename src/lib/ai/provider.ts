/**
 * @file src/lib/ai/provider.ts
 * @description Type definitions, interfaces, and shared in-memory TTL caching mechanisms for AI providers.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Result Types ─────────────────────────────────────────────────────────────

export interface AILeadSummaryResult {
  riskScore: number;
  suggestedPriority: "low" | "medium" | "high";
  summary: string;
  nextBestAction: string;
  noApiKey?: boolean;
}

export interface AIEmailResult {
  subject: string;
  body: string;
  noApiKey?: boolean;
}

export interface AISalesInsightsResult {
  healthScore: number;
  observations: string[];
  recommendations: string[];
  noApiKey?: boolean;
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface LeadInput {
  title: string;
  company?: string;
  value: number;
  stage: string;
  priority: string;
  notes?: string;
  contactName?: string;
}

export interface EmailInput {
  contactName?: string;
  company?: string;
  title: string;
}

export interface DealInput {
  title: string;
  value: number;
  stage: string;
  priority: string;
  company?: string;
}

// ─── Provider Interface ───────────────────────────────────────────────────────

export interface AIProvider {
  /** Human-readable name shown in UI and logs */
  readonly name: string;
  /** Whether the provider has a valid API key / is ready */
  isAvailable(): Promise<boolean>;

  getLeadSummary(input: LeadInput): Promise<AILeadSummaryResult>;
  generateEmail(input: EmailInput, purpose: string, tone: string): Promise<AIEmailResult>;
  getSalesInsights(deals: DealInput[]): Promise<AISalesInsightsResult>;
}

// ─── Shared TTL Cache ─────────────────────────────────────────────────────────

interface CacheEntry<T> { data: T; expiresAt: number; }
const _cache = new Map<string, CacheEntry<any>>();
const TTL = 10 * 60 * 1000; // 10 min

export function fromCache<T>(key: string): T | null {
  const e = _cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { _cache.delete(key); return null; }
  return e.data as T;
}

export function toCache<T>(key: string, data: T): void {
  _cache.set(key, { data, expiresAt: Date.now() + TTL });
}
