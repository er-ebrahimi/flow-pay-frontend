# FlowPay — Design System

Extracted from source (`app/globals.css`, `app/layout.tsx`, `components/ui/*`, `app/login/page.tsx`). Canonical values are the oklch tokens in `globals.css`; hex values are computed equivalents for reference. Source of truth: `app/globals.css` — update there, not here.

---

## 1. Visual Theme & Atmosphere

FlowPay is a **monochrome financial utility**: near-zero chroma everywhere, precision over decoration. The visual language says "calculator, not casino."

- **Pure neutral core.** Every structural colour — background, surfaces, text, borders, even the chart ramp — is a grey with zero chroma. Colour is scarce, so it means something: **red is strictly errors/danger**, and one **blue accent** is the only chromatic brand colour in the system.
- **Flat but tactile.** Elevation is expressed with hairline borders (`shadow-sm` at most, on cards), not shadows. Interactions respond through a 3px soft focus ring and a subtle 1px press-down translate on buttons.
- **Compact density.** Controls are 32px tall by default, body text 14px. This is a data-heavy wallet/exchange UI, not a marketing site.
- **Dark mode is first-class.** Full parallel palette under the `.dark` class variant, driven by `next-themes`. Dark surfaces use alpha borders (white at 10–15%) rather than grey, keeping depth without adding hue.
- **Perceptual colour space.** All tokens are authored in oklch, so lightness steps are visually even — the grey ramp reads as deliberate, not accidental.

---

## 2. Colour Palette & Roles

### Semantic tokens (light / `.dark`)

| Role | Token | Light | Dark | Usage |
|---|---|---|---|---|
| Background | `--background` | `oklch(1 0 0)` ≈ `#FFFFFF` | `oklch(0.145 0 0)` ≈ `#0A0A0A` | Page background |
| Text primary | `--foreground` | `oklch(0.145 0 0)` ≈ `#0A0A0A` | `oklch(0.985 0 0)` ≈ `#FAFAFA` | Body/headings |
| Surface (card) | `--card` | `oklch(1 0 0)` ≈ `#FFFFFF` | `oklch(0.205 0 0)` ≈ `#171717` | Cards, popovers (`--popover` identical) |
| Surface muted | `--secondary` / `--muted` / `--accent` | `oklch(0.97 0 0)` ≈ `#F5F5F5` | `oklch(0.269 0 0)` ≈ `#262626` | Hover fills, secondary buttons, ghost hovers |
| Text secondary | `--muted-foreground` | `oklch(0.556 0 0)` ≈ `#737373` | `oklch(0.708 0 0)` ≈ `#A1A1A1` | Captions, descriptions, placeholders |
| Primary action | `--primary` | `oklch(0.205 0 0)` ≈ `#171717` | `oklch(0.922 0 0)` ≈ `#E5E5E5` | Primary buttons, active text |
| On-primary | `--primary-foreground` | `oklch(0.985 0 0)` ≈ `#FAFAFA` | `oklch(0.205 0 0)` ≈ `#171717` | Text on primary buttons |
| Border | `--border` | `oklch(0.922 0 0)` ≈ `#E5E5E5` | `oklch(1 0 0 / 10%)` white @ 10% | Card/input hairlines |
| Input border | `--input` | `oklch(0.922 0 0)` ≈ `#E5E5E5` | `oklch(1 0 0 / 15%)` white @ 15% | Input borders (dark: slightly brighter than `--border`) |
| Focus ring | `--ring` | `oklch(0.708 0 0)` ≈ `#A1A1A1` | `oklch(0.556 0 0)` ≈ `#737373` | Focus ring at 50% opacity |
| Destructive | `--destructive` | `oklch(0.577 0.245 27.325)` ≈ `#E7000B` | `oklch(0.704 0.191 22.216)` ≈ `#FF6467` | Errors only: destructive buttons, field errors, alerts |

### Data-viz ramp (monochrome, both modes)

`--chart-1` → `--chart-5`: `oklch(0.87 0 0)` ≈ `#D4D4D4`, `0.556` ≈ `#737373`, `0.439` ≈ `#525252`, `0.371` ≈ `#404040`, `0.269` ≈ `#262626`. A light-to-dark grey ramp for series differentiation by luminance, not hue.

### Brand accent

