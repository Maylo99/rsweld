import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma";

/**
 * Prisma 7 client singleton.
 *
 * Uses the `pg` driver adapter against Supabase's *pooled* connection
 * (`DATABASE_URL`, pgbouncer). The direct connection (`DIRECT_URL`) is only
 * used by Migrate via `prisma.config.ts`.
 *
 * The singleton guards against exhausting DB connections during Next.js dev
 * hot-reload, which re-evaluates modules on every change.
 *
 * NOTE: No models are defined yet (phase 1). The client is import-ready but
 * unused until the schema lands in the next phase.
 */
const createPrismaClient = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
