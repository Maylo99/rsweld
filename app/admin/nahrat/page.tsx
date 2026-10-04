import type { Metadata } from "next";
import { ImageOff } from "lucide-react";

import { PageHeader, ReadOnlyNotice } from "@/components/admin/page-header";
import { PhotoUploader } from "@/components/admin/upload/photo-uploader";
import { loadAdminGallery } from "@/lib/admin/load";
import { requireSession } from "@/lib/auth-server";
import { isStorageConfigured } from "@/lib/config";
import { PLACEMENTS, type PlacementKey } from "@/lib/types";

export const metadata: Metadata = { title: "Nahrať fotky" };

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  await requireSession();

  const { data, readOnlyReason } = await loadAdminGallery();
  const storageReady = isStorageConfigured();
  const localUploads = !storageReady && process.env.NODE_ENV === "development";

  const occupied = Object.fromEntries(
    PLACEMENTS.map((placement) => [placement, data.placementOrder[placement].length]),
  ) as Record<PlacementKey, number>;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Nahrať fotky"
        description="Vyberte fotky, pomenujte ich, pridajte tagy a zvoľte, kde sa majú na webe zobraziť."
      />

      <ReadOnlyNotice reason={readOnlyReason} />

      {!readOnlyReason && !storageReady ? (
        <p className="border-border bg-card text-muted-foreground mt-4 flex gap-3 rounded-xl border p-4 text-sm">
          <ImageOff className="text-primary-soft mt-0.5 size-5 shrink-0" />
          <span>
            {localUploads
              ? "Úložisko Supabase nie je nastavené — pri vývoji sa fotky ukladajú lokálne do public/uploads."
              : "Úložisko fotiek nie je nastavené (chýbajú Supabase prístupy), takže nové fotky sa nepodarí nahrať."}
          </span>
        </p>
      ) : null}

      <PhotoUploader
        tags={data.tags}
        occupied={occupied}
        disabled={Boolean(readOnlyReason) || (!storageReady && !localUploads)}
      />
    </div>
  );
}