| Token | Value | Usage |
|---|---|---|
| `--sidebar-primary` (dark mode only) | `oklch(0.488 0.243 264.376)` ≈ `#1447E6` — a saturated royal blue | The **only chromatic brand colour** in the system. Currently scoped to the dark-theme sidebar. Reserve for brand moments / primary navigation highlights; do not spend it on generic UI. |

Light theme has no chromatic accent today — if the brand colour is adopted app-wide, define a light-mode counterpart rather than reusing the destructive red.

---

## 3. Typography

Two-voice system: **Geist Sans** for all UI and **Geist Mono** for data (amounts, IDs, codes). Loaded via `next/font/google` in `app/layout.tsx` as CSS variables `--font-geist-sans` / `--font-geist-mono`, mapped in `globals.css` `@theme inline`.

| Token | Family | Use |
|---|---|---|
| `--font-sans` / `--font-heading` | Geist Sans | UI text, headings — headings set `tracking-tight` |
| `--font-mono` | Geist Mono | Transaction IDs (`TXN-000001`), balances, rates — anything tabular |

### Scale (observed usage)

| Level | Classes | Notes |
|---|---|---|
| H1 (screen title) | `text-xl font-semibold tracking-tight` | 20px; the largest type in the system — deliberately quiet |
| Section/legend | `text-base font-medium` | 16px |
| Label / body | `text-sm font-medium` / `text-sm font-normal` | 14px; the workhorse |
| Caption / description | `text-sm font-normal text-muted-foreground` | 14px secondary voice |
| Micro | `text-xs` | 12px; xs buttons and fine print only |
| Inputs | `text-base` on mobile → `md:text-sm` | 16px prevents iOS zoom, 14px desktop |

Line-height is `leading-snug` inside fields, `leading-none` on labels. Body copy is never below 14px.

> **Wiring note:** the `next/font` variables (`--font-geist-sans` / `--font-geist-mono`) are mapped onto the theme tokens (`--font-sans`, `--font-heading`, `--font-mono`) in `globals.css` `@theme inline`. Changing the typeface means changing the `next/font` import in `app/layout.tsx` and keeping those mappings intact.

---

## 4. Component Styles

### Radius scale

`--radius: 0.625rem` (10px) with a stepped scale: `sm` 6px · `md` 8px · `lg` **10px (default control radius)** · `xl` 14px (cards) · `2xl` 18px · `3xl` 22px · `4xl` 26px. Controls are `rounded-lg`; cards `rounded-xl`.

### Buttons — `components/ui/button.tsx`

Built on Base UI (`@base-ui/react/button`) + CVA, with a custom `loading` prop (prepends a spinning `Loader2Icon`, disables the button).

- **Shape & size:** `h-8` (32px) default, `text-sm font-medium`, `rounded-lg` (10px), `gap-1.5` to icons. Sizes: `xs` h-6 · `sm` h-7 · default h-8 · `lg` h-9; icon buttons square (`size-8` and down).
- **Interaction:** focus = `border-ring` + `ring-3 ring-ring/50` (3px soft ring); active = `translate-y-px` press; disabled = 50% opacity, no pointer events; invalid = destructive border + tinted ring.
- **Variants:**
  - `default` — solid primary (near-black in light, near-white in dark); hover drops to 80% opacity. The monochrome inversion means the "filled button" flips between modes — intentional.
  - `outline` — hairline border on background; hover fills muted. Dark uses translucent input fill (`bg-input/30 → /50`).
  - `secondary` — muted solid; hover mixes in 5% foreground.
  - `ghost` — borderless; hover fills muted (dark: muted/50).
  - `destructive` — **tinted, not solid**: `bg-destructive/10` + `text-destructive`, hover /20 (dark /20 → /30). Danger reads as a wash, not a slab.
  - `link` — primary text, underline on hover, offset-4.
- **Icons inside:** default 16px (`size-4`) unless overridden; always `shrink-0`.

### Inputs — `components/ui/input.tsx`

`h-8 w-full rounded-lg border-input bg-transparent` (`dark:bg-input/30`), `px-2.5 py-1`, 16px→14px type. Focus ring identical to buttons. Invalid state: destructive border + `ring-3 ring-destructive/20` (dark /40). Disabled: `bg-input/50`, 50% opacity, blocked cursor. Placeholder in muted-foreground.

### Form fields — `components/ui/field.tsx` + `label.tsx`

