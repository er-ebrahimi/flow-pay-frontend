import { describe, expect, it } from "vitest";
import {
  getErrorCode,
  getErrorMessage,
  normalizeError,
} from "../logger";

/** Minimal axios-error stand-in: isAxiosError only checks the flag. */
function axiosError(status: number, data: unknown, code?: string) {
  return {
    isAxiosError: true,
    name: "AxiosError",
    message: `Request failed with status code ${status}`,
    code,
    response: { status, data },
  };
}

describe("getErrorMessage — FlowPay GlobalExceptionFilter envelope", () => {
  it("extracts the message from the error envelope", () => {
    const error = axiosError(400, {
      error: { code: "VALIDATION_FAILED", message: "email must be an email" },
    });

    expect(getErrorMessage(error, "fallback")).toBe("email must be an email");
  });

  it("extracts the message for the 422 insufficient-balance code", () => {
    const error = axiosError(422, {
      error: {
        code: "INSUFFICIENT_BALANCE",
        message: "Not enough USD balance",
      },
    });

    expect(getErrorMessage(error, "fallback")).toBe(
      "Not enough USD balance",
    );
  });

  it("falls back when the envelope is missing", () => {
    const error = axiosError(500, {});

    expect(getErrorMessage(error, "fallback")).toBe("fallback");
  });

  it("accepts a bare string body", () => {
    const error = axiosError(400, "email must be an email");

    expect(getErrorMessage(error, "fallback")).toBe("email must be an email");
  });

  it("accepts a flat message field as a non-envelope fallback", () => {
    const error = axiosError(400, { message: "email must be an email" });

    expect(getErrorMessage(error, "fallback")).toBe("email must be an email");
  });

  it("maps opaque NextAuth error names to the fallback", () => {
    const error = new Error("CredentialsSignin");

    expect(getErrorMessage(error, "Invalid email or password.")).toBe(
      "Invalid email or password.",
    );
  });

  it("uses an informative Error message as-is", () => {
    const error = new Error("Network Error");

    expect(getErrorMessage(error, "fallback")).toBe("Network Error");
  });
});

describe("getErrorCode — API_CONTRACT.md code reference", () => {
  it.each([
    ["VALIDATION_FAILED", 400],
    ["NOT_FOUND", 404],
    ["CONFLICT", 409],
    ["QUOTE_ALREADY_CONSUMED", 409],
    ["QUOTE_EXPIRED", 410],
    ["INSUFFICIENT_BALANCE", 422],
    ["INTERNAL_ERROR", 500],
  ])("reads %s from a %s response", (code, status) => {
    const error = axiosError(status, {
      error: { code, message: "any" },
    });

    expect(getErrorCode(error)).toBe(code);
  });

  it("returns null without the envelope", () => {
    expect(getErrorCode(axiosError(500, {}))).toBeNull();
  });

  it("returns null for non-axios errors", () => {
    expect(getErrorCode(new Error("boom"))).toBeNull();
  });
});

describe("normalizeError", () => {
  it("keeps status, envelope code, and sanitized response data", () => {
    const error = axiosError(422, {
      error: { code: "INSUFFICIENT_BALANCE", message: "Not enough USD" },
      accessToken: "should-not-leak",
    });

    const normalized = normalizeError(error);

    expect(normalized.status).toBe(422);
    expect(normalized.code).toBe("INSUFFICIENT_BALANCE");
    expect(normalized.responseData).not.toHaveProperty("accessToken");
    expect(normalized.responseData).toHaveProperty("error");
  });

  it("normalizes plain errors", () => {
    const normalized = normalizeError(new Error("boom"));
    expect(normalized).toMatchObject({
      type: "Error",
      message: "boom",
    });
  });

  it("normalizes unknown values", () => {
    expect(normalizeError(undefined)).toMatchObject({
      type: "UnknownError",
      message: "Unknown error",
    });
  });
});
