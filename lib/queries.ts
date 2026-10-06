import { cache } from "react";

import { isDatabaseConfigured } from "@/lib/config";
import { gallerySeed } from "@/lib/data/gallery";
import { placementPhotos, publicGallery } from "@/lib/gallery";
import { fetchGalleryData } from "@/lib/gallery-data";
import { placementConfig } from "@/lib/placements";
import { applySamplePhotosMode } from "@/lib/sample-photos";
import type { DisplayPhoto, GalleryData, PlacementKey } from "@/lib/types";

/**
 * Content queries with graceful degradation: read from the database when
 * configured, otherwise fall back to the static seed data. This keeps the
 * site fully functional before database credentials are provisioned and
 * during local development without a DB.
 */

/** One snapshot per request, shared by every section that renders photos. */
const getGalleryData = cache(async (): Promise<GalleryData> =>
  applySamplePhotosMode(await loadGalleryData()),
);

async function loadGalleryData(): Promise<GalleryData> {
  if (!isDatabaseConfigured()) {
    return gallerySeed;
  }

  try {
    return await fetchGalleryData();
  } catch (error) {
    console.error("getGalleryData: database read failed, using seed data", error);
    return gallerySeed;
  }
}

/** Data for the /galeria page (gallery order + per-tag orders). */
export async function getGallery() {
  return publicGallery(await getGalleryData());
}

/** Photos the administrator put into a website section, in their order. */
export async function getPlacementPhotos(placement: PlacementKey): Promise<DisplayPhoto[]> {
  return placementPhotos(await getGalleryData(), placement, placementConfig[placement].limit);
}
