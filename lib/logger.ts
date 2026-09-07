// lib/logger.ts
//
// Structured logging + FlowPay error extraction.
//
// The backend's GlobalExceptionFilter always answers with the envelope
//   { "error": { "code": "VALIDATION_FAILED", "message": "..." } }
// (docs/API_CONTRACT.md — final error code reference). getErrorMessage reads
// that envelope; getErrorCode exposes the machine-readable code so the UI can
// branch on INSUFFICIENT_BALANCE / QUOTE_EXPIRED / QUOTE_ALREADY_CONSUMED.

import pino from "pino";
import { isAxiosError } from "axios";

const isDevelopment = process.env.NODE_ENV === "development";

export interface NormalizedError {
  type: string;
  name: string;
  message: string;
  stack?: string;
  code?: string;
  status?: number;
  responseData?: unknown;
}

export function normalizeError(error: unknown): NormalizedError {
  if (isAxiosError(error)) {
    return removeUndefined({
      type: error.name || "AxiosError",
      name: error.name || "AxiosError",
      message: error.message,
      stack: error.stack,
      code: getErrorCode(error) ?? error.code,
      status: error.status ?? error.response?.status,
      responseData: sanitizeResponseData(error.response?.data, new WeakSet()),
    });
  }

  if (error instanceof Error) {
    return removeUndefined({
      type: error.name || "Error",
      name: error.name || "Error",
      message: error.message,
      stack: error.stack,
    });
  }

  return {
    type: "UnknownError",
    name: "UnknownError",
    message: typeof error === "string" ? error : "Unknown error",
  };
}

// NextAuth surfaces these opaque error names to the client; they carry no
// user value, so getErrorMessage falls through to the caller's fallback.
const NON_INFORMATIVE_ERROR_MESSAGES = new Set([
  "CredentialsSignin",
  "Signin",
  "OAuthSignin",
  "OAuthCallback",
  "OAuthCreateAccount",
  "EmailCreateAccount",
  "Callback",
  "OAuthAccountNotLinked",
  "EmailSignin",
  "SessionRequired",
  "Configuration",
  "AccessDenied",
  "Verification",
  "Default",
]);

export function getErrorMessage(error: unknown, fallback: string) {
  const responseData = isAxiosError(error) ? error.response?.data : undefined;
  const extracted = extractMessage(responseData);
  if (extracted) return extracted;

  if (
    error instanceof Error &&
    error.message &&
    !NON_INFORMATIVE_ERROR_MESSAGES.has(error.message)
  ) {
    return error.message;
  }

  return fallback;
}

/** The `error.code` from the GlobalExceptionFilter envelope, if present. */
export function getErrorCode(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data as { error?: { code?: unknown } } | undefined;
  const code = data?.error?.code;
  return typeof code === "string" && code ? code : null;
}

export const logger = pino({
  level: isDevelopment ? "debug" : "info",
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
  serializers: {
    err: normalizeError,
  },
  browser: {
    serialize: ["err"],
  },
});

// Balances and transaction payloads must not leak into logs.
const SENSITIVE_KEYS = /authorization|cookie|password|token|secret|credential|headers?|config|access|refresh|session/i;

function sanitizeResponseData(
  value: unknown,
  seen: WeakSet<object>,
  depth = 0,
): unknown {
  if (value == null || typeof value !== "object") return value;
  if (depth > 3 || seen.has(value)) return "[Truncated]";
  seen.add(value);
  if (Array.isArray(value)) {
    return value
      .slice(0, 20)
      .map((item) => sanitizeResponseData(item, seen, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE_KEYS.test(key))
      .slice(0, 50)
      .map(([key, item]) => [key, sanitizeResponseData(item, seen, depth + 1)]),
  );
}

function extractMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (!value || typeof value !== "object") return null;

  const data = value as Record<string, unknown>;

  // Primary: the GlobalExceptionFilter envelope.
  const envelope = data.error;
  if (envelope && typeof envelope === "object") {
    const message = (envelope as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  // Fallbacks for any endpoint that answers with a bare string or a flat
  // message field.
  const message = data.message;
  if (typeof message === "string" && message.trim()) return message;

  for (const [field, candidate] of Object.entries(data)) {
    const text = Array.isArray(candidate) ? candidate[0] : candidate;
    if (typeof text === "string" && text.trim()) {
      return `${field}: ${text}`;
    }
  }
  return null;
}

function removeUndefined<T extends NormalizedError>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T;
}
