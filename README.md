# RSweld

Company website for **RSweld** — stainless steel welding and custom stainless
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
pnpm db:seed      # idempotent upsert of references + testimonials
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
| `references` | **Public** (public read) | Gallery images uploaded by the admin (later).                                                |
| `inquiries`  | **Private** (no public)  | Drawing attachments from the quote form. Links in notification emails use 7-day signed URLs. |

Uploads go through `SUPABASE_SERVICE_ROLE_KEY` server-side (`lib/supabase.ts`),
so no RLS write policies are needed.

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
| `pnpm db:seed`         | Seed references + testimonials (idempotent).  |

## Project structure

```
rsweld/
├── prisma/
│   ├── schema.prisma          # Inquiry, Reference, Testimonial models
│   ├── migrations/0_init/     # initial SQL (generated offline via migrate diff)
│   └── seed.ts                # idempotent seed (tsx)
├── prisma.config.ts           # Prisma 7 config (DIRECT_URL for Migrate, seed cmd)
├── app/
│   ├── layout.tsx             # fonts, metadata, LocalBusiness JSON-LD
│   ├── page.tsx               # home: hero → services → references → about → …
│   ├── realizacie/            # gallery with category filter + lightbox
│   ├── cenova-ponuka/         # quote form (file upload)
│   ├── kontakt/               # contact info, map, contact form
│   ├── api/inquiries/         # POST: validate → upload → persist → notify
│   ├── sitemap.ts / robots.ts
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── layout/                # header (sticky, sheet menu), footer
│   ├── home/                  # hero, services, references, about, testimonials, faq, cta
│   ├── gallery/               # gallery-grid, lightbox
│   ├── forms/                 # quote-form, contact-form, use-inquiry-submit
│   └── shared/                # logo, animated-section, section-heading, instagram-icon
├── lib/
│   ├── prisma.ts              # Prisma client singleton (pg adapter, pooled URL)
│   ├── supabase.ts            # lazy Supabase clients (Storage)
│   ├── queries.ts             # DB reads with static-seed fallback
│   ├── validations.ts         # Zod schemas + attachment constraints
│   ├── data/                  # seed/fallback content (references, services, faq…)
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

## Placeholder images

`public/references/*.jpg` are generated stand-ins
(`node scripts/generate-placeholders.mjs`). When the client delivers real
photos: replace the files (keep names), update alt texts in
`lib/data/references.ts`, re-seed. The `<Logo />` component is a text
placeholder — swap in the real logo file when delivered.

## Prisma 7 notes

Prisma 7 does **not** support `url` / `directUrl` in the schema `datasource`:

- Runtime uses the **driver adapter** `@prisma/adapter-pg` with the pooled
  `DATABASE_URL` — see `lib/prisma.ts`.
- Migrate reads `DIRECT_URL` from `prisma.config.ts`.
- The initial migration was generated offline
  (`prisma migrate diff --from-empty --to-schema … --script`), so it can be
  applied later with `prisma migrate deploy`.
