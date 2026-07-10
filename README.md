# RSweld

Firemný web pre **RSweld** — zváranie nerezových komponentov a výroba nerezových
zábradlí (Považská Bystrica, Slovensko).

> **Stav: Fáza 1 — inicializácia.** Projekt obsahuje funkčný skeleton, tech stack
> a prepojenie na Supabase. Databázová schéma (Prisma modely + migrácie), finálny
> obsah stránok a napojenie formulárov na DB/email pribudnú vo fáze 2.

## Tech stack

| Oblasť        | Nástroj                                                |
| ------------- | ------------------------------------------------------ |
| Framework     | Next.js 16 (App Router, TypeScript strict)             |
| Styling       | Tailwind CSS v4                                        |
| UI komponenty | shadcn/ui (Base UI / Nova preset)                      |
| ORM           | Prisma 7 → Supabase Postgres (`@prisma/adapter-pg`)    |
| Validácia     | Zod                                                    |
| Email         | Resend (transakčné notifikácie — fáza 2)               |
| Úložisko      | Supabase Storage (obrázky referencií)                  |
| Animácie      | Motion (Framer Motion) — pripravené, použité vo fáze 2 |
| Lint / Format | ESLint (Next + TS strict) + Prettier                   |
| Balíčkovač    | pnpm                                                   |

## Požiadavky

- **Node.js ≥ 22** (LTS). Odporúčané cez [nvm](https://github.com/nvm-sh/nvm):
  `nvm install 22 && nvm use 22`.
- **pnpm** (cez corepack): `corepack enable && corepack prepare pnpm@latest --activate`

## Lokálny setup

```bash
# 1. Inštalácia závislostí (spustí aj `prisma generate` cez postinstall)
pnpm install

# 2. Environment premenné
cp .env.example .env
#    ...a vyplň hodnoty (viď nižšie)

# 3. Prisma client (ak treba manuálne pregenerovať)
pnpm prisma:generate

# 4. Dev server
pnpm dev
```

Otvor [http://localhost:3000](http://localhost:3000).

## Environment premenné

Skopíruj `.env.example` do `.env` a vyplň:

| Premenná                        | Popis                                                                       |
| ------------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`                  | **Pooled** connection (pgbouncer, port 6543) — runtime cez Prisma adaptér.  |
| `DIRECT_URL`                    | **Direct** connection (port 5432) — pre Prisma Migrate.                     |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL Supabase projektu.                                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Verejný anon kľúč (bezpečný pre browser).                                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role kľúč — **len server**, obchádza RLS (admin upload do Storage). |
| `RESEND_API_KEY`                | API kľúč z [resend.com](https://resend.com).                                |
| `RESEND_FROM_EMAIL`             | Overený odosielateľ, napr. `RSweld <dopyty@rsweld.sk>`.                     |
| `NOTIFICATION_EMAIL`            | Schránka, ktorá dostáva notifikácie o nových dopytoch.                      |

### Odkiaľ vziať connection stringy a kľúče

1. **Supabase Dashboard** → tvoj projekt.
2. **Database** (`Project Settings → Database → Connection string`):
   - `DATABASE_URL` = **Transaction / pooled** string (port `6543`). Odporúčané
     doplniť `?pgbouncer=true&connection_limit=1`.
   - `DIRECT_URL` = **Session / direct** string (port `5432`).
3. **API** (`Project Settings → API`): skopíruj `Project URL`, `anon public` kľúč
   a `service_role` kľúč.

### Vytvorenie Storage bucketu `references`

Pre galériu / referencie:

1. Supabase Dashboard → **Storage** → **New bucket**.
2. Názov: `references`.
3. Zapni **Public bucket** (public read) — obrázky sa zobrazujú na webe verejne.
4. Upload z admin časti pôjde cez `SUPABASE_SERVICE_ROLE_KEY` na strane servera
   (viď `lib/supabase.ts`), preto **nie je** potrebné otvárať write cez RLS.

## Skripty

| Skript                 | Popis                                       |
| ---------------------- | ------------------------------------------- |
| `pnpm dev`             | Dev server (Turbopack).                     |
| `pnpm build`           | Produkčný build.                            |
| `pnpm start`           | Spustí produkčný build.                     |
| `pnpm lint`            | ESLint.                                     |
| `pnpm format`          | Prettier — zformátuje projekt.              |
| `pnpm format:check`    | Prettier — len kontrola.                    |
| `pnpm prisma:generate` | Vygeneruje Prisma client (`lib/generated`). |

## Štruktúra projektu

```
rsweld/
├── prisma/
│   └── schema.prisma      # len generator + datasource (bez modelov — fáza 2)
├── prisma.config.ts       # Prisma 7 config (DIRECT_URL pre Migrate)
├── app/
│   ├── layout.tsx         # root layout (header/footer/toaster, lang="sk")
│   ├── page.tsx           # domov (skeleton)
│   ├── cenova-ponuka/     # placeholder
│   ├── kontakt/           # placeholder
│   ├── realizacie/        # placeholder
│   └── api/inquiries/     # POST endpoint (validácia Zod, zatiaľ bez DB)
├── components/
│   ├── ui/                # shadcn/ui komponenty
│   ├── layout/            # header, footer
│   └── shared/            # zdieľané komponenty (fáza 2)
├── lib/
│   ├── prisma.ts          # Prisma client singleton (pg adaptér)
│   ├── supabase.ts        # Supabase klienti (Storage)
│   ├── validations.ts     # Zod schémy (inquirySchema)
│   ├── site.ts            # metadáta webu + navigácia
│   └── generated/         # vygenerovaný Prisma client (git-ignored)
├── .env.example
└── README.md
```

## API

### `POST /api/inquiries`

Validuje vstup cez Zod (`inquirySchema`) a vracia JSON.

- `201 { "success": true }` — validný vstup.
- `422 { "success": false, "fieldErrors": {...} }` — chyba validácie.
- `400 { "success": false, "error": ... }` — nevalidný JSON.

> Fáza 1: **neukladá** do DB ani neodosiela email. Napojenie na Prisma model a
> Resend pribudne vo fáze 2.

Príklad:

```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Ján Novák","email":"jan@example.sk","message":"Záujem o cenovú ponuku na zábradlie.","type":"quote"}'
```

## Poznámky k Prisme 7

Prisma 7 už **nepodporuje** `url` / `directUrl` v `datasource` bloku schémy.
Preto:

- Runtime pripojenie (`PrismaClient`) používa **driver adaptér** `@prisma/adapter-pg`
  s pooled `DATABASE_URL` — viď `lib/prisma.ts`.
- Migrácie čítajú connection string z `prisma.config.ts` (`DIRECT_URL`).
