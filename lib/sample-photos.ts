import { samplePhotosMode } from "@/lib/config";
import { gallerySeed } from "@/lib/data/gallery";
import { PLACEMENTS, type GalleryData, type PlacementKey } from "@/lib/types";

/**
 * Sample photos = the seed set in `lib/data/gallery.ts` (`public/references`).
 * `SAMPLE_PHOTOS` decides whether the public site shows them regardless of
 * what the database holds:
 * - unset: as loaded (database, or seed without a database),
 * - `show`: sample photos are appended after the real ones in every list,
 * - `hide`: sample photos are removed - including rows created by
 *   `pnpm db:seed`, which keep the seed ids.
 * The admin always works with the raw database content.
 */
export function applySamplePhotosMode(data: GalleryData): GalleryData {
  switch (samplePhotosMode()) {
    case "show":
      return withSamplePhotos(data);
    case "hide":
      return withoutSamplePhotos(data);
    default:
      return data;
  }
}

const sampleIds = new Set(gallerySeed.photos.map((photo) => photo.id));

function mapPlacements(
  data: GalleryData,
  map: (ids: string[], placement: PlacementKey) => string[],
): Record<PlacementKey, string[]> {
  return Object.fromEntries(
    PLACEMENTS.map((placement) => [placement, map(data.placementOrder[placement], placement)]),
  ) as Record<PlacementKey, string[]>;
}

function withoutSamplePhotos(data: GalleryData): GalleryData {
  const keep = (id: string) => !sampleIds.has(id);

  return {
    photos: data.photos.filter((photo) => keep(photo.id)),
    tags: data.tags,
    tagOrder: Object.fromEntries(
      Object.entries(data.tagOrder).map(([tagId, ids]) => [tagId, ids.filter(keep)]),
    ),
    placementOrder: mapPlacements(data, (ids) => ids.filter(keep)),
  };
}

function withSamplePhotos(data: GalleryData): GalleryData {
  const present = new Set(data.photos.map((photo) => photo.id));
  const extra = gallerySeed.photos.filter((photo) => !present.has(photo.id));

  if (extra.length === 0) {
    return data;
  }

  const extraIds = new Set(extra.map((photo) => photo.id));
  const onlyExtra = (ids: string[]) => ids.filter((id) => extraIds.has(id));

  // Seed tags merge into an existing tag with the same id or slug, so a
  // "Zábradlia" filter created in the admin also lists the sample railings.
  const tags = [...data.tags];
  const tagIdMap = new Map<string, string>();

  for (const seedTag of gallerySeed.tags) {
    const existing = tags.find((tag) => tag.id === seedTag.id || tag.slug === seedTag.slug);

    if (!existing) {
      tags.push(seedTag);
    }

    tagIdMap.set(seedTag.id, existing?.id ?? seedTag.id);
  }

  const tagOrder = { ...data.tagOrder };

  for (const [seedTagId, ids] of Object.entries(gallerySeed.tagOrder)) {
    const tagId = tagIdMap.get(seedTagId) ?? seedTagId;
    tagOrder[tagId] = [...(tagOrder[tagId] ?? []), ...onlyExtra(ids)];
  }

  return {
    photos: [
      ...data.photos,
      ...extra.map((photo) => ({
        ...photo,
        tagIds: photo.tagIds.map((id) => tagIdMap.get(id) ?? id),
      })),
    ],
    tags,
    tagOrder,
    placementOrder: mapPlacements(data, (ids, placement) => [
      ...ids,
      ...onlyExtra(gallerySeed.placementOrder[placement]),
    ]),
  };
}
