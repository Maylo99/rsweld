# RSweld

Company website for **RSweld** — stainless steel and steel welding and custom
railings (Považská Bystrica, Slovakia).

> **Status: Phase 2 — full site.** Design, content, gallery with lightbox,
> quote/contact forms and the database schema are in place. The site runs
> without credentials (static seed data, no persistence); once the Railway
> Postgres + Bucket and Resend credentials land in the environment, run the
> migration + seed below and everything is live end-to-end.

## Tech stack

| Area            | Tool                                                 |
| --------------- | ---------------------------------------------------- |
| Framework       | Next.js 16 (App Router, TypeScript strict)           |
| Styling         | Tailwind CSS v4                                      |
| UI components   | shadcn/ui (Base UI / Nova preset)                    |
| ORM             | Prisma 7 → Railway Postgres (`@prisma/adapter-pg`)   |
| Validation      | Zod (+ react-hook-form on the client)                |
| Email           | Resend (inquiry notifications)                       |
| Storage         | Railway Bucket, S3 API (gallery images, attachments) |
| Animations      | Motion (LazyMotion, one shared `AnimatedSection`)    |
| Hosting         | Railway (`railway.json`)                             |
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

### Local database + object storage (optional)

`docker-compose.yml` runs Postgres and an S3-compatible bucket (Adobe S3Mock)
as local stand-ins for the Railway services:

```bash
docker compose up -d
# .env: the "Local" values from .env.example (DATABASE_URL, S3_*)
pnpm db:migrate   # applies prisma/migrations (DIRECT_URL, else DATABASE_URL)
pnpm db:seed      # idempotent upsert of gallery photos/tags
```

Without `DATABASE_URL`, pages fall back to the static seed data in `lib/data/`
and the API skips persistence (logged as a warning) — nothing crashes.

## Environment variables

| Variable               | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`         | Runtime connection (Railway: private `postgres.railway.internal` URL).  |
| `DIRECT_URL`           | Public TCP proxy URL — Prisma Migrate + `next build`. Optional locally. |
| `S3_BUCKET`            | Bucket name (Railway: `BUCKET`).                                        |
| `S3_ENDPOINT`          | S3 API endpoint (Railway: `ENDPOINT`).                                  |
| `S3_REGION`            | Region (Railway: `REGION`, usually `auto`).                             |
| `S3_ACCESS_KEY_ID`     | Access key (Railway: `ACCESS_KEY_ID`) — **server only**.                |
| `S3_SECRET_ACCESS_KEY` | Secret key (Railway: `SECRET_ACCESS_KEY`) — **server only**.            |
| `S3_FORCE_PATH_STYLE`  | `true` for local S3Mock / older Railway buckets; empty otherwise.       |
| `RESEND_API_KEY`       | API key from [resend.com](https://resend.com).                          |
| `RESEND_FROM_EMAIL`    | Verified sender, e.g. `RSweld <dopyty@rsweld.sk>`.                      |
| `NOTIFICATION_EMAIL`   | Inbox that receives inquiry notifications.                              |
| `ADMIN_EMAIL`          | The single administrator's login e-mail.                                |
| `ADMIN_PASSWORD`       | That administrator's password — the only thing guarding `/admin`.       |
| `AUTH_SECRET`          | Random secret signing the admin session cookie (32 bytes, base64url).   |

## Deploying on Railway

The project has three Railway services: the **app** (this repo), **Postgres**
and a **Bucket**. `railway.json` sets the build command to
`pnpm db:migrate && pnpm build`, so pending migrations are applied before every
build, and the build prerenders the ISR pages from the live database.

1. **Postgres** — `+ New → Database → PostgreSQL`.
2. **Bucket** — `+ New → Bucket` (pick the region closest to the app).
3. **App → Variables** — use reference variables (adjust `Postgres` / `Bucket`
   to the actual service names):

   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DIRECT_URL=${{Postgres.DATABASE_PUBLIC_URL}}
   S3_BUCKET=${{Bucket.BUCKET}}
   S3_ENDPOINT=${{Bucket.ENDPOINT}}
   S3_REGION=${{Bucket.REGION}}
   S3_ACCESS_KEY_ID=${{Bucket.ACCESS_KEY_ID}}
   S3_SECRET_ACCESS_KEY=${{Bucket.SECRET_ACCESS_KEY}}
   ```

   plus the Resend and admin variables. `DIRECT_URL` must be the **public**
   URL: Railway's private network is not reachable during builds.

