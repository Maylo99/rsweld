import "dotenv/config";

import { referencesSeed } from "../lib/data/references";
import { testimonialsSeed } from "../lib/data/testimonials";
import { prisma } from "../lib/prisma";

/**
 * Idempotent seed: upserts by stable ids, safe to re-run.
 * Run with `pnpm db:seed` (requires DATABASE_URL in .env).
 */
async function main() {
  for (const reference of referencesSeed) {
    const { id, description, ...data } = reference;
    await prisma.reference.upsert({
      where: { id },
      create: { id, description: description ?? null, ...data },
      update: { description: description ?? null, ...data },
    });
  }
  console.log(`Seeded ${referencesSeed.length} references.`);

  for (const testimonial of testimonialsSeed) {
    const { id, company, ...data } = testimonial;
    await prisma.testimonial.upsert({
      where: { id },
      create: { id, company: company ?? null, ...data },
      update: { company: company ?? null, ...data },
    });
  }
  console.log(`Seeded ${testimonialsSeed.length} testimonials.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
