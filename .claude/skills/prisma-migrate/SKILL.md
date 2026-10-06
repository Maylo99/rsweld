---
name: prisma-migrate
description: Add or change Prisma models and run migrations against Railway Postgres in this Prisma 7 setup. Use when the user wants to add a DB model/table/column, "create a migration", change the schema, or set up phase-2 data. Encodes the Prisma 7 + driver-adapter + Railway private/public URL gotchas that generic Prisma advice gets wrong here.
---

# prisma-migrate

Schema + migration workflow for RSweld. This repo is **Prisma 7** with a driver
adapter — the old `url`/`directUrl`-in-schema advice does NOT apply.

## Mental model (read before touching anything)

- `prisma/schema.prisma` holds `generator` + `datasource` (**provider only, no
  URLs**) and the models.
- **Runtime** connections use `@prisma/adapter-pg` with `DATABASE_URL` (on
  Railway the private `postgres.railway.internal` URL) — see `lib/prisma.ts`.
  Import the `prisma` singleton from `@/lib/prisma`.
- **Migrate / introspect** use the connection in `prisma.config.ts`:
  `DIRECT_URL` (Railway public TCP proxy URL), falling back to `DATABASE_URL`.
  On Railway, `railway.json` runs `pnpm db:migrate` in the build, where the
  private network is unreachable — hence the public URL.
- Local DB: `docker compose up -d`, then
  `DATABASE_URL=postgresql://rsweld:rsweld@localhost:5432/rsweld`.
- Generated client → `lib/generated/prisma` (git-ignored).

## Preconditions

- Node 22 active (see `CLAUDE.md`).
- `.env` exists with a reachable `DATABASE_URL` (or `DIRECT_URL`). Without
  one, only `prisma generate` works.

## Add / change a model

1. Edit `prisma/schema.prisma` — add or modify the `model`. Keep Slovak-free
   identifiers (English model/field names), map to DB with `@@map` / `@map` if a
   specific table name is wanted.
2. Create + apply the migration (dev):
   ```bash
   pnpm prisma migrate dev --name <short_snake_case_desc>
   ```
   This writes SQL to `prisma/migrations/`, applies it via `DIRECT_URL`, and
   regenerates the client.
3. If you only changed the generator/output (no model change), just:
   ```bash
   pnpm prisma:generate
   ```
4. Use it: `import { prisma } from "@/lib/prisma"` in server code (route handlers,
   server actions). Never import the client into a client component.

## Applying to production / CI

```bash
pnpm prisma migrate deploy      # applies pending migrations, no prompts
```

On Railway this runs automatically in the build (`railway.json`) against
`DIRECT_URL` — committing the migration is enough.

## Inspect an existing DB (introspection)

```bash
pnpm prisma db pull             # writes existing schema into schema.prisma
```

## Common failures

- **"property `url` is no longer supported"** → you put a URL in the datasource
  block. Remove it; URLs live in `prisma.config.ts` (migrate) and the adapter
  (runtime).
- **"Cannot resolve environment variable"** on `generate` → `prisma.config.ts`
  reads the URL via dotenv; ensure `.env` exists or the fallback `|| ""`
  keeps generate working.
- **`getaddrinfo ENOTFOUND postgres.railway.internal`** → Migrate (or a build)
  ran outside Railway's private network. Set `DIRECT_URL` to the public URL
  (`${{Postgres.DATABASE_PUBLIC_URL}}`).
- **Client type errors after schema edit** → forgot to regenerate; run
  `pnpm prisma:generate`.

## After migrating

Run `pnpm build` (TS strict picks up new/changed model types) and consider the
`commit` skill. Migration SQL in `prisma/migrations/` **is** committed; the
generated client is not.
