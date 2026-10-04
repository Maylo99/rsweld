import { emptyPlacementOrder } from "@/lib/gallery";
import type { GalleryData, PlacementKey } from "@/lib/types";

/**
 * Reads the whole gallery from the database as one snapshot. The gallery is
 * small (tens to a few hundred photos), so three flat queries beat any
 * per-page querying. Callers decide how to handle failure: the public site
 * falls back to seed data, the admin surfaces the error.
 */
export async function fetchGalleryData(): Promise<GalleryData> {
  const { prisma } = await import("@/lib/prisma");

  const [photos, tags, photoTags, placements] = await Promise.all([
    prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.tag.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.photoTag.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.photoPlacement.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const tagOrder: Record<string, string[]> = Object.fromEntries(tags.map((tag) => [tag.id, []]));
  for (const row of photoTags) {
    tagOrder[row.tagId]?.push(row.photoId);
  }

  const placementOrder = emptyPlacementOrder();
  for (const row of placements) {
    placementOrder[row.placement as PlacementKey].push(row.photoId);
  }

  return {
    photos: photos.map((photo) => ({
      id: photo.id,
      title: photo.title,
      description: photo.description ?? undefined,
      imagePath: photo.imagePath,
      imageAlt: photo.imageAlt,
      // tag ids in filter-chip order, so the first one is the "main" tag
      tagIds: tags.filter((tag) => tagOrder[tag.id].includes(photo.id)).map((tag) => tag.id),
      placements: (Object.keys(placementOrder) as PlacementKey[]).filter((placement) =>
        placementOrder[placement].includes(photo.id),
      ),
    })),
    tags: tags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
    tagOrder,
    placementOrder,
  };
}