The canonical form recipe (see `components/auth/login-form.tsx`): `<form class="grid gap-4">` → `Field` (vertical, `gap-2`) → `FieldLabel` (14px medium) → `Input` → `FieldDescription` (muted) **or** `FieldError` (destructive, `role=alert`). Spacing ladder: 8px within a field, 20px (`gap-5`) between groups, 16px (`gap-4`) in simple forms. Invalid fields also mark the whole `Field` destructive via `data-[invalid=true]`.

### Cards — canonical recipe (`app/login/page.tsx`)

`rounded-xl border bg-card p-6 shadow-sm` inside a centered `min-h-svh` page with `p-4`. Card header: H1 (`text-xl font-semibold tracking-tight`) with `mb-1`, one-line muted subtitle (`text-sm text-muted-foreground`), then `mb-6` before content.

### Alerts & error states — `alert.tsx` / `error-state.tsx`

Alerts: `rounded-lg border px-2.5 py-2 text-sm`, grid layout with a 16px icon spanning two rows; `default` is card-on-card, `destructive` keeps card background with destructive text (description at 90%). The shared `ErrorState` renders a destructive alert (`max-w-md`, `AlertCircleIcon`) centered in a `min-h-[200px]` container, with humanized copy mapped from API error codes (`INSUFFICIENT_BALANCE`, `QUOTE_EXPIRED`, …).

### Toasts — `sonner.tsx` (via `lib/toast.ts`)

Sonner styled from tokens: popover background/text, `--border`, base 10px radius. Lucide icons at 16px: `CircleCheck` success, `Info` info, `TriangleAlert` warning, `OctagonX` error, spinning `Loader2` for pending. Theme follows `next-themes`.

### Icons

`lucide-react` exclusively, 16px default (`size-4`), 12–14px in xs/sm controls. Inline icons never shrink.

---

## 5. Layout Principles

- **App shell:** `html` is `h-full`, `body` is `min-h-full flex flex-col` with `antialiased`; global background lives on the body token.
- **Mobile-first** single-column flow. Screens are full-bleed with `p-4` page padding; a persistent **bottom tab bar** (Home / History / Exchange, per `docs/FLOW_DIAGRAM.mmd`) is the planned navigation shell.
- **Focused single-card screens** (auth, confirmations): content centered in `min-h-svh`, constrained to `max-w-sm` (384px) — one card, one task.
- **Whitespace philosophy: tight and functional.** 24px card padding, 16px between form rows, 8px inside field groups. Breathing room comes from section separation, not generous padding.
- **Density rule:** if a screen has lists or tables, keep rows compact (`text-sm`, 8px row gaps) and let the grey ramp do hierarchy work instead of borders on borders.
- **Numeric voice:** amounts, rates, and IDs are set in Geist Mono; currency labels stay in Sans.

---

## 6. Design System Notes for Generation

Copy-paste block for page-generation prompts:

```
FlowPay design system:
- Monochrome oklch neutral palette; dark mode via .dark class (next-themes). NO decorative colour.
- Red (#E7000B light / #FF6467 dark) = errors/danger only, used as 10–20% tint + text, never solid slabs.
- Sole brand accent: royal blue #1447E6 (dark sidebar) — reserve for brand/navigation moments.
- Type: Geist Sans (UI; headings text-xl font-semibold tracking-tight), Geist Mono for amounts/IDs/codes.
- Body text-sm (14px); captions text-sm text-muted-foreground; micro text-xs.
- Radius: controls rounded-lg (10px), cards rounded-xl (14px). Cards: rounded-xl border bg-card p-6 shadow-sm.
- Controls h-8, text-sm font-medium; focus ring-3 ring-ring/50; button press translate-y-px; disabled opacity-50.
- Button variants: default (solid primary), outline, secondary, ghost, destructive (tinted), link. loading prop → spinner + disabled.
- Forms: form.grid.gap-4 → Field (gap-2) → FieldLabel text-sm font-medium → Input h-8 rounded-lg → FieldDescription (muted) or FieldError (destructive).
- Feedback: sonner toasts styled from tokens (popover bg, border, 16px lucide icons); page errors via ErrorState (destructive Alert, max-w-md, centered, min-h-[200px]).
- Icons: lucide-react only, size-4 (16px), shrink-0.
- Layout: mobile-first; p-4 page padding; focused screens centered min-h-svh with max-w-sm card; compact list density.
- Dark surfaces use alpha borders (white/10% borders, white/15% inputs); chart ramp = 5-step grey luminance scale.
```
