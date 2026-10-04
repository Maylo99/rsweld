import { cache } from "react";

import { isDatabaseConfigured } from "@/lib/config";
import { gallerySeed } from "@/lib/data/gallery";
import { testimonialsSeed } from "@/lib/data/testimonials";
import { placementPhotos, publicGallery } from "@/lib/gallery";
import { fetchGalleryData } from "@/lib/gallery-data";
import { placementConfig } from "@/lib/placements";
import type { DisplayPhoto, GalleryData, PlacementKey, TestimonialItem } from "@/lib/types";

/**
 * Content queries with graceful degradation: read from the database when
 * configured, otherwise fall back to the static seed data. This keeps the
 * site fully functional before Supabase credentials are provisioned and
 * during local development without a DB.
 */

/** One snapshot per request, shared by every section that renders photos. */
const getGalleryData = cache(async (): Promise<GalleryData> => {
  if (!isDatabaseConfigured()) {
    return gallerySeed;
  }

  try {
    return await fetchGalleryData();
  } catch (error) {
    console.error("getGalleryData: database read failed, using seed data", error);
    return gallerySeed;
  }
});

/** Data for the /galeria page (gallery order + per-tag orders). */
export async function getGallery() {
  return publicGallery(await getGalleryData());
}

/** Photos the administrator put into a website section, in their order. */
export async function getPlacementPhotos(placement: PlacementKey): Promise<DisplayPhoto[]> {
  return placementPhotos(await getGalleryData(), placement, placementConfig[placement].limit);
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
  if (!isDatabaseConfigured()) {
    return testimonialsSeed;
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((row) => ({
      id: row.id,
      author: row.author,
      company: row.company ?? undefined,
      quote: row.quote,
      sortOrder: row.sortOrder,
    }));
  } catch (error) {
    console.error("getTestimonials: database read failed, using seed data", error);
    return testimonialsSeed;
  }
}
