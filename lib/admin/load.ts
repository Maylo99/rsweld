import { loadGallery } from "@/lib/admin/gallery";
import { isDatabaseConfigured } from "@/lib/config";
import { gallerySeed } from "@/lib/data/gallery";
import type { GalleryData } from "@/lib/types";

/**
 * Data for admin pages. Without a working database the admin still renders
 * (seed content, read-only) and explains why nothing can be saved.
 */
export async function loadAdminGallery(): Promise<{
  data: GalleryData;
  readOnlyReason: string | null;
}> {
  if (!isDatabaseConfigured()) {
    return {
      data: gallerySeed,
      readOnlyReason:
        "Databáza nie je pripojená, takže sa zobrazujú ukážkové dáta a zmeny sa nedajú uložiť. Doplňte DATABASE_URL do .env a spustite pnpm db:migrate && pnpm db:seed.",
    };
  }

  try {
    return { data: await loadGallery(), readOnlyReason: null };
  } catch (error) {
    console.error("loadAdminGallery: database read failed", error);
    return {
      data: gallerySeed,
      readOnlyReason:
        "Databázu sa nepodarilo načítať, zobrazujú sa ukážkové dáta. Skontrolujte pripojenie a skúste stránku obnoviť.",
    };
  }
}
