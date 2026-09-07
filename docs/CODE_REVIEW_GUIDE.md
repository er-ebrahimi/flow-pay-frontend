# Code Review Guide

This guide defines how developers and AI agents review changes in this Next.js project. It adapts Google's engineering practices to the rules already documented in this repository.

## 1. Review standard

The goal is to improve the codebase's overall health: correctness, security, readability, maintainability, testability, and consistency.

- Approve a change when it clearly improves code health and has no unresolved blocking issue. Do not demand perfection.
- Technical facts, project rules, tests, and measurable behavior take priority over personal preference.
- Keep each change focused on one self-contained purpose. Ask for unrelated refactors or generated changes to be split out.
- Review every changed, human-written line and enough surrounding code to understand its system impact.
- The author owns the implementation; the reviewer owns the quality of the approval.

## 2. Before requesting review

The author must:

- Provide a short summary of **what** changed and **why**.
- Describe user-visible behavior, risks, migrations, and important design decisions.
- Keep the change small; include related tests in the same change.
- Self-review the complete diff and remove debugging code, dead code, secrets, and unrelated formatting.
- Run the relevant checks and state their results:

```sh
npm run lint
npm test -- --runInBand
npm run build
```

Run the relevant Playwright mode for changed critical user flows. See `E2E_TESTING.md` for mocked and live modes.

## 3. Review order

Review in this order so major issues are found before line-level polish:

1. **Intent and scope** — Does the change solve the stated problem? Is it focused and appropriate for this project?
2. **Main design** — Inspect the primary files and data flow first. If the design is wrong, report it before reviewing minor details.
3. **Correctness and risk** — Trace success, failure, permissions, edge cases, state transitions, and user-visible behavior.
4. **Language and project rules** — Check the Google TypeScript Style Guide, architecture, shared components, API access, rendering, i18n, and mutation patterns.
5. **Tests and verification** — Confirm tests are useful and would fail if the behavior broke. Run safe checks when possible.
6. **Every changed file** — Review the remaining implementation, tests, configuration, and documentation.
7. **Decision** — Approve, comment, or request changes using the severity rules below.

If the change is too large to understand confidently, ask the author to split it. If specialist review is needed for security, accessibility, authorization, or i18n, say so explicitly.

## 4. TypeScript style guide — mandatory

Every changed `.ts` and `.tsx` file must follow the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html). Style review is not limited to formatting: it includes naming, module design, type safety, language features, comments, and documentation.

Apply rules in this order:

1. TypeScript, React, and Next.js framework requirements.
2. Enforced or documented project conventions.
3. The Google TypeScript Style Guide for everything not intentionally overridden above.

Known project/framework exceptions:

- Project filenames use `kebab-case`, not Google's `snake_case` convention.
- Next.js framework files such as `page.tsx`, `layout.tsx`, and `route.ts` follow Next.js naming and export requirements. Default exports are allowed where Next.js requires them; otherwise prefer named exports.
- Follow this project's `@/` aliases, feature public APIs, and import boundaries instead of replacing them with Google's relative-import preference.

Treat Google's **must/must not** rules as Required findings. Treat **should/prefer/avoid** rules as Suggestions unless the project enforces them or the issue creates a concrete correctness, safety, or maintainability risk.

For each TypeScript change, verify:

- Names are descriptive and use the correct casing: `UpperCamelCase` for types and React components, `lowerCamelCase` for variables/functions/properties, and `CONSTANT_CASE` only for module-level constants.
- Code uses ES modules, `const` by default, and `let` only for reassignment; it does not use `var`, TypeScript `namespace`, or `require`.
- Modules minimize their exported API, prefer named exports, and use `import type`/`export type` for type-only boundaries where required.
- Types are specific and readable. Avoid `any`; prefer `unknown` plus narrowing. Do not use primitive wrapper types such as `String`, `Boolean`, or `Number`.
- Type assertions (`as`), non-null assertions (`!`), double assertions, and compiler suppressions are not used merely to silence TypeScript. Any unavoidable unsafe boundary has a narrow scope and an explicit reason.
- Obvious types use inference; complex or public APIs use annotations when they improve clarity or protect the contract. Prefer the simplest type construct over difficult mapped or conditional types.
- Object shapes normally use interfaces; unions, tuples, primitives, and derived types may use type aliases.
- Production code contains no `debugger`, `eval`, dynamic `Function` construction, prototype modification, or `const enum`.
- JSDoc documents exported APIs when their purpose or usage is not obvious. Implementation comments explain **why**, not what the code already says.
- The code passes the project's formatter, ESLint rules, TypeScript checking, tests, and build. Tooling passing does not replace the semantic style review above.

## 5. Project checklist

Apply only the sections relevant to the change.

### Correctness and user states

- Behavior matches the requirement and handles realistic edge cases.
- Pages handle loading, error, empty, success, and pending actions with the shared components from `PAGE_DEVELOPMENT.md`.
- Components with multiple render states follow `RENDER_STATE_PATTERN.md`: one shared wrapper, one `content` variable, and flat mutually exclusive branches.
- Errors are logged with useful context; user feedback does not expose sensitive information.
- User-facing text has multi languages.
- Navigation paths come from `src/config/routes.ts`; API paths remain in the API layer.
- UI changes are responsive, keyboard-usable, and use appropriate labels, roles, focus behavior, and RTL behavior.

### Next.js architecture and ownership

- `src/app/` remains focused on routing and page composition.
- Route-only code stays beside its route; business code belongs to `src/features/<feature>`; generic UI belongs to `src/components`.
- Shared layers do not import business features. Cross-feature imports use the other feature's public `index.ts` or `server/index.ts`.
- Server-only feature code is under `features/<feature>/server/` and imports `"server-only"`; server exports are not exposed through a client-safe root index.
- `src/proxy.ts` contains routing-boundary concerns, not database calls, heavy fetching, or business logic.
- Files use `kebab-case`; components use `PascalCase`. Avoid new global dumping grounds and premature folders or abstractions.

