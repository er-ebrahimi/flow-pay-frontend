// lib/axios.ts
//
// FlowPay transport layer. Rules (docs/API_MUTATIONS_AND_TOASTS.md, mandatory):
// - The transport NEVER toasts. Error feedback lives in useApiMutation and the
//   providers.tsx mutation safety net.
// - Attaches the NextAuth Bearer token to every API request.
// - On 401 in the browser, redirects to /login once (guarded), preserving the
//   current location as callbackUrl. The /login page itself is exempt so a
//   failed login POST (401 UNAUTHORIZED per API_CONTRACT.md) cannot loop.

import axios from "axios";
import { getSession } from "next-auth/react";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  // No withCredentials: auth is Bearer-only (docs/API_CONTRACT.md — the
  // session cookie belongs to the same-origin NextAuth route handler, never
  // to the backend). Non-credentialed CORS keeps the backend's allowlist
  // simple; adding cookies later means exact-origin + allow-credentials.
});

type ServerAuthProvider = () => Promise<{ Authorization: string } | null>

// Registered by the auth feature (features/auth/server) so the server bundle
// can attach the Bearer token without lib/ importing feature code. Kept in a
// module-level variable because Next.js bundles this module separately for
// server and client, so each runtime sees its own registration.
let serverAuthProvider: ServerAuthProvider | undefined

export function setServerAuthProvider(provider: ServerAuthProvider) {
  serverAuthProvider = provider
}

/** Server branch of the request interceptor: resolve credentials via the
 * provider registered by the auth feature (getServerSession under the hood). */
export function getServerRequestAuthHeaders(): Promise<{
  Authorization: string;
} | null> {
  return serverAuthProvider ? serverAuthProvider() : Promise.resolve(null)
}

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      // Centralized authorization: the session's accessToken from
      // POST /auth/login (docs/API_CONTRACT.md) is the Bearer credential for
      // API calls. Kept async because getSession() reads the session endpoint
      // which lags the signIn promise.
      const session = await getSession({ broadcast: false }).catch(() => null)
      const token = session?.user.access
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } else {
      // Server side: the interceptor can't read the browser session, so ask
      // the auth feature's provider (getServerSession) for the credentials.
      const headers = await getServerRequestAuthHeaders()
      if (headers) {
        Object.assign(config.headers, headers)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const LOGIN_PATH = '/login'

// Guards against a burst of parallel 401s (e.g. React Query firing several
// requests at once) each triggering a navigation. Cleared implicitly when the
// full-page navigation reloads this module.
let redirectToLoginInFlight = false

/**
 * Navigates to /login, preserving the current location as the callbackUrl so
 * the user lands back after signing in. No-op on the server, when already on
 * the login page, or mid-redirect. Returns true when a navigation was
 * triggered.
 */
export function redirectToLoginUrl(
  pathname: string,
  search: string,
  replaceLocation: (url: string) => void = (url) =>
    window.location.replace(url),
) {
  if (redirectToLoginInFlight) return false

  // Break redirect loops: the login page legitimately receives 401s from
  // POST /auth/login when credentials are wrong (API_CONTRACT.md).
  if (pathname.startsWith(LOGIN_PATH)) return false

  redirectToLoginInFlight = true
  const callbackUrl = `${pathname}${search}`
  replaceLocation(
    `${LOGIN_PATH}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
  )
  return true
}

/** Test-only: clears the one-shot redirect guard between test cases. */
export function resetUnauthorizedRedirect() {
  redirectToLoginInFlight = false
}

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    if (status === 401 && typeof window !== 'undefined') {
      // Session is no longer valid — send the user to login. Transport stays
      // silent: error feedback is the UI that follows the redirect.
      redirectToLoginUrl(window.location.pathname, window.location.search)
    }

    return Promise.reject(error)
  }
)
