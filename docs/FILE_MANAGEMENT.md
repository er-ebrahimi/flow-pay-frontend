# Project File Management Rules

This document defines how files are organized in this Next.js project.

Goals:

* Easy to navigate
* Easy to scale
* Clear ownership
* Enforced boundaries
* Minimal architectural overhead

---

## 1. Keep `app/` Focused on Routing

### Rule

`src/app/` should mainly contain Next.js routing and framework files:

```text
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts

sitemap.ts
robots.ts
manifest.ts
opengraph-image.tsx
```

These are supported Next.js file conventions.

Route-specific code may also live beside the route inside private folders:

```text
_components/
_hooks/
_lib/
```

### Why

`app/` should describe **where things are rendered**, not become the home of all business logic.

---

## 1.1 Proxy Boundary

### Rule

`src/proxy.ts` is for routing/request-boundary concerns only:

* Rewrites
* Redirects
* Routing decisions
* Request/response header injection

Next.js Proxy runs before routing and supports rewriting, redirecting, and modifying headers.

Do **not** put the following in `proxy.ts`:

```text
Authentication/session validation
Authorization logic
Database calls
Business logic
Stateful operations
Heavy data fetching
```

Although Next.js allows Proxy to perform optimistic authentication checks, this project intentionally keeps authorization out of Proxy and performs it in the server-side Data Access Layer instead.

Authentication and authorization checks should live in:

```text
features/auth/server/
```

Example:

```text
features/auth/server/
├── get-session.ts
├── require-user.ts
├── require-admin.ts
└── permissions.ts
```

Server Components, layouts, Server Actions, and other server code call this Data Access Layer.

### Why

Authentication and authorization must remain close to the data being protected.

Proxy should stay lightweight and focused on routing.

Next.js recommends centralizing authorization in a Data Access Layer.

---

## 2. Keep Route-Specific Code Close to the Route

### Rule

If code is used by only one route, keep it beside that route.

```text
app/[locale]/chat/
├── _components/
│   └── chat-view.tsx
├── _lib/
│   └── chat-filters.ts
└── page.tsx
```

### Why

Route-specific code does not need to become globally visible.

---

## 3. Business Logic Belongs in `features/`

### Rule

Business domains live under:

```text
src/features/<feature>/
```

Example:

```text
features/
├── auth/
├── chat/
├── questionnaire/
├── profile/
└── users/
```

### Why

A developer working on a domain should have one obvious place to look.

---

## 4. Features Own Their Code

### Rule

A feature may contain:

```text
features/questionnaire/
├── components/
├── api/
├── hooks/
├── server/
├── schemas/
├── lib/
├── types.ts
├── index.ts
└── __tests__/
```

Only create folders when needed.

### `components/`

Feature-specific UI.

```text
components/questionnaire-form.tsx
components/question-card.tsx
```

### `api/`

Client-side remote data access.

Contains:

* Fetch functions used by client code
* React Query queries
* React Query mutations
* Query options
* API-related hooks

Example:

```text
api/
├── get-questions.ts
├── use-questions.ts
└── use-submit-answer.ts
```

### `hooks/`

Feature hooks that are **not primarily API access**.

Example:

```text
hooks/
└── use-questionnaire-navigation.ts
```

### `server/`

Server-only feature code.

Contains:

* Server Actions
* Data Access Layer functions
* Server-side authorization
* Server-side data fetching
* Server-only utilities

Example:

```text
server/
├── get-questionnaire.ts
├── create-question.ts
└── permissions.ts
```

All files under `server/` must follow the server-only rule defined in **Section 13**.

### `schemas/`

Zod and validation schemas.

### `lib/`

Internal feature utilities.

### `types.ts`

Feature-specific types.

## For makeing desicion
Does this code belong to a domain such as
chat, auth, users, questionnaire, profile?

YES
→ features/<domain>/

NO — it only exists to implement this specific route,
URL, layout, search params, or page composition
→ app/.../_components, _hooks, _lib

### Why

A feature should contain the code required to understand and maintain that domain.

---

## 5. `components/ui/` Contains Generic UI Only

### Rule

`components/ui/` contains reusable components with no business knowledge.

```text
components/ui/
├── button.tsx
├── dialog.tsx
├── input.tsx
├── select.tsx
└── table.tsx
```

### Good

