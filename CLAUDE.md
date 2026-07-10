# RSweld

Firemný web pre RSweld — zváranie nerezových komponentov a nerezové zábradlia
(Považská Bystrica). Viď `README.md` pre setup a env premenné.

## Toolchain (dôležité)

- **Node 22** (LTS) + **pnpm** (cez corepack). Node 21.x má rozbitý corepack
  (`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`) — nepoužívať.
- nvm default je nastavený na 22. Ak shell padne späť na starší Node, spusti:
  `export PATH="$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"` alebo `nvm use 22`.
- pnpm build scripts (sharp, unrs-resolver, prisma) sú schválené cez
  `allowBuilds:` v `pnpm-workspace.yaml` — pri novej native závislosti tam
  nastav `<pkg>: true`, inak sa jej build ticho preskočí.

## Stack

Next.js 16 (App Router, TS strict) · Tailwind v4 · shadcn/ui (**Base UI / Nova**,
nie Radix) · Prisma 7 + `@prisma/adapter-pg` → Supabase Postgres · Zod · Resend ·
Motion · Supabase Storage.

## Landmines (nie sú zjavné z kódu)

### Prisma 7

- `url` / `directUrl` **NIE sú** v `datasource` bloku (`schema.prisma`) — Prisma 7
  ich tam zakazuje.
- Runtime: `PrismaClient` dostáva **driver adaptér** `@prisma/adapter-pg` s
  pooled `DATABASE_URL` (viď `lib/prisma.ts`). Používaj singleton `prisma` odtiaľ.
- Migrácie: connection string je v `prisma.config.ts` = **`DIRECT_URL`** (direct,
  port 5432, bez pgbouncer). `prisma.config.ts` musí sám načítať `.env`
  (`dotenv`) — Prisma 7 to nerobí automaticky.
- Generovaný client ide do `lib/generated/prisma` (git-ignored), regeneruje sa
  cez `postinstall` / `pnpm prisma:generate`.

### shadcn = Base UI (nie Radix)

- Klasický `form` (react-hook-form) **neexistuje** — používaj komponent `field`
  (`Field`, `FieldGroup`, `FieldError`, `FieldLabel`…).
- Kompozícia je cez **`render` prop**, nie `asChild`. Napr.:
  `<Button render={<Link href="/x" />}>…</Button>`.
- Pridanie komponentu: `pnpm dlx shadcn@latest add <name>` (interaktívny preset
  preskoč cez `-d`).

## Konvencie

- Pred commitom: `pnpm lint && pnpm build && pnpm format:check` musia prejsť.
- Formátovanie rieši **Prettier** (100 cols, dvojúvodzovky, Tailwind class sort).
  ESLint sa do formátu nemieša (`eslint-config-prettier`).
- **Nikdy** necommituj `.env` (len `.env.example`) ani `lib/generated`.
- Texty pre používateľa sú po slovensky; `lang="sk"`.
- Zdieľané Zod schémy do `lib/validations.ts`, site/nav metadáta do `lib/site.ts`.

## Stav projektu

Fáza 1 = skeleton (hotová). Fáza 2 = DB modely + migrácie, finálny obsah,
napojenie formulárov na Prisma + Resend, galéria zo Storage. Hľadaj
`TODO (phase 2)` markery.
