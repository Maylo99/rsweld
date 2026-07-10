---
name: prisma-migrate
description: Add or change Prisma models and run migrations against Supabase Postgres in this Prisma 7 setup. Use when the user wants to add a DB model/table/column, "create a migration", change the schema, or set up phase-2 data. Encodes the Prisma 7 + driver-adapter + Supabase pooled/direct URL gotchas that generic Prisma advice gets wrong here.
---

# prisma-migrate

Schema + migration workflow for RSweld. This repo is **Prisma 7** with a driver
adapter — the old `url`/`directUrl`-in-schema advice does NOT apply.

## Mental model (read before touching anything)

- `prisma/schema.prisma` holds `generator` + `datasource` (**provider only, no
  URLs**) and the models.
- **Runtime** connections use `@prisma/adapter-pg` with the pooled `DATABASE_URL`
  (pgbouncer, port 6543) — see `lib/prisma.ts`. Import the `prisma` singleton
  from `@/lib/prisma`.
- **Migrate / introspect** use the connection in `prisma.config.ts`, which is
  `DIRECT_URL` (direct, port 5432, **no** pgbouncer). Migrations over pgbouncer
  fail — always use the direct URL.
- Generated client → `lib/generated/prisma` (git-ignored).

## Preconditions

- Node 22 active (see `CLAUDE.md`).
- `.env` exists with real `DATABASE_URL` **and** `DIRECT_URL` (migrations need a
  reachable direct connection). Without them, only `prisma generate` works.

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

Runs against `DIRECT_URL` from the deploy environment.

## Inspect an existing Supabase DB (introspection)

```bash
pnpm prisma db pull             # writes existing schema into schema.prisma
```

## Common failures

- **"property `url` is no longer supported"** → you put a URL in the datasource
  block. Remove it; URLs live in `prisma.config.ts` (migrate) and the adapter
  (runtime).
- **"Cannot resolve environment variable"** on `generate` → `prisma.config.ts`
  reads `DIRECT_URL` via dotenv; ensure `.env` exists or the fallback `?? ""`
  keeps generate working.
- **Migration hangs / prepared-statement errors** → you're pointing Migrate at
  the pooled URL. Use `DIRECT_URL`.
- **Client type errors after schema edit** → forgot to regenerate; run
  `pnpm prisma:generate`.

## After migrating

Run `pnpm build` (TS strict picks up new/changed model types) and consider the
`commit` skill. Migration SQL in `prisma/migrations/` **is** committed; the
generated client is not.