```tsx
<Button>Delete</Button>
```

### Bad

```text
components/ui/delete-user-button.tsx
```

That belongs in:

```text
features/users/components/delete-user-button.tsx
```

### Why

Generic UI should be usable by every feature.

---

## 6. Shared Components Must Be Truly Shared

### Rule

Use `src/components/` for reusable application-level systems.

```text
components/
├── ui/
├── ai-elements/
├── forms/
└── layout/
```

### Why

Reusable UI systems should not belong to a specific business feature.

---

## 7. `lib/` Is for Infrastructure

### Rule

`src/lib/` contains shared technical infrastructure.

```text
lib/
├── api/
│   ├── api-client.ts
│   └── axios.ts
├── query/
│   └── query-client.ts
├── logger.ts
├── image-url.ts
├── toast.ts
└── utils.ts
```

### Do not put feature logic here

Bad:

```text
lib/questionnaire-utils.ts
lib/chat-state.ts
lib/user-permissions.ts
```

Prefer:

```text
features/questionnaire/lib/
features/chat/lib/
features/users/lib/
```

### Why

`lib/` must not become a dumping ground for unrelated TypeScript files.

---

## 8. Application Configuration Belongs in `config/`

### Rule

Application-level static configuration belongs in:

```text
src/config/
```

Example:

```text
config/
├── routes.ts
├── navigation.ts
└── site.ts
```

### Why

Configuration is neither business logic nor infrastructure.

---

## 9. i18n Code Stays Together

### Rule

Locale and translation infrastructure belongs inside:

```text
src/i18n/
```

Example:

```text
i18n/
├── request.ts
├── routing.ts
├── languages.ts
└── translations.ts
```

### Why

Internationalization should have one clear owner.

---

## 10. Do Not Modify Generated Code

### Rule

Generated API code stays inside:

```text
src/generated/
```

Do not manually edit or reorganize generated files.

### Why

Generated files may be overwritten when the API client is regenerated.

Application-specific behavior should wrap generated code.

Example:

```text
generated/
        ↓
features/questionnaire/api/
        ↓
feature components
```

---

## 11. Avoid Global Dumping Grounds

### Rule

Avoid growing global folders such as:

```text
hooks/
services/
helpers/
types/
utils/
```

when the code belongs to a feature.

### Bad

```text
hooks/
├── use-users.ts
├── use-chat.ts
└── use-questionnaire.ts
```

### Good

```text
features/users/hooks/use-users.ts
features/chat/hooks/use-chat.ts
features/questionnaire/hooks/use-questionnaire.ts
```

### Why

Organizing by ownership scales better than organizing only by file type.

---

## 12. Global `types/` Is Only for Global Types

### Rule

`src/types/` contains genuinely global TypeScript declarations.

Example:

```text
types/
├── css.d.ts
└── next-auth.d.ts
```

Feature types stay inside their feature:

```text
features/users/types.ts
features/questionnaire/types.ts
```

### Why

Domain types should stay with the domain that owns them.

---

## 13. Server-Only Code Must Be Build-Enforced

### Rule

Every server-only module must use:

```ts
import "server-only";
```

Next.js recommends `server-only` for modules that must never enter the client module graph.

For normal server modules:

```ts
import "server-only";

export async function getCurrentUser() {
  // ...
}
```

For Server Action files:

```ts
"use server";

import "server-only";

export async function updateUser() {
  // ...
}
```

`"use server"` must appear before imports in a Server Action module.

### Required location

Feature-specific server code belongs in:

```text
features/<feature>/server/
```

Example:

```text
features/auth/server/
├── get-session.ts
├── require-user.ts
└── permissions.ts
```

Every file inside this folder must include:

```ts
import "server-only";
```

For Server Action modules, put `"use server"` first.

### Why

The server/client boundary should be enforced by the build system, not only by developer discipline.

---

## 14. Tests Stay Close to the Code They Test

### Rule

Prefer colocated tests.

```text
features/users/
├── components/
│   └── user-edit-dialog.tsx
└── __tests__/
    └── user-edit-dialog.test.tsx
```

Route tests may stay beside routes:

```text
app/[locale]/chat/
├── __tests__/
│   └── page.test.tsx
└── page.tsx
```

### Why

Tests are easier to discover and maintain when close to their implementation.

---

## 15. Use Consistent File Naming

### Rule

