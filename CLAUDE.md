# RSweld

Company website for RSweld — stainless steel welding and custom railings
(Považská Bystrica, Slovakia). See `README.md` for setup and env vars.

## Language rules (client requirement)

- **Everything that is code is English**: file/folder names (except URL route
  segments), components, variables, comments, commit messages, README, error
  messages in code, test names.
- **Slovak is only for**: (1) visible site content — headings, copy, button
  labels, user-facing validation messages, meta descriptions, alt texts;
  (2) URL route segments (`/cenova-ponuka`, `/realizacie`, `/kontakt`).
- Draft copy that the client has not confirmed is marked
  `TODO: verify with client` (comment in English).

## Toolchain (important)

- **Node 22** (LTS) + **pnpm** (corepack). Node 21.x has a broken corepack
  (`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`) — do not use.
- nvm default is 22, but shells may still pick up 21: run
  `export PATH="$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"` or `nvm use 22`.
- pnpm build scripts are approved via `allowBuilds:` in `pnpm-workspace.yaml` —
  new native deps must be set to `true` there or their build silently skips.

## Stack

Next.js 16 (App Router, TS strict) · Tailwind v4 · shadcn/ui (**Base UI /
Nova**, not Radix) · Prisma 7 + `@prisma/adapter-pg` → Supabase Postgres · Zod ·
react-hook-form · Resend · Motion · Supabase Storage.

## Landmines (not obvious from the code)

### Prisma 7

- `url` / `directUrl` are **forbidden** in the `datasource` block.
- Runtime: `PrismaClient` takes the `@prisma/adapter-pg` driver adapter with
  pooled `DATABASE_URL` (`lib/prisma.ts`); `@prisma/client-runtime-utils` must
  stay a direct dependency (generated client requires it, pnpm is strict).
- Migrate: connection comes from `prisma.config.ts` = `DIRECT_URL` (port 5432,
  no pgbouncer). The config loads `.env` itself via `dotenv` — Prisma 7 doesn't.
- The initial migration was generated **offline**:
  `prisma migrate diff --from-empty --to-schema … --script`; apply with
  `pnpm db:migrate`. Generated client → `lib/generated/prisma` (git-ignored).

### shadcn = Base UI (not Radix)

- No `form` (react-hook-form wrapper) component — use `field`
  (`Field`, `FieldGroup`, `FieldError`…) with react-hook-form directly
  (`zodResolver` supports Zod v4).
- Composition via the **`render` prop**, not `asChild`:
  `<Button render={<Link href="/x" />}>…</Button>`.
- lucide-react v1 **removed brand icons** — Instagram lives in
  `components/shared/instagram-icon.tsx`.
- Add components: `pnpm dlx shadcn@latest add <name>` (`-d` skips the
  interactive preset prompt).

### Graceful degradation without credentials

- `lib/queries.ts` reads Prisma only when `DATABASE_URL` is set, else falls
  back to `lib/data/` seed content. `/api/inquiries` skips persistence/email
  with a `console.warn` when creds are missing. Don't break this: the site must
  build and run with an empty `.env`.
- `lib/supabase.ts` clients are **lazy factories** — never instantiate at
  module level (build-time page-data collection would throw).

## Design system

- Brand: `#114ED9` = `oklch(0.4866 0.2203 263.04)` — set as `--primary`.
  White on primary = 6.74:1 (AA). Neutrals: zinc scale.
- `text-primary` **fails contrast on dark sections** — use `text-primary-soft`
  for brand-colored _text_ (identical in light mode, lighter tint in `.dark`).
- Dark sections (hero, CTA, footer) = wrap in `class="dark"`; tokens re-map.
- One animation wrapper: `components/shared/animated-section.tsx`
  (LazyMotion, fade + 12px rise, 450ms, once, reduced-motion aware). No ad-hoc
  animations elsewhere.
- Headings: Space Grotesk (`font-heading`, applied to h1–h6 in globals). Body:
  system font stack — deliberate, keeps LCP fast. Don't add more webfonts.
- Inside `<ol>`/`<ul>`, `<li>` must be the direct child (a11y audit) — put
  `AnimatedSection` inside the `li`, not around it.

## Conventions

- Before commit: `pnpm lint && pnpm build && pnpm format:check` must pass.
- Verified Lighthouse (2026-07): perf ≥91, a11y 100 on all four pages — don't
  regress: keep first gallery row `priority`, hero static (no scroll-in), fonts
  as-is.
- Never commit `.env` (only `.env.example`) or `lib/generated`.
- Shared Zod schemas → `lib/validations.ts`; contact data & nav → `lib/site.ts`;
  content types → `lib/types.ts` (decoupled from Prisma types on purpose).
- Placeholder images: `node scripts/generate-placeholders.mjs` (deterministic);
  real client photos replace files in `public/references/` keeping names.

## Project state

Phase 2 (design + content + DB schema) done. Pending real-world hookup:
client's logo file, real photos, Supabase + Resend credentials (then
`pnpm db:migrate && pnpm db:seed`), and copy marked `TODO: verify with client`.
