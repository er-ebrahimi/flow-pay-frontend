# Developing a Page — States & Loading Guide

Every page has four states to handle: **loading**, **error**, **empty**, and
**busy actions**. Use the shared components below — never hand-roll a
spinner, a red text, or an empty message.

## 1. Error state → `ErrorState`

`src/components/ui/error-state.tsx`

Status-aware destructive Alert. Maps HTTP status codes to the right message
automatically:

| HTTP status | Translation key used |
|---|---|
| 401 | `errors.unauthorized` |
| 403 | `errors.forbidden` |
| 404 | `errors.notFound` |
| 500 | `errors.serverError` |
| anything else | your `descriptionKey` fallback |

```tsx
import { ErrorState } from "@/components/ui/error-state";

if (error) {
  logger.error({ err: error }, "Failed to load data");
  return (
    <AdminPageLayout header={/* your header */}>
      <ErrorState
        error={error}
        titleKey="questioner.errorTitle"
        descriptionKey="questioner.errorDescription" // fallback key
      />
    </AdminPageLayout>
  );
}
```

Rules:
- Keep `logger.error(...)` at the call site with a page-specific message.
- `ErrorState` only renders the alert box — the page layout stays outside.
- Translations must exist in both `messages/en.json` and `messages/fa.json`.

## 2. Loading state → `Loading` or `Skeleton`

Two options, depending on how much UI you can mirror:

### Full-page / section loading → `Loading`

`src/components/ui/loading.tsx` — animated ring with optional label.

```tsx
import { Loading } from "@/components/ui/loading";

if (isLoading) {
  return (
    <AdminPageLayout>
      <Loading label={t("loading")} size="md" />
    </AdminPageLayout>
  );
}
```

Props: `label?`, `size` (`sm` | `md` | `lg`), `fullHeight?`, `className?`.
Renders `role="status"` + `aria-label` for accessibility.

### Content-shaped loading → `Skeleton`

`src/components/ui/skeleton.tsx` — pulse placeholder, best when you can
mirror the final layout (prevents layout shift):

```tsx
import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard() {
  return (
    <Card>
      <section className="relative w-30 shrink-0 bg-muted animate-pulse" />
      <CardContent className="flex-1 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );
}

if (isLoading) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
```

Pick `Loading` for spinners, `Skeleton` for content-shaped placeholders.
(Reference: `SkeletonCard` in `src/app/[locale]/admin/questioner/page.tsx`.)

## 3. Empty state → `EmptyState`

`src/components/ui/empty-state.tsx`

```tsx
import { EmptyState } from "@/components/ui/empty-state";

{items.length === 0 ? (
  <EmptyState messageKey="questioner.noQuestions" />
) : (
  /* the actual list */
)}
```

Props: `messageKey` (translated via `useTranslations`), `className?`.

## 4. Busy buttons → `Button loading` prop

`src/components/ui/button.tsx` — the shadcn `Button` has a built-in
`loading` prop: shows the spinner, disables the button.

```tsx
<Button
  variant="destructive"
  loading={deleteQuestioner.isPending}
  disabled={updateQuestioner.isPending}
>
  <Trash2 />
  {deleteQuestioner.isPending ? t("loading") : t("delete")}
</Button>
```

Rules:
- Pass `loading={mutation.isPending}` and keep the children as-is (spinner
  is prepended automatically).
- For icon-only buttons, hide the icon while pending so only the spinner
  shows: `{pending ? null : <Icon />}`.
- Radix-based actions that are not `Button` (e.g. `AlertDialogAction`) have
  no `loading` prop — use the `Loader2` + `animate-spin` inline pattern
  there:
  ```tsx
  {isPending ? (
    <>
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {t("loading")}
    </>
  ) : (
    t("deleteConfirm")
  )}
  ```
- `loading` also implies `disabled` (`disabled={disabled ?? loading}`), so
  an explicit `disabled={false}` can re-enable it if ever needed.

## 5. Server-side initial data → `withInitialData`

`src/features/auth/server/with-initial-data.ts` (exported from
`@/features/auth/server`)

Server components that want to hydrate a client `useQuery` with
`initialData` must **not** fetch headers, redirect, or try/catch manually.
The wrapper does all of it:

```ts
import { withInitialData } from "@/features/auth/server";
import { userListList } from "@/lib/api/user";
import { PAGE_SIZE, UsersTable } from "@/features/users";

export default async function AdminUsersPage({ params }) {
  const { locale } = await params;
  const initialData = await withInitialData({
    locale,
    logMessage: "Failed to load users (server)",
    loader: () => userListList({ page: 1, page_size: PAGE_SIZE }),
  });
  return <UsersTable initialData={initialData} />;
}
```

What it does for you:

- **Redirects** to the localized login page when there is no session.
- **Logs** loader failures via `logger.error` with your `logMessage` and
  returns `undefined` (the client then renders its own error state).
- **Auth is automatic**: the axios request interceptor resolves the Bearer
  token server-side through the provider registered by the auth feature
  (`getServerSession` under the hood). Never pass `axiosConfig: { headers }`
  from a page again.

Rules:

- The `loader` receives no headers — the interceptor handles auth.
- Only import it from server components; it is `server-only`.
- The login route handler also registers the provider, so login API calls
  work without a session (they simply go out unauthenticated).

## Checklist for a new page

- [ ] `isLoading` → `Loading` or `Skeleton` (mirror final layout)
- [ ] `error` → `ErrorState` (log first, status-aware description)
- [ ] empty collection → `EmptyState`
- [ ] mutation buttons → `loading={...isPending}`
- [ ] server component with SSR data → `withInitialData` (no manual headers/redirect)
- [ ] all keys added to `messages/en.json` **and** `messages/fa.json`
- [ ] jest test if you touched a shared `src/components/ui/*` component
