<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# flow-pay-frontend

Next.js 16.3.4 (App Router, Turbopack) + React 19 + Tailwind v4 + shadcn/ui (base-nova) + TanStack Query v5 + NextAuth v4 + axios. Backend contract: `docs/API_CONTRACT.md`.

## Required docs (mandatory)

Read the relevant doc before working in its area — these are not optional:

- `docs/FILE_MANAGEMENT.md` — folder boundaries, file ownership, where every file type goes. Read before creating any file or folder
- `docs/PAGE_DEVELOPMENT.md` — page states (loading / error / empty / busy) and the shared components to use. Read before building or modifying any page
- `docs/API_MUTATIONS_AND_TOASTS.md` — every mutation goes through `useApiMutation` with unified toast/error handling; the transport layer never toasts. Read before writing any mutation or API call
- `docs/TEST.md` — testing standards (test pyramid, what/how to test). Read before writing tests
- `docs/CODE_REVIEW_GUIDE.md` — review standard for changes. Read before reviewing or self-reviewing a diff

## Commands

- `npm run dev` / `npm run build` / `npm run start` / `npm run lint` (lint is bare `eslint`)
- `npm test` (Vitest, runs all `__tests__/**/*.test.{ts,tsx}`) / `npm run test:watch`
- Verification order: `npm test` → `npm run lint` → `npm run build` (build also type-checks)
- Fast typecheck without a build: `npx tsc --noEmit`

## Structure & conventions

- No `src/` — code lives at the repo root and the `@/*` alias maps there. The docs consistently write `src/...` paths; map them to root dirs: `src/lib` → `lib/`, `src/hooks` → `hooks/`, `src/features` → `features/`, `src/components` → `components/`, `src/types` → `types/`
- Transport layer: `lib/axios.ts` (Bearer attach + 401→`/login` redirect, **never toasts** — pinned by `lib/__tests__/axios.test.ts`), `lib/logger.ts` (pino + `getErrorMessage`/`getErrorCode` reading the `{ error: { code, message } }` envelope), `lib/toast.ts` (sonner helpers — the only place sonner may be imported), `hooks/use-api-mutation.ts` (every mutation must go through it)
- Auth is NextAuth v4 (JWT strategy): `features/auth/server/` owns `authOptions`; the login response's `accessToken` is exposed as `session.user.access`. The backend contract has **no refresh token** — expiry means the 401 redirect to `/login`. `NEXTAUTH_SECRET` is required in production (dev falls back); login page is `/login` and honors a same-origin `callbackUrl`
- shadcn/ui v4 here is built on **Base UI** (`@base-ui/react`), not Radix, and `cn` comes from the standalone `cn` package (`@/lib/utils` re-exports it). Add components with `npx shadcn@latest add <name>` — don't hand-write files in `components/ui/`. `Button` has a custom `loading` prop (spinner + disabled) that the stock Base UI button lacks
- Tailwind v4 is CSS-first: theme tokens live in the `@theme inline` block and CSS variables in `app/globals.css`; there is no `tailwind.config`. Dark mode is the `.dark` class variant (`@custom-variant dark`)
- Icons come from `lucide-react`

## Generated types & files

- `LayoutProps`, `PageProps`, and route param types are generated into `.next/types` / `.next/dev/types` — after a fresh clone or route changes they resolve once `npm run dev` or `npm run build` has run ("Generating route types...")
- `next dev` re-upserts the managed block above between its BEGIN/END markers and preserves content outside them — keep custom edits outside the markers. `CLAUDE.md` is only a pointer (`@AGENTS.md`)

## Data fetching

- The TanStack Query provider is `app/providers.tsx`: it creates a new `QueryClient` per server render and reuses a browser singleton. Follow that pattern when adding context providers — a module-level `new QueryClient()` leaks cache across server requests
- `app/providers.tsx` also wires the global `mutationCache.onError` safety net (one error toast for bare `useMutation`s; skipped when `meta.toastHandled`), the sonner `<Toaster>`, and `NextAuthProvider`
- Query/mutation defaults (staleTime, retry policy incl. 410/422 skips) live in `lib/query-client.ts` — change defaults there, not in `providers.tsx`
- Server/Query interop (hydration boundaries, optimistic updates, `use cache` coordination) is documented in `node_modules/next/dist/docs/01-app/02-guides/client-side-data-fetching/tanstack-query.md`
- `@tanstack/eslint-plugin-query` is active in `eslint.config.mjs`
