# API Mutations & Toasts

Uniform error/success feedback for every API call. **Read this before writing any mutation.** Every mutation in the app must follow this structure — it is enforced by convention and pinned by tests.

## The Problem

Errors used to produce **two toasts**: the axios response interceptor toasted on every failed request (401/403/404/500/generic), and the mutation hook toasting its contextual message on top. The dedupe id existed but only half the callers used it, so error toasts stacked.

## Rules (non-negotiable)

1. **The transport layer never toasts.** `src/lib/axios.ts` only attaches auth/language, and redirects to login on 401. No toast calls — ever. Pinned by regression tests in `src/lib/__tests__/axios.test.ts`.
2. **Every mutation goes through `useApiMutation`** from `@/hooks/use-api-mutation`. It owns the toast, the `logger.error`, and the query invalidation — one implementation, uniform everywhere.
3. **Never call sonner directly** outside `src/lib/toast.ts`. Use the helpers below for non-mutation flows (auth forms, client-side validation).
4. **Query errors are page-level** (`ErrorState`), never toasts — refetches would spam.
5. **Intentionally toast-less mutations** (e.g. the questionnaire submit) opt out of the global fallback with `meta: { toastHandled: true }`.
6. **Every mutation invalidates every query key it affects** — missing invalidation is a bug, not a nit. See the checklist below.

## `useApiMutation` — the standard mutation hook

Location: `src/hooks/use-api-mutation.ts`

```ts
const deletePermission = useApiMutation({
  mutationFn: (id: number) => permissionDeleteDestroy({ id }),
  successMessage: t("deleteSuccess"),
  errorMessage: t("deleteError"),
  invalidate: [["permissionListList"]],   // query keys invalidated on success
  logError: "Failed to delete permission", // logger.error message
  onSuccess: () => setEditingPermission(null), // optional extra side effects
  onError: (error, variables) => { ... },      // optional
});
```

| Option | Type | Default | Purpose |
|---|---|---|---|
| `mutationFn` | `(variables) => Promise<TData>` | — | required; the API call |
| `successMessage` | `string` | — | required; toast text (translate via `useTranslations`) |
| `errorMessage` | `string` | — | required; fallback when the error has no extractable message |
| `invalidate?` | `ReadonlyArray<readonly unknown[]>` | `[]` | query keys to `invalidateQueries` on success |
| `logError?` | `string` | `"API mutation failed"` | message for `logger.error` |
| `onSuccess?` | `(data, variables, context) => void` | — | extra side effects after toast + invalidate |
| `onError?` | `(error, variables, context) => void` | — | extra side effects after toast + log |

Returns the standard `useMutation` result (`mutate`, `isPending`, …) — use `isPending` for busy buttons.

Behavior:
- **Success** → `showApiSuccessToast(successMessage)` → invalidate keys → `onSuccess`
- **Error** → `logger.error` → `showApiErrorToast(getErrorMessage(error, errorMessage))` → `onError`
- Sets `meta: { toastHandled: true }` so the global fallback stays silent.

## Invalidation checklist — the stale-cache footgun

This exact bug has been flagged repeatedly, so it's now a rule. **A mutation that writes data but doesn't invalidate the queries that read it leaves stale UI.** Do this on every mutation:

1. List every query key the mutation can change (list + detail keys of the same resource, counts, anything derived).
2. Pass them all in `invalidate`: `invalidate: [["questionsQuestionListList"], ["questionsQuestionShow", id]]`.
3. When in doubt, invalidate the key prefix — `invalidateQueries` matches partial keys, so `["questionsQuestionListList"]` is enough for a list.

Why navigation doesn't save you: list pages are mounted with `initialData` and a long `staleTime` (e.g. 60s in `QuestionerList`). After an edit round-trip the client cache is still "fresh", so the freshly-mounted list renders the **old** data from cache until `staleTime` expires — no refetch fires because the query never became stale. Only explicit invalidation (or a refetchOnMount override) fixes it.

Known history (don't repeat):
- `updateQuestioner` / `deleteQuestioner` skip `[["questionsQuestionListList"]]` → quick edit round-trips show stale question data. Flagged in `questioner-edit-form.tsx` (comments only; fix pending: add the invalidate keys).
- `createQuestioner` skips it too — the new item only appears after `staleTime` or a hard reload. Flagged in `create-questioner-form.tsx`.

## Toast helpers

Location: `src/lib/toast.ts`

| Export | Use for |
|---|---|
| `showApiErrorToast(message)` | error feedback. Uses the shared `API_ERROR_TOAST_ID` — error toasts **replace** each other, never stack. |
| `showApiSuccessToast(message)` | success feedback. |
| `API_ERROR_TOAST_ID` | only needed if you bypass the helpers (don't). |

Use these in non-mutation flows: auth form catch blocks, `FileUpload` rejection, etc.

## Safety net

`src/app/providers.tsx` configures a global `mutationCache.onError` that toasts **any** mutation error with `getErrorMessage(error, "Something went wrong")` (translated via `errors.somethingWentWrong`). It skips mutations with `meta.toastHandled` (all `useApiMutation` ones). Result: even a developer who writes a bare `useMutation` still gets an error toast — no silent failures, and never two toasts.

## Worked example — delete permission returns 400

1. Delete click → `permissionDeleteDestroy` → HTTP 400
2. axios interceptor: silent (transport never toasts)
3. `mutationCache.onError`: skipped (`meta.toastHandled`)
4. `useApiMutation` onError: `toast.error("Failed to delete the permission" | backend detail)`
5. User sees **exactly one toast**, contextual.

## Migration checklist

When touching code that predates this system:

- Plain `useMutation` with `toast`/`logger`/`invalidateQueries` boilerplate in `onSuccess`/`onError` → replace with `useApiMutation` and delete the boilerplate.
- `toast.error(...)`/`toast.success(...)` imports → replace with the helpers (or `useApiMutation` for mutations).
- A mutation that intentionally shows no toast → keep bare `useMutation` but add `meta: { toastHandled: true }`.
- Any toast found in `src/lib/axios.ts` → it's a regression; remove it.

## Tests

- `src/lib/__tests__/axios.test.ts` — pins that the interceptor never toasts (400/403/404/500/401) and still redirects on 401.
- `src/hooks/__tests__/use-api-mutation.test.tsx` — pins success/error toast, invalidation, and callbacks.
