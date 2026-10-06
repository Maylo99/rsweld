import {
  PLACEMENTS,
  type DisplayPhoto,
  type GalleryData,
  type PlacementKey,
  type TagItem,
} from "@/lib/types";

/**
 * Pure helpers over a `GalleryData` snapshot - shared by the public site and
 * the admin, safe to import from client components.
 */

export function emptyPlacementOrder(): Record<PlacementKey, string[]> {
  return Object.fromEntries(PLACEMENTS.map((placement) => [placement, []])) as unknown as Record<
    PlacementKey,
    string[]
  >;
}

/** Resolves a photo's tag ids to tags, in filter-chip order. */
export function toDisplayPhoto(data: GalleryData, photoId: string): DisplayPhoto | null {
  const photo = data.photos.find((item) => item.id === photoId);

  if (!photo) {
    return null;
  }

  return {
    id: photo.id,
    title: photo.title,
    description: photo.description,
    imagePath: photo.imagePath,
    imageAlt: photo.imageAlt,
    tags: data.tags.filter((tag) => photo.tagIds.includes(tag.id)),
  };
}

function resolve(data: GalleryData, ids: string[]): DisplayPhoto[] {
  return ids.map((id) => toDisplayPhoto(data, id)).filter((photo) => photo !== null);
}

/** Photos of one website section, in that section's order, capped at its limit. */
export function placementPhotos(
  data: GalleryData,
  placement: PlacementKey,
  limit?: number,
): DisplayPhoto[] {
  const ids = data.placementOrder[placement];
  return resolve(data, limit === undefined ? ids : ids.slice(0, limit));
}

export type PublicGalleryTag = TagItem & { photoIds: string[] };

/**
 * The /galeria page: photos in gallery order, plus every tag that has at least
 * one gallery photo, each with its own photo order.
 */
export function publicGallery(data: GalleryData): {
  photos: DisplayPhoto[];
  tags: PublicGalleryTag[];
} {
  const galleryIds = data.placementOrder.GALLERY;
  const inGallery = new Set(galleryIds);

  const tags = data.tags
    .map((tag) => ({
      ...tag,
      photoIds: (data.tagOrder[tag.id] ?? []).filter((id) => inGallery.has(id)),
    }))
    .filter((tag) => tag.photoIds.length > 0);

  return { photos: resolve(data, galleryIds), tags };
}

/** URL-safe slug from a Slovak name ("Detaily zvarov" → "detaily-zvarov"). */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
