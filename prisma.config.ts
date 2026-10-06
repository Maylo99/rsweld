import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer auto-loads `.env`; do it explicitly so Migrate/introspect
// commands pick up the connection string. No-op if `.env` is absent.
loadEnv();

/**
 * Prisma 7 configuration.
 *
 * Runtime connections (PrismaClient) go through the driver adapter in
 * `lib/prisma.ts`.
 *
 * Migrate / introspect commands run here. On Railway they run during the build,
 * where the private network is unreachable, so `DIRECT_URL` (the public TCP
 * proxy URL) wins over `DATABASE_URL`. Locally a single `DATABASE_URL` is
 * enough. The empty-string fallback keeps `prisma generate` working before a
 * database is configured.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