4. Deploy, then seed once from your machine with the public URL:
   `DATABASE_URL=<DATABASE_PUBLIC_URL> pnpm db:seed`.

### Object storage

Railway Buckets are **private** (no public read), so the app uses one bucket
with two prefixes:

| Prefix       | Used for                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| `gallery/`   | Gallery images uploaded through `/admin`, streamed by `/media/[...key]` (cached as immutable).          |
| `inquiries/` | Drawing attachments from the quote form — never served by `/media`; emails carry a 7-day presigned URL. |

All access goes through the server (`lib/s3.ts`); the keys never reach the
browser.

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
content and the S3 bucket for the photos. Without a database it renders the
seed gallery read-only with an explanatory notice; without Storage the texts and
ordering still save but new uploads fail with a Slovak error — except in
`pnpm dev`, where uploads fall back to `public/uploads/` (git-ignored) so the
whole flow can be tried locally.

**Changing the password.** Edit `ADMIN_PASSWORD` in the environment (Railway →
app service → Variables) and redeploy. Rotating `AUTH_SECRET` signs
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
| `pnpm db:migrate`      | `prisma migrate deploy` (`DIRECT_URL`).       |
| `pnpm db:seed`         | Seed photos and tags (idempotent).            |

## Project structure

```
rsweld/
├── prisma/
│   ├── schema.prisma          # Inquiry, Photo/Tag/PhotoTag/PhotoPlacement, Testimonial
│   ├── migrations/0_init/     # initial SQL (generated offline via migrate diff)
│   └── seed.ts                # idempotent seed (tsx)
├── prisma.config.ts           # Prisma 7 config (DIRECT_URL for Migrate, seed cmd)
├── railway.json               # Railway build/deploy (migrate → build → start)
├── docker-compose.yml         # local Postgres + S3Mock
├── proxy.ts                   # auth gate for /admin/** (Next 16 middleware)
├── app/
│   ├── layout.tsx             # document shell: fonts, metadata, toaster
│   ├── (site)/                # public site — header, footer, JSON-LD
│   │   ├── layout.tsx
│   │   ├── page.tsx           # home: hero → services → references → about → …
│   │   ├── sluzby/            # services page: workshop services (lib/data/offer.ts)
│   │   ├── galeria/           # gallery with tag filter (?tag=slug) + lightbox
│   │   └── kontakt/           # contact info, map, the inquiry form (quote + contact)
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
│   ├── media/[...key]/        # GET: streams gallery images from the private bucket
│   ├── sitemap.ts / robots.ts
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── layout/                # header (sticky, sheet menu), footer
│   ├── home/                  # hero, services, references, about, faq, cta
│   ├── gallery/               # gallery-grid, lightbox
│   ├── forms/                 # inquiry-form (quote + contact), use-inquiry-submit
│   ├── admin/                 # nav, photos/, upload/, arrange/, tags/, pickers
│   └── shared/                # logo, animated-section, section-heading, instagram-icon
├── lib/
│   ├── prisma.ts              # Prisma client singleton (pg adapter)
│   ├── s3.ts                  # lazy S3 client + bucket prefixes
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
managed in `/admin` and uploads go to the Railway bucket. The `<Logo />`
component is a text placeholder — swap in the real logo file when delivered.

## Prisma 7 notes

Prisma 7 does **not** support `url` / `directUrl` in the schema `datasource`:

- Runtime uses the **driver adapter** `@prisma/adapter-pg` with
  `DATABASE_URL` (during `next build`: `DIRECT_URL`) — see `lib/prisma.ts`.
- Migrate reads `DIRECT_URL` (fallback `DATABASE_URL`) in `prisma.config.ts`.
- The initial migration was generated offline
  (`prisma migrate diff --from-empty --to-schema … --script`), so it can be
  applied later with `prisma migrate deploy`.
