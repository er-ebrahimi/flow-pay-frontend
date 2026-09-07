<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# flow-pay-frontend

Next.js 16.3.4 (App Router, Turbopack) + React 19 + Tailwind v4 + shadcn/ui (base-nova) + TanStack Query v5.

## Commands

- `npm run dev` / `npm run build` / `npm run start` / `npm run lint` (lint is bare `eslint`)
- No test framework configured — verification is `npm run lint` + `npm run build`; build also type-checks
- Fast typecheck without a build: `npx tsc --noEmit`

## Structure & conventions

- No `src/` — `app/`, `components/`, `lib/` live at the root; the `@/*` alias maps to the repo root
- shadcn/ui v4 here is built on **Base UI** (`@base-ui/react`), not Radix, and `cn` comes from the standalone `cn` package (`@/lib/utils` re-exports it). Add components with `npx shadcn@latest add <name>` — don't hand-write files in `components/ui/`
- Tailwind v4 is CSS-first: theme tokens live in the `@theme inline` block and CSS variables in `app/globals.css`; there is no `tailwind.config`. Dark mode is the `.dark` class variant (`@custom-variant dark`)
- Icons come from `lucide-react`

## Generated types & files

- `LayoutProps`, `PageProps`, and route param types are generated into `.next/types` / `.next/dev/types` — after a fresh clone or route changes they resolve once `npm run dev` or `npm run build` has run ("Generating route types...")
- `next dev` re-upserts the managed block above between its BEGIN/END markers and preserves content outside them — keep custom edits outside the markers. `CLAUDE.md` is only a pointer (`@AGENTS.md`)

## Data fetching

- The TanStack Query provider is `app/providers.tsx`: it creates a new `QueryClient` per server render and reuses a browser singleton. Follow that pattern when adding context providers — a module-level `new QueryClient()` leaks cache across server requests
- Server/Query interop (hydration boundaries, optimistic updates, `use cache` coordination) is documented in `node_modules/next/dist/docs/01-app/02-guides/client-side-data-fetching/tanstack-query.md`
- `@tanstack/eslint-plugin-query` is active in `eslint.config.mjs`
