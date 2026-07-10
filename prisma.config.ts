import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer auto-loads `.env`; do it explicitly so Migrate/introspect
// commands pick up the connection string. No-op if `.env` is absent.
loadEnv();

/**
 * Prisma 7 configuration.
 *
 * Runtime connections (PrismaClient) go through the driver adapter in
 * `lib/prisma.ts`, which uses the pooled `DATABASE_URL` (Supabase pgbouncer).
 *
 * Migrate / introspect commands run here and MUST use a *direct* connection
 * (no pgbouncer), so `datasource.url` points at `DIRECT_URL`. The empty-string
 * fallback keeps `prisma generate` working before a database is configured.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});