### Reuse, API access, and mutations

- Existing UI and systems in `REUSABLE_COMPONENTS.md` are reused before new components are created.
- New generic UI has no business knowledge and includes a colocated Jest test.
- Generated API files are neither edited nor imported outside approved gateways. Regenerate them after schema changes.
- Standard mutations use `useApiMutation`, translated messages, correct invalidation keys, and `isPending` for busy controls.
- Axios never shows toasts; mutation code does not call Sonner directly; query errors render `ErrorState` instead of producing refetch toasts.
- A deliberately toast-less bare mutation sets `meta: { toastHandled: true }`.
- Destructive actions use the shared confirmation UI and prevent duplicate submission.

### Tests and documentation

- Tests cover behavior and public outcomes, not implementation details.
- A changed test would fail if the production behavior were broken; assertions are specific and meaningful.
- Include success, error, empty, permission/authentication, validation, and retry cases when relevant.
- Use unit/component tests for local logic and UI states; use E2E tests for critical cross-layer user journeys.
- Tests are deterministic, isolated, and colocated according to `FILE_MANAGEMENT.md`.
- API payloads, authorization behavior, query invalidation, navigation, and translations are verified where relevant.
- Documentation is updated when contracts, architecture, setup, or user behavior changes.

## 6. Comment severity and decisions

| Label | Meaning | Blocks approval? |
| --- | --- | --- |
| **Blocker** | Security/privacy risk, data loss, broken auth, build failure, crash, or severe production regression | Yes |
| **Required** | Correctness bug, violated project rule, missing essential state/test, or material maintainability problem | Yes |
| **Suggestion** | Valuable improvement that is not required for this change | No |
| **Nit** | Minor naming, wording, or formatting polish not enforced by project tooling | No |
| **Question** | Clarification needed; state explicitly whether the answer could become blocking | Not by itself |

Decision rules:

- **Request changes** when any Blocker or Required finding remains.
- **Approve with comments** when only Suggestions, Nits, or clearly non-blocking Questions remain.
- **Approve** when the change improves code health and verification is sufficient.
- Never block solely on a personal style preference. Let formatters, linters, TypeScript, and documented conventions own mechanical style.

## 7. Writing useful comments

Comment on the code, not the author. Explain the consequence and the reason, then provide direction without unnecessarily designing the whole solution.

Use this format:

```text
[Required] `path/to/file.tsx:42`

This mutation bypasses `useApiMutation`, so it can skip the project's logging,
invalidation, and toast handling. Please use the shared hook, or document why
this is an intentional toast-less exception and set `meta.toastHandled`.
```

A useful finding contains:

- A severity label and precise file/line.
- The observable problem, not vague dislike.
- Why it matters: user impact, failure mode, or violated project rule.
- A practical direction or question.

Avoid:

- “This is bad,” “Why did you do this?”, or comments about the developer.
- Unsupported speculation and generic best-practice claims.
- Repeating formatter/linter output unless it blocks the change.
- Asking for unrelated cleanup. Record it separately when worthwhile.
- Leaving important explanations only in the review thread; improve the code or documentation for future readers.

## 8. AI reviewer contract

When an AI agent is asked to **review**, it must diagnose and report; it must not edit code unless explicitly asked to fix it.

The agent must:

1. Read the change description, diff, affected files, relevant tests, and applicable project documents.
2. Use repository rules and evidence from the actual code. If documents conflict, do not guess: prefer machine-enforced/current code behavior and report the documentation mismatch.
3. Review only issues introduced or materially exposed by the change. Do not bury useful findings under unrelated legacy problems.
4. Trace callers and consumers when needed to prove impact. Do not report a hypothetical issue without a realistic failure path.
5. Check tests as carefully as production code and run safe, relevant verification when available.
6. Report findings first, sorted by severity. Each finding must be actionable and cite a precise file/line.
7. State the final decision and any residual risk or unverified area. If there are no findings, say **“No blocking findings”** rather than inventing issues.

Required AI output:

```markdown
## Findings

1. [Required] `path/file.ts:42` — Short title
   Explain the failure, its impact, and the required direction.

## Decision

Approve | Approve with comments | Request changes

## Verification

- Checks run and results
- Checks not run and why

## Residual risks

- Unverified behavior, or “None identified”
```

## 9. Response time

Review at the next natural break in focused work. Give the first useful response within one business day. If a full review will take longer, quickly state when it can be completed or ask for a smaller change/another qualified reviewer.

## 10. Source documents

Project rules:

- `FILE_MANAGEMENT.md`
- `PAGE_DEVELOPMENT.md`
- `RENDER_STATE_PATTERN.md`
- `REUSABLE_COMPONENTS.md`
- `API_MUTATIONS_AND_TOASTS.md`
- `E2E_TESTING.md`
- `MULTI_STEP_FORM_SYSTEM.md`
- `QUESTIONNAIRE.md`
- `rules.md`

External foundation:

- [Google: The Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html)
- [Google: What to Look For in a Code Review](https://google.github.io/eng-practices/review/reviewer/looking-for.html)
- [Google: Navigating a Change in Review](https://google.github.io/eng-practices/review/reviewer/navigate.html)
- [Google: How to Write Code Review Comments](https://google.github.io/eng-practices/review/reviewer/comments.html)
- [Google: Small Changes](https://google.github.io/eng-practices/review/developer/small-cls.html)
- [Google: Writing Good Change Descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
