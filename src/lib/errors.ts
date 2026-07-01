/**
 * @file src/lib/errors.ts
 * @description Centralized error handling for API routes.
 * Provides AppError class with typed error codes, HTTP status mapping,
 * and a handleApiError utility for consistent API responses.
 */

import { NextResponse } from "next/server";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DUPLICATE"
  | "RATE_LIMITED"
  | "INVALID_PASSWORD"
  | "INTERNAL_ERROR";

interface ErrorResponseBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  // ── Factory methods ──────────────────────────────────────────────────────

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError("UNAUTHORIZED", message, 401);
  }

  static forbidden(message = "Insufficient permissions"): AppError {
    return new AppError("FORBIDDEN", message, 403);
  }

  static notFound(resource = "Resource"): AppError {
    return new AppError("NOT_FOUND", `${resource} not found`, 404);
  }

  static validationFailed(message: string, details?: unknown): AppError {
    return new AppError("VALIDATION_ERROR", message, 400, details);
  }

  static duplicate(resource = "Resource"): AppError {
    return new AppError("DUPLICATE", `${resource} already exists`, 409);
  }

  static rateLimited(retryAfterSeconds: number): AppError {
    return new AppError(
      "RATE_LIMITED",
      `Too many requests. Retry after ${retryAfterSeconds} seconds.`,
      429,
      { retryAfter: retryAfterSeconds }
    );
  }

  static invalidPassword(): AppError {
    return new AppError("INVALID_PASSWORD", "Current password is incorrect", 400);
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError("INTERNAL_ERROR", message, 500);
  }
}

/**
 * Maps legacy service error messages (thrown as plain Error) to AppError instances.
 * This bridges the existing service layer's error pattern with the new structured errors.
 */
function mapLegacyError(err: Error): AppError {
  switch (err.message) {
    case "UNAUTHORIZED":
      return AppError.unauthorized();
    case "NOT_FOUND":
      return AppError.notFound();
    case "USER_NOT_FOUND":
      return AppError.notFound("User");
    case "DUPLICATE_EMAIL":
      return AppError.duplicate("Contact with this email");
    case "INVALID_PASSWORD":
      return AppError.invalidPassword();
    default:
      return AppError.internal();
  }
}

/**
 * Converts any caught error into a structured NextResponse.
 * Use in API route catch blocks: `catch (err) { return handleApiError(err); }`
 */
export function handleApiError(err: unknown): NextResponse<ErrorResponseBody> {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof Error) {
    appError = mapLegacyError(err);
    // Log unexpected errors (non-legacy)
    if (appError.code === "INTERNAL_ERROR") {
      console.error("Unhandled API error:", err);
    }
  } else {
    console.error("Unknown API error:", err);
    appError = AppError.internal();
  }

  const body: ErrorResponseBody = {
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details !== undefined && { details: appError.details }),
    },
  };

  return NextResponse.json(body, { status: appError.statusCode });
}