Use `kebab-case`.

### Good

```text
user-edit-dialog.tsx
use-questionnaire.ts
multi-step-form.tsx
api-client.ts
```

### Avoid

```text
UserEditDialog.tsx
useMultiStepForm.ts
QuestionnaireUtils.ts
```

### Why

Consistent naming improves navigation and searchability.

---

## 16. Do Not Create Folders Before They Are Needed

### Rule

A feature may start small:

```text
features/users/
└── user-form.tsx
```

Only organize further when complexity exists:

```text
features/users/
├── components/
├── api/
├── hooks/
└── schemas/
```

### Why

Architecture should manage complexity, not manufacture it.

---

## 17. Promote Code Only When Necessary

### Rule

Code moves outward as its reuse grows:

```text
Route-specific
      ↓
Feature-specific
      ↓
Shared
```

Used by one route:

```text
app/users/_components/user-stats.tsx
```

Used throughout the users domain:

```text
features/users/components/user-stats.tsx
```

Generic across the application:

```text
components/ui/stat-card.tsx
```

### Why

This prevents premature abstractions and unnecessary shared code.

---

## 18. Import Direction and Feature Boundaries

### Rule

Use this dependency direction:

```text
app
 ↓
features
 ↓
components / lib / config
```

Shared layers must never depend on business features.

---

### Feature Public API (index.ts)

Every sufficiently large feature should expose a root public API (index.ts):

```text
features/users/
├── components/
├── api/
├── hooks/
├── server/
└── index.ts
```

Example:

```ts
// features/users/index.ts

export { UserEditDialog } from "./components/user-edit-dialog";
export { useUsers } from "./api/use-users";
export type { User } from "./types";
```

Consumers outside the feature import from:

```ts
import {
  UserEditDialog,
  useUsers,
} from "@/features/users";
```

Do not create nested barrel files everywhere.

Use one root `index.ts` as the feature's public client-safe API.

---

### Server Public API (index.ts)

Server-only exports must **not** be exported from the root feature `index.ts`.

Instead use:

```text
features/auth/server/
├── index.ts
├── get-session.ts
└── require-user.ts
```

Example:

```ts
// features/auth/server/index.ts

import "server-only";

export { getSession } from "./get-session";
export { requireUser } from "./require-user";
```

Server consumers use:

```ts
import { requireUser } from "@/features/auth/server";
```

### Why

This prevents server-only code from accidentally becoming reachable through client imports.

---

### Cross-Feature Imports

#### Rule

Features **may import another feature**, but only through that feature's public API (index.ts).

Allowed:

```ts
import { CurrentUser } from "@/features/auth";
```

Server-side:

```ts
import { requireUser } from "@/features/auth/server";
```

Not allowed:

```ts
import { requireUser } from "@/features/auth/server/require-user";

import { LoginForm } from "@/features/auth/components/login-form";
```

A feature must never reach directly into another feature's internals.

### Why

Cross-feature dependencies sometimes make sense, but deep imports create tight coupling.

The public API (index.ts) gives each feature control over what other parts of the application can depend on.

---

### Inside the Same Feature

Deep imports are allowed internally.

Example:

```ts
// features/users/components/user-form.tsx

import { userSchema } from "../schemas/user-schema";
```

### Why

The public API (index.ts) exists for **external consumers**, not internal feature organization.

---

### Avoid Circular Feature Dependencies

Do not create:

```text
auth → users
users → auth
```

If two features require the same generic functionality, move that functionality to an appropriate shared layer.

Example:

```text
features/auth ─────┐
                   ↓
                  lib
                   ↑
features/users ────┘
```

---

### Enforce the Boundary

These rules must be enforced by ESLint, not only documented.

Use one of:

```text
eslint-plugin-boundaries
```

or:

```text
import/no-restricted-paths
```

Enforce at minimum:

```text
components → cannot import features

lib → cannot import features

config → cannot import features

feature A → cannot deep-import feature B

feature A → may import feature B public API (index.ts)
```

### Why

Architecture rules that are not machine-enforced eventually become optional.

---

# Project Structure

```text
src/
├── app/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── api/
│   │   ├── server/
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── chat/
│   ├── questionnaire/
│   ├── profile/
│   └── users/
│
├── components/
│   ├── ui/
│   ├── ai-elements/
│   ├── forms/
│   └── layout/
│
├── lib/
│   ├── api/
│   └── query/
│
├── config/
├── generated/
├── i18n/
├── types/
└── proxy.ts
```

