import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import { toast } from "sonner";
import type { Mock } from "vitest";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  api,
  redirectToLoginUrl,
  resetUnauthorizedRedirect,
} from "../axios";

vi.mock("next-auth/react", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("api request auth", () => {
  it("attaches the browser session token as Bearer", async () => {
    vi.mocked(getSession).mockResolvedValueOnce({
      user: { access: "client-token" },
    } as never);

    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      response(config),
    );
    await api.get("/wallets", { adapter });

    expect(adapter.mock.calls[0][0].headers.get("Authorization")).toBe(
      "Bearer client-token",
    );
  });

  it("sends no Authorization header without a session", async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      response(config),
    );
    await api.get("/wallets", { adapter });

    expect(
      adapter.mock.calls[0][0].headers.get("Authorization"),
    ).toBeUndefined();
  });

  it("does not inject params the caller did not pass", async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      response(config),
    );
    await api.get("/transactions", { adapter, params: { page: 2 } });

    expect(adapter.mock.calls[0][0].params).toEqual({ page: 2 });
  });
});

function response(config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    data: {},
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
}

function unauthorizedError() {
  return {
    response: { status: 401, data: {} },
    message: "Request failed with status code 401",
  };
}

describe("api unauthorized redirect", () => {
  let replaceMock: Mock<(url: string) => void>;

  beforeEach(() => {
    replaceMock = vi.fn();
  });

  afterEach(() => {
    resetUnauthorizedRedirect();
  });

  it("fires the redirect through the response interceptor on a 401", async () => {
    const adapter = vi.fn(async () => Promise.reject(unauthorizedError()));
    await expect(
      api.get("/dashboard", { adapter }),
    ).rejects.toBeDefined();

    // The interceptor ran the redirect, so the one-shot guard is now active.
    expect(redirectToLoginUrl("/dashboard", "", replaceMock)).toBe(false);
  });

  it("builds the login URL with a callbackUrl", () => {
    const redirected = redirectToLoginUrl("/dashboard", "", replaceMock);

    expect(redirected).toBe(true);
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith(
      "/login?callbackUrl=%2Fdashboard",
    );
  });

  it("preserves the query string in the callbackUrl", () => {
    redirectToLoginUrl("/dashboard", "?tab=exchange", replaceMock);

    expect(replaceMock).toHaveBeenCalledWith(
      "/login?callbackUrl=%2Fdashboard%3Ftab%3Dexchange",
    );
  });

  it("does not redirect when already on the login page", () => {
    // A failed POST /auth/login returns 401 UNAUTHORIZED by contract; the
    // login page must never bounce to itself.
    const redirected = redirectToLoginUrl("/login", "", replaceMock);

    expect(redirected).toBe(false);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects only once on a burst of parallel 401s", () => {
    expect(redirectToLoginUrl("/dashboard", "", replaceMock)).toBe(true);
    expect(redirectToLoginUrl("/dashboard", "", replaceMock)).toBe(false);

    expect(replaceMock).toHaveBeenCalledTimes(1);
  });
});

describe("interceptor stays silent on errors", () => {
  let replaceMock: Mock<(url: string) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    replaceMock = vi.fn();
  });

  afterEach(() => {
    resetUnauthorizedRedirect();
  });

  it.each([400, 403, 404, 410, 422, 500])(
    "rejects on a %s without toasting",
    async (status) => {
      const adapter = vi.fn(async () =>
        Promise.reject({
          response: { status, data: {} },
          message: "Request failed with status code " + status,
        }),
      );

      await expect(
        api.get("/exchanges", { adapter }),
      ).rejects.toBeDefined();

      expect(toast.error).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    },
  );

  it("still fires the redirect on a 401 but stays silent on toasts", async () => {
    const adapter = vi.fn(async () => Promise.reject(unauthorizedError()));

    await expect(
      api.get("/dashboard", { adapter }),
    ).rejects.toBeDefined();

    expect(redirectToLoginUrl("/dashboard", "", replaceMock)).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
