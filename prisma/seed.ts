import "dotenv/config";

import { gallerySeed } from "../lib/data/gallery";
import { testimonialsSeed } from "../lib/data/testimonials";
import { prisma } from "../lib/prisma";

/**
 * Idempotent seed: upserts by stable ids, safe to re-run. Gallery orders are
 * only written for photos/tags the seed itself owns, so re-seeding never
 * reshuffles what the administrator arranged for their own uploads.
 * Run with `pnpm db:seed` (requires DATABASE_URL in .env).
 */
async function main() {
  const { photos, tags, tagOrder, placementOrder } = gallerySeed;

  for (const [index, tag] of tags.entries()) {
    await prisma.tag.upsert({
      where: { id: tag.id },
      create: { ...tag, sortOrder: index + 1 },
      update: { name: tag.name, slug: tag.slug },
    });
  }

  for (const photo of photos) {
    const data = {
      title: photo.title,
      description: photo.description ?? null,
      imagePath: photo.imagePath,
      imageAlt: photo.imageAlt,
    };
    await prisma.photo.upsert({
      where: { id: photo.id },
      create: { id: photo.id, ...data },
      update: data,
    });
  }

  for (const [tagId, photoIds] of Object.entries(tagOrder)) {
    for (const [index, photoId] of photoIds.entries()) {
      await prisma.photoTag.upsert({
        where: { photoId_tagId: { photoId, tagId } },
        create: { photoId, tagId, sortOrder: index + 1 },
        update: {},
      });
    }
  }

  for (const [placement, photoIds] of Object.entries(placementOrder)) {
    for (const [index, photoId] of photoIds.entries()) {
      await prisma.photoPlacement.upsert({
        where: {
          photoId_placement: { photoId, placement: placement as keyof typeof placementOrder },
        },
        create: {
          photoId,
          placement: placement as keyof typeof placementOrder,
          sortOrder: index + 1,
        },
        update: {},
      });
    }
  }
  console.log(`Seeded ${photos.length} photos and ${tags.length} tags.`);

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
