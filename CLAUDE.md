# RSweld

Company website for RSweld — stainless steel and steel welding and custom railings
(Považská Bystrica, Slovakia). See `README.md` for setup and env vars.

## Language rules (client requirement)

- **Everything that is code is English**: file/folder names (except URL route
  segments), components, variables, comments, commit messages, README, error
  messages in code, test names.
- **Slovak is only for**: (1) visible site content — headings, copy, button
  labels, user-facing validation messages, meta descriptions, alt texts;
  (2) URL route segments (`/galeria`, `/kontakt`, `/admin/zobrazenie`).
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
Nova**, not Radix) · Prisma 7 + `@prisma/adapter-pg` → Railway Postgres · Zod ·
react-hook-form · Resend · Motion · S3 (Railway Bucket). Hosted on Railway.

## Landmines (not obvious from the code)

### Prisma 7

- `url` / `directUrl` are **forbidden** in the `datasource` block.
- Runtime: `PrismaClient` takes the `@prisma/adapter-pg` driver adapter with
  `DATABASE_URL` (`lib/prisma.ts`); `@prisma/client-runtime-utils` must
  stay a direct dependency (generated client requires it, pnpm is strict).
- Railway's private network (`postgres.railway.internal`) is **unreachable
  during builds**: `next build` prerenders ISR pages via `DIRECT_URL` (public
  TCP proxy URL), and Migrate (`prisma.config.ts`) uses `DIRECT_URL`, falling
  back to `DATABASE_URL`. `railway.json` runs `pnpm db:migrate` before
  `pnpm build`. The config loads `.env` itself via `dotenv` — Prisma 7 doesn't.
- The initial migration was generated **offline**:
  `prisma migrate diff --from-empty --to-schema … --script`; apply with
  `pnpm db:migrate`. Generated client → `lib/generated/prisma` (git-ignored).

### shadcn = Base UI (not Radix)

- No `form` (react-hook-form wrapper) component — use `field`
  (`Field`, `FieldGroup`, `FieldError`…) with react-hook-form directly
  (`zodResolver` supports Zod v4).
- Composition via the **`render` prop**, not `asChild`:
  `<Button render={<Link href="/x" />}>…</Button>` — and when the rendered
  element is a link/anchor, also pass `nativeButton={false}` or Base UI logs
  a console warning.
- lucide-react v1 **removed brand icons** — Instagram lives in
  `components/shared/instagram-icon.tsx`.
- Add components: `pnpm dlx shadcn@latest add <name>` (`-d` skips the
  interactive preset prompt).

### Admin area (`/admin`)

- Single user, credentials in env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`,
  `AUTH_SECRET`) — no user table, **never** add a fallback password.
- Next 16 renamed `middleware.ts` → **`proxy.ts`** (must export `proxy`);
  the old name still builds but warns.
- The proxy does not see Server Action POSTs — every action and admin page
  starts with `requireSession()`. Don't drop it.
- `lib/auth.ts` runs in the edge proxy: Web Crypto only, no `next/headers`,
  no Node APIs. Cookie handling lives in `lib/auth-server.ts`.
- A `"use server"` file may only export async functions — putting a shared
  `const initialState` in `app/admin/actions.ts` breaks the build.
- Gallery = `Photo` + `Tag` (many-to-many) + `PhotoPlacement` (website
  sections). Each list (gallery "Všetky", every tag, every section) has its
  **own** `sortOrder` on the join row — never derive one list's order from
  another. Sections are declared in `lib/placements.ts` + the `Placement` enum.
- Admin mutations called from client components return `MutationResult`;
  messages come only from `UserFacingError` (`lib/errors.ts`) — anything else
  shows a generic Slovak error.
- Photos are downscaled in the browser before upload (Server Action body limit
  `4mb` in `next.config.ts`).

- `/realizacie` permanently redirects to `/galeria` (old links / SEO);
  `/cenova-ponuka` → `/kontakt#dopyt` (the site has **one** inquiry form).
- Public pages live in the `app/(site)/` route group (header/footer/JSON-LD);
  `app/layout.tsx` is the bare document shell so `/admin` stays clean.

### Object storage (Railway Bucket, S3 API)

- Railway Buckets are **private** — no public URLs. One bucket, two prefixes:
  `gallery/` is streamed by `app/media/[...key]/route.ts` (`Photo.imagePath`
  = `/media/gallery/…`, immutable cache); `inquiries/` is never served by that
  route — attachments are shared via 7-day presigned URLs only.
- Client in `lib/s3.ts` (`S3_*` env vars, lazy). Keep
  `requestChecksumCalculation: "WHEN_REQUIRED"` — the SDK's default CRC
  checksums break S3-compatible providers.
- Local: `docker compose up -d` (Postgres + Adobe S3Mock, path-style). MinIO
  images are no longer published on Docker Hub — don't switch back.

### Graceful degradation without credentials

- `lib/queries.ts` reads Prisma only when `DATABASE_URL` is set, else falls
  back to `lib/data/` seed content. `/api/inquiries` skips persistence/email
  with a `console.warn` when creds are missing. Don't break this: the site must
  build and run with an empty `.env`.
- `lib/s3.ts` client is a **lazy factory** — never instantiate at module
  level (build-time page-data collection would throw).

## Design system

- Brand: `#114ED9` = `oklch(0.4866 0.2203 263.04)` — set as `--primary`.
  White on primary = 6.74:1 (AA). Neutrals: zinc scale.
- `text-primary` **fails contrast on dark sections** — use `text-primary-soft`
  for brand-colored _text_ (identical in light mode, lighter tint in `.dark`).
- Dark sections (hero, CTA, footer) = wrap in `class="dark"`; tokens re-map.
- Logo = inline SVG in `components/shared/logo.tsx` (vectorised from the
  client's raster on rs-weld.com), colored by the `--logo` token (exact brand
  blue; brighter `#467EF7` in `.dark`). Size it by height (`h-9`), not text
  size. `LogoMark` = torch only (hero decoration). Favicons `app/icon.svg`,
  `app/apple-icon.png`, `app/favicon.ico`; `public/logo.{svg,png}` for JSON-LD.
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
- Seed photos live in `public/references/` (`lib/data/gallery.ts`); real
  content is managed in `/admin` once the DB is live.

## Project state

Phase 2 (design + content + DB schema) done. Moved from Supabase/Vercel to
Railway (Postgres + Bucket). Pending real-world hookup: real photos, Railway
service variables + Resend credentials (then `pnpm db:seed` once), and copy
marked `TODO: verify with client`.
