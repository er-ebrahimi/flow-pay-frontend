import { AxiosError, type AxiosResponse } from "axios";

/**
 * Builds a contract-shaped API error ({ error: { code, message } } envelope,
 * docs/API_CONTRACT.md) that `isAxiosError` recognizes — so getErrorMessage /
 * getErrorCode, the query retry policy, and the axios 401 interceptor all
 * behave exactly as they will against the real backend.
 *
 * Mock transports raise these; the real transport gets them for free from
 * axios itself.
 */
export function apiError(status: number, code: string, message: string): AxiosError {
  const response = {
    status,
    statusText: "",
    data: { error: { code, message } },
    headers: {},
    config: {},
  } as unknown as AxiosResponse;

  return new AxiosError(message, code, undefined, undefined, response);
}
