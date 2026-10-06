# RSweld

Company website for **RSweld** — stainless steel and steel welding and custom
railings (Považská Bystrica, Slovakia).

> **Status: Phase 2 — full site.** Design, content, gallery with lightbox,
> quote/contact forms and the database schema are in place. The site runs
> without credentials (static seed data, no persistence); once Supabase and
> Resend credentials land in `.env`, run the migration + seed below and
> everything is live end-to-end.

## Tech stack

| Area            | Tool                                                 |
| --------------- | ---------------------------------------------------- |
| Framework       | Next.js 16 (App Router, TypeScript strict)           |
| Styling         | Tailwind CSS v4                                      |
| UI components   | shadcn/ui (Base UI / Nova preset)                    |
| ORM             | Prisma 7 → Supabase Postgres (`@prisma/adapter-pg`)  |
| Validation      | Zod (+ react-hook-form on the client)                |
| Email           | Resend (inquiry notifications)                       |
| Storage         | Supabase Storage (gallery images, quote attachments) |
| Animations      | Motion (LazyMotion, one shared `AnimatedSection`)    |
| Lint / format   | ESLint (Next + TS strict) + Prettier                 |
| Package manager | pnpm                                                 |

## Requirements

- **Node.js ≥ 22** (LTS), e.g. via [nvm](https://github.com/nvm-sh/nvm):
  `nvm install 22 && nvm use 22`
- **pnpm** (via corepack): `corepack enable && corepack prepare pnpm@latest --activate`

## Local setup

```bash
# 1. Install dependencies (postinstall runs `prisma generate`)
pnpm install

# 2. Environment variables
cp .env.example .env
#    ...fill in the values (see below); the site also runs with an empty .env

# 3. Dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Going live with a database (once credentials exist)

```bash
pnpm db:migrate   # applies prisma/migrations via DIRECT_URL
pnpm db:seed      # idempotent upsert of gallery photos/tags
```

Without `DATABASE_URL`, pages fall back to the static seed data in `lib/data/`
and the API skips persistence (logged as a warning) — nothing crashes.

## Environment variables

| Variable                        | Purpose                                                                    |
| ------------------------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`                  | **Pooled** connection (pgbouncer, port 6543) — runtime via Prisma adapter. |
| `DIRECT_URL`                    | **Direct** connection (port 5432) — Prisma Migrate.                        |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL.                                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser-safe).                                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key — **server only**, bypasses RLS (attachment uploads).     |
| `RESEND_API_KEY`                | API key from [resend.com](https://resend.com).                             |
| `RESEND_FROM_EMAIL`             | Verified sender, e.g. `RSweld <dopyty@rsweld.sk>`.                         |
| `NOTIFICATION_EMAIL`            | Inbox that receives inquiry notifications.                                 |
| `ADMIN_EMAIL`                   | The single administrator's login e-mail.                                   |
| `ADMIN_PASSWORD`                | That administrator's password — the only thing guarding `/admin`.          |
| `AUTH_SECRET`                   | Random secret signing the admin session cookie (32 bytes, base64url).      |

### Where to find the connection strings & keys

1. **Supabase Dashboard** → your project.
2. **Database** (`Project Settings → Database → Connection string`):
   - `DATABASE_URL` = **Transaction / pooled** string (port `6543`), append
     `?pgbouncer=true&connection_limit=1`.
   - `DIRECT_URL` = **Session / direct** string (port `5432`).
3. **API** (`Project Settings → API`): copy `Project URL`, `anon public` key and
   `service_role` key.

### Storage buckets

Create two buckets in **Supabase Dashboard → Storage**:

| Bucket       | Visibility               | Used for                                                                                     |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------- |
| `references` | **Public** (public read) | Gallery images uploaded through `/admin`.                                                    |
| `inquiries`  | **Private** (no public)  | Drawing attachments from the quote form. Links in notification emails use 7-day signed URLs. |

Uploads go through `SUPABASE_SERVICE_ROLE_KEY` server-side (`lib/supabase.ts`),
so no RLS write policies are needed.

## Admin area (`/admin`)

A single administrator manages the photos shown on the site. Sections:

| Route               | Purpose                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `/admin`            | Photo library — search, filter by tag / section, bulk tag / show / hide / delete.           |
| `/admin/nahrat`     | Bulk upload (drag & drop), shared tags + sections for the batch. Downscaled in the browser. |
| `/admin/fotky/[id]` | Edit one photo: title, description, alt text, tags, sections, replace image.                |
| `/admin/zobrazenie` | "Where and in what order": drag & drop ordering per list, add / remove photos.              |
| `/admin/tagy`       | Create, rename, delete and reorder tags (= order of the gallery filter chips).              |

**Data model.** A `Photo` has many `Tag`s (`PhotoTag`) and is shown in website
sections (`PhotoPlacement`: `GALLERY`, `HOME_FEATURED`, `HOME_ABOUT` — labels and
limits in `lib/placements.ts`). Every list has its **own** `sortOrder`: the
gallery's "Všetky" order, each tag's filter order and each homepage section are
independent, so moving a photo in one never reshuffles another. A tag filter on
`/galeria` only shows photos that are also in `GALLERY`. New memberships are
appended to the end of their list.

**Authentication.** There is no user table — the credentials are
`ADMIN_EMAIL` + `ADMIN_PASSWORD`, and a successful login mints an HMAC-signed
session cookie (`AUTH_SECRET`, HttpOnly, SameSite=Lax, 7 days). With any of the
three variables missing the admin area is disabled; there is deliberately no
fallback password. Login attempts are rate-limited to 8 per 10 minutes per IP
(in-memory — a speed bump, not the security boundary).

- `proxy.ts` gates every `/admin/**` request (Next 16's renamed middleware).
- Every page and Server Action re-checks the session via `requireSession()`,
  because Server Action POSTs do not pass through the proxy.
- `/admin` is `noindex` (layout metadata, `x-robots-tag`, `robots.txt`).

**Requirements.** The admin needs both integrations: `DATABASE_URL` for the
content and Supabase Storage for the photos. Without a database it renders the
seed gallery read-only with an explanatory notice; without Storage the texts and
ordering still save but new uploads fail with a Slovak error — except in
`pnpm dev`, where uploads fall back to `public/uploads/` (git-ignored) so the
whole flow can be tried locally.

**Changing the password.** Edit `ADMIN_PASSWORD` in the environment (Vercel →
Settings → Environment Variables) and redeploy. Rotating `AUTH_SECRET` signs
everyone out.

## Scripts

| Script                 | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `pnpm dev`             | Dev server (Turbopack).                       |
| `pnpm build`           | Production build.                             |
| `pnpm start`           | Serve the production build.                   |
| `pnpm lint`            | ESLint.                                       |
| `pnpm format`          | Prettier — write.                             |
| `pnpm format:check`    | Prettier — check only.                        |
| `pnpm prisma:generate` | Generate the Prisma client (`lib/generated`). |
| `pnpm db:migrate`      | `prisma migrate deploy` (needs `DIRECT_URL`). |
| `pnpm db:seed`         | Seed photos and tags (idempotent).            |

## Project structure

```
rsweld/
├── prisma/
│   ├── schema.prisma          # Inquiry, Photo/Tag/PhotoTag/PhotoPlacement, Testimonial
│   ├── migrations/0_init/     # initial SQL (generated offline via migrate diff)
│   └── seed.ts                # idempotent seed (tsx)
├── prisma.config.ts           # Prisma 7 config (DIRECT_URL for Migrate, seed cmd)
├── proxy.ts                   # auth gate for /admin/** (Next 16 middleware)
├── app/
│   ├── layout.tsx             # document shell: fonts, metadata, toaster
│   ├── (site)/                # public site — header, footer, JSON-LD
│   │   ├── layout.tsx
│   │   ├── page.tsx           # home: hero → services → references → about → …
│   │   ├── galeria/           # gallery with tag filter (?tag=slug) + lightbox
│   │   ├── cenova-ponuka/     # quote form (file upload)
│   │   └── kontakt/           # contact info, map, contact form
│   ├── admin/                 # single-user admin (noindex)
│   │   ├── layout.tsx         # admin chrome (only when signed in)
│   │   ├── page.tsx           # photo library (bulk actions)
│   │   ├── nahrat/            # bulk upload
│   │   ├── fotky/[id]/        # edit photo
│   │   ├── zobrazenie/        # per-section / per-tag ordering
│   │   ├── tagy/              # tag management
│   │   ├── prihlasenie/       # login
│   │   └── actions.ts         # Server Actions (login + gallery CRUD)
│   ├── api/inquiries/         # POST: validate → upload → persist → notify
│   ├── sitemap.ts / robots.ts
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── layout/                # header (sticky, sheet menu), footer
│   ├── home/                  # hero, services, references, about, faq, cta
│   ├── gallery/               # gallery-grid, lightbox
│   ├── forms/                 # quote-form, contact-form, use-inquiry-submit
│   ├── admin/                 # nav, photos/, upload/, arrange/, tags/, pickers
│   └── shared/                # logo, animated-section, section-heading, instagram-icon
├── lib/
│   ├── prisma.ts              # Prisma client singleton (pg adapter, pooled URL)
│   ├── supabase.ts            # lazy Supabase clients (Storage)
│   ├── storage.ts             # gallery image upload / cleanup
│   ├── queries.ts             # DB reads with static-seed fallback
│   ├── admin/gallery.ts       # gallery writes (DB required); load.ts, lists.ts
│   ├── gallery.ts             # pure helpers over the gallery snapshot
│   ├── gallery-data.ts        # reads the gallery snapshot from the DB
│   ├── placements.ts          # website sections: labels, limits
│   ├── auth.ts                # credentials + signed session token (edge-safe)
│   ├── auth-server.ts         # session cookie helpers, requireSession()
│   ├── rate-limit.ts          # in-memory login throttle
│   ├── config.ts              # isDatabaseConfigured / isStorageConfigured
│   ├── validations.ts         # Zod schemas + attachment constraints
│   ├── data/                  # seed/fallback content (gallery, services, faq…)
│   ├── site.ts                # contact details, nav
│   └── json-ld.ts             # LocalBusiness structured data
├── scripts/
│   └── generate-placeholders.mjs  # brushed-steel placeholder images (sharp)
└── public/references/         # generated placeholders — swap for real photos
```

## API

### `POST /api/inquiries`

Accepts JSON or `multipart/form-data` (quote form with optional attachment).

- `201 { "success": true }` — valid input.
- `422 { "success": false, "fieldErrors": {...} }` — validation failure.
- `400` — malformed body.
- `500` — DB configured but the write failed.

Attachment limits: 10 MB; `.pdf .png .jpg .jpeg .webp .dwg .dxf .step .stp`.

Persistence (Prisma) and notification (Resend) are skipped with a logged
warning while their credentials are missing.

## Seed photos

`public/references/*.jpg` are the client's photos (2026-07 set) used as seed /
fallback content (`lib/data/gallery.ts`). Once the database is live, photos are
managed in `/admin` and uploads go to Supabase Storage. The `<Logo />`
component is a text placeholder — swap in the real logo file when delivered.

## Prisma 7 notes

Prisma 7 does **not** support `url` / `directUrl` in the schema `datasource`:

- Runtime uses the **driver adapter** `@prisma/adapter-pg` with the pooled
  `DATABASE_URL` — see `lib/prisma.ts`.
- Migrate reads `DIRECT_URL` from `prisma.config.ts`.
- The initial migration was generated offline
  (`prisma migrate diff --from-empty --to-schema … --script`), so it can be
  applied later with `prisma migrate deploy`.
