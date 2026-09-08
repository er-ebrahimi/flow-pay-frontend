# FlowPay Frontend

A multi-currency wallet and exchange web app — dashboard, per-currency wallets, transaction history, and a two-step quote-then-confirm exchange flow — built on Next.js 16 (App Router, Turbopack).

## Features

| Feature | Description |
|---|---|
| Dashboard | Real wallet balances, session greeting, logout |
| Currency wallets | Balance, transaction count, and creation date per currency |
| Transaction history | Filterable list with detail view (compact on mobile, table-like rows on desktop) |
| Exchange flow | Source → target → amount (live rate, precision clamp, balance pre-check) → review with a 60-second locked quote → confirm |
| Responsive shell | Bottom tab bar on mobile/tablet, sidebar rail on desktop (`lg+`) |
| Auth | Email/password register and login (NextAuth, JWT strategy), server-side route guard, session-expiry redirect |

## Tech Stack

- [Next.js](https://nextjs.org) 16 — App Router, Turbopack, generated route types
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) v4 (CSS-first theming, oklch tokens) + shadcn/ui on [Base UI](https://base-ui.com)
- [TanStack Query](https://tanstack.com/query) v5 — all server state, unified mutation/toast handling
- [NextAuth](https://next-auth.js.org) v4 — JWT sessions, credentials provider
- [axios](https://axios-http.com) transport with Bearer attach + 401 → `/login` redirect
- [Vitest](https://vitest.dev) + React Testing Library — 96 tests, unit → integration pyramid

## Prerequisites

- Node.js **>= 20.9** (Next.js 16 requirement)
- npm
- The FlowPay backend running on `http://localhost:3000` ([Swagger UI](http://localhost:3000/docs#/))

## Getting Started

```bash
# 1. Install
npm install

# 2. Configure environment (see table below)
#    Create .env.local with the values from "Environment" — it is gitignored.

# 3. Run the dev server on port 3001 (the backend owns 3000)
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001). Register an account, sign in, and the dashboard shows your real wallet balances.

## Environment

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes (dev) | `"/api"` | Backend origin, e.g. `http://localhost:3000`. Requests are Bearer-only (no cookies), so the backend CORS allowlist needs the frontend origin, methods GET/POST, headers `Authorization, Content-Type`. |
| `NEXTAUTH_URL` | yes | — | Absolute frontend origin (e.g. `http://localhost:3001`). |
| `NEXTAUTH_SECRET` | production | dev fallback | Signs the JWT session cookie. |

`.env*` files are gitignored — never commit them.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (add `-- -p 3001` beside the backend) |
| `npm run build` | Production build — also type-checks and regenerates route types |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (includes TanStack Query + architecture boundary rules) |
| `npm test` | Vitest, all `__tests__/**/*.test.{ts,tsx}` |
| `npm run test:watch` | Vitest in watch mode |

## Backend Integration Status

The transport speaks the contract in [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md): every error is `{ "error": { "code", "message" } }`, the transport never toasts, mutations go through a single hook, and 401 redirects to `/login` once (guarded).

**Live (real HTTP calls):**

| Endpoint | Used by |
|---|---|
| `POST /auth/register` | Register form |
| `POST /auth/login` | NextAuth credentials provider |
| `POST /auth/logout` | Dashboard header sign-out |
| `GET /currencies` (+`?exclude=`) | Exchange source/target lists |
| `GET /wallets`, `GET /wallets/:code` | Dashboard rail, currency history |

**Mocked (endpoints not shipped yet — each mock module carries the exact one-line axios swap):**

| Endpoint | UI it feeds |
|---|---|
| `GET /dashboard` | (dashboard uses real `/wallets` + honest placeholders instead) |
| `GET /transactions`, `GET /transactions/:id` | History + detail pages |
| `GET /exchange-rates` | Live rate display, amount preview |
| `POST /exchange-quotes`, `POST /exchanges` | Review + confirm flow (Idempotency-Key header already wired) |

## Project Structure

```
app/            Routing only — (auth) and (app) route groups, layouts, guards
features/       Business domains, each with a public index.ts API
  auth/         Register/login forms, logout mutation, server session guard
  dashboard/    Dashboard composition (real wallets, honest gaps)
  wallets/      Wallet list/detail + cards
  transactions/ List/detail rows, status badges, filters
  exchange/     Currencies, rates, quotes, confirm (types + amount lib)
components/     Generic UI (shadcn-based) + layout (nav shell, page header)
lib/            axios transport, logger/error extraction, toast helpers, formatters
hooks/          useApiMutation — the single mutation entry point
docs/           Contracts, file-management rules, page states, testing standards
```

Dependency direction: `app → features → components/lib/config`. Cross-feature imports go through each feature's `index.ts`; ESLint enforces the boundaries.

## Testing

`npm test` runs the pyramid: pure-function units (money/precision formatting, error mapping), component tests (forms, rows, countdown), and integration tests (dashboard, wallet history, exchange review flow). External boundaries — axios and query hooks — are stubbed per test; the transport itself is pinned by regression tests (never toasts, always redirects on 401).

## Documentation

- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — endpoint + error-code contract
- [`docs/FILE_MANAGEMENT.md`](docs/FILE_MANAGEMENT.md) — folder boundaries and file placement rules
- [`docs/PAGE_DEVELOPMENT.md`](docs/PAGE_DEVELOPMENT.md) — the four page states (loading/error/empty/busy)
- [`docs/API_MUTATIONS_AND_TOASTS.md`](docs/API_MUTATIONS_AND_TOASTS.md) — the single mutation pipeline
- [`docs/TEST.md`](docs/TEST.md) — testing standards
- [`DESIGN.md`](DESIGN.md) — the visual design system (monochrome oklch palette, Geist type, component recipes)

## Contributing

Before submitting changes, run the verification order: `npm test` → `npm run lint` → `npm run build`. Follow the rules in `docs/FILE_MANAGEMENT.md` (kebab-case, feature ownership, public `index.ts` per feature) and `AGENTS.md` for conventions.

## License

Private project — all rights reserved. No license has been granted.
