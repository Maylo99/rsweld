import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma";

/**
 * Prisma 7 client singleton (Railway Postgres via the `pg` driver adapter).
 *
 * At runtime it uses `DATABASE_URL` - on Railway the private-network URL
 * (`postgres.railway.internal`). The private network is not reachable while
 * the image is being built, so `next build` (which prerenders the ISR pages)
 * uses `DIRECT_URL` - the public TCP proxy URL, also used by Migrate.
 *
 * The singleton guards against exhausting DB connections during Next.js dev
 * hot-reload, which re-evaluates modules on every change.
 */
function connectionString(): string | undefined {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return process.env.DIRECT_URL || process.env.DATABASE_URL;
  }

  return process.env.DATABASE_URL;
}

const createPrismaClient = () => {
  const adapter = new PrismaPg({ connectionString: connectionString() });

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