# File Placement Decision

Before creating a file, ask:

1. **Used by only one route?**
   → Put it beside the route.

2. **Belongs to a business domain?**
   → Put it in `features/<feature>`.

3. **Generic reusable UI?**
   → Put it in `components/`.

4. **Technical infrastructure?**
   → Put it in `lib/`.

5. **Application configuration?**
   → Put it in `config/`.

6. **Server-only feature code?**
   → Put it in `features/<feature>/server/` and use `server-only`.

7. **Generated code?**
   → Keep it in `generated/`.

8. **Importing another feature?**
   → Import only from that feature's public API (index.ts).

---

# Architecture Enforcement (ESLint)

The boundary rules in this document are enforced automatically by ESLint in `eslint.config.mjs` using `eslint-plugin-boundaries` (rules `boundaries/dependencies`) plus one local rule (`local/require-server-only`, defined in `eslint/rules/require-server-only.mjs`).

## Elements

The `settings["boundaries/elements"]` block classifies every file into one element type:

| Element | Path | Notes |
|---|---|---|
| `route-private` | `src/app/**/_components`, `_hooks`, `_lib` | Captures the owning `route` (e.g. `[locale]/chat`); only that route may import it |
| `route` | `src/app/**` | Captures the `route` for same-route ownership checks |
| `ui` | `src/components/ui` | Must stay business-agnostic |
| `component` | `src/components/**` | Shared components |
| `lib` | `src/lib` | Shared infrastructure |
| `config` | `src/config` | Shared configuration |
| `feature` | `src/features/*` | Captures the feature name |
| `generated` | `src/generated` | Classified via `boundaries/files` (see below) |
| `i18n` | `src/i18n` | |
| `types` | `src/types` | |
| `hooks` | `src/hooks` | |

### Generated code and dotfiles

`src/generated` contains dot-prefixed files (`.client.ts`, `.queryOptions.ts`, `.schema.ts`). Glob matchers ignore leading dots, so these files are classified through the `settings["boundaries/files"]` block instead:

```text
category: "generated", pattern: ["src/generated/*.ts", "src/generated/**/.*"]
```

Policies that restrict access to generated code target `file.categories: "generated"`.

## Enforced rules

| # | Rule | Message prefix |
|---|---|---|
| 2 | `component` must not import `feature` or `route` | "Rule 2: Shared components must not import from features / app routes" |
| 3 | `feature` must not import `route` | "Rule 3: features must not import from app routes" |
| 5 | `ui` must not import `feature` or `route`; `route-private` may only be imported by its own route (same captured `route` value) | "Rule 5: Private route folders …" |
| 7 | `lib` must not import `feature` or `route` | "Rule 7: lib/ is shared infrastructure …" |
| 8 | `config` must not import `feature` or `route` | "Rule 8: config/ must not depend on …" |
| 10 | Only `feature` `api/` modules, `lib/api-client` (`lib/api-*`), `lib/admin-permissions`, and `types/` (type-only imports for global augmentations, e.g. `src/types/next-auth.d.ts` importing `Permission`) may import `generated`; all other elements (route, component, ui, config, route-private, feature non-`api/`) are forbidden from importing it | "Rule 10: Generated API code must be consumed through …" |
| 13 | Files under `features/*/server/**` must import `"server-only"` as their first import | "Rule 13: Files under features/*/server must import \"server-only\"" |
| 18 | `feature` may import another feature only through its public API (index.ts) (`index.*` or `server/index.*`); deep imports are forbidden | "Rule 18: Do not deep-import another feature …" |

Policies are evaluated in order and the first matching one decides the outcome, so `allow` exceptions are listed immediately after the `disallow` they override.

## Current status

The rules are enforced and the repository is compliant: `npm run lint` reports **zero** architecture errors (only the pre-existing baseline warnings remain).

Generated API code is consumed exclusively through the gateways in `src/lib/api/` (`auth.ts`, `user.ts`, `permission.ts`, `questioner.ts`, `chat.ts`) and `src/lib/api-routes.ts`, which are the only `lib/` modules allowed to touch `src/generated/*`. Shared components and app routes import from those gateways; never from `@/generated/*` directly.

