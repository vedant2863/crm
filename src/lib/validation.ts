/**
 * @file src/lib/validation.ts
 * @description Input validation and sanitization utilities for API routes.
 * Prevents XSS, enforces field constraints, and validates MongoDB ObjectIds.
 * No external dependencies.
 */

import { AppError } from "./errors";

// ── Sanitization ─────────────────────────────────────────────────────────────

/** Strip HTML tags and trim whitespace. Limits string length. */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>]/g, "")    // strip remaining angle brackets
    .trim()
    .slice(0, maxLength);
}

// ── Validators ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/** Validate email format and length. */
export function validateEmail(email: unknown): string {
  if (typeof email !== "string" || !email.trim()) {
    throw AppError.validationFailed("Email is required");
  }
  const cleaned = email.trim().toLowerCase().slice(0, 254);
  if (!EMAIL_REGEX.test(cleaned)) {
    throw AppError.validationFailed("Invalid email format");
  }
  return cleaned;
}

/** Validate MongoDB ObjectId format. */
export function validateObjectId(id: unknown, fieldName = "id"): string {
  if (typeof id !== "string" || !OBJECT_ID_REGEX.test(id)) {
    throw AppError.validationFailed(`Invalid ${fieldName} format`);
  }
  return id;
}

/** Validate and clamp pagination parameters. Enforces max limit of 50. */
export function validatePagination(params: { page?: unknown; limit?: unknown }): {
  page: number;
  limit: number;
} {
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const limit = Math.min(50, Math.max(1, Math.floor(Number(params.limit) || 20)));
  return { page, limit };
}

/** Require a non-empty string field. Returns sanitized value. */
export function requireString(value: unknown, fieldName: string, maxLength = 500): string {
  const sanitized = sanitizeString(value, maxLength);
  if (!sanitized) {
    throw AppError.validationFailed(`${fieldName} is required`);
  }
  return sanitized;
}

/** Validate optional string field. Returns sanitized value or undefined. */
export function optionalString(value: unknown, maxLength = 500): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return sanitizeString(value, maxLength);
}

/** Validate that a value is one of the allowed enum values. */
export function validateEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string,
  defaultValue?: T
): T {
  if (value === undefined || value === null || value === "") {
    if (defaultValue !== undefined) return defaultValue;
    throw AppError.validationFailed(`${fieldName} is required`);
  }
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw AppError.validationFailed(
      `${fieldName} must be one of: ${allowed.join(", ")}`
    );
  }
  return value as T;
}

/** Validate a positive number. */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string,
  required = false
): number | undefined {
  if (value === undefined || value === null || value === "") {
    if (required) throw AppError.validationFailed(`${fieldName} is required`);
    return undefined;
  }
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    throw AppError.validationFailed(`${fieldName} must be a positive number`);
  }
  return num;
}

/** Validate an optional date string. Returns ISO string or undefined. */
export function validateDate(value: unknown, fieldName = "date"): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw AppError.validationFailed(`${fieldName} must be a valid date string`);
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw AppError.validationFailed(`${fieldName} must be a valid date string`);
  }
  return date.toISOString();
}

/** Validate an array of strings (e.g., tags). */
export function validateStringArray(
  value: unknown,
  fieldName: string,
  allowedValues?: readonly string[],
  maxItems = 20
): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw AppError.validationFailed(`${fieldName} must be an array`);
  }
  const result = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => sanitizeString(item, 100))
    .filter(Boolean)
    .slice(0, maxItems);

  if (allowedValues) {
    for (const item of result) {
      if (!allowedValues.includes(item)) {
        throw AppError.validationFailed(
          `Invalid ${fieldName} value: "${item}". Allowed: ${allowedValues.join(", ")}`
        );
      }
    }
  }

  return result;
}
