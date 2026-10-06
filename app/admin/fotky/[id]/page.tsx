import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ReadOnlyNotice } from "@/components/admin/page-header";
import { PhotoEditForm } from "@/components/admin/photos/photo-edit-form";
import { loadAdminGallery } from "@/lib/admin/load";
import { requireSession } from "@/lib/auth-server";
import { listHref } from "@/lib/admin/lists";
import { placementConfig } from "@/lib/placements";
import { PLACEMENTS, type PlacementKey } from "@/lib/types";

export const metadata: Metadata = { title: "Úprava fotky" };

export const dynamic = "force-dynamic";

export default async function EditPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();

  const { id } = await params;
  const { data, readOnlyReason } = await loadAdminGallery();
  const photo = data.photos.find((item) => item.id === id);

  if (!photo) {
    notFound();
  }

  const occupied = Object.fromEntries(
    PLACEMENTS.map((placement) => [
      placement,
      data.placementOrder[placement].filter((photoId) => photoId !== id).length,
    ]),
  ) as Record<PlacementKey, number>;

  const positions = [
    ...photo.placements.map((placement) => ({
      label: placementConfig[placement].shortLabel,
      position: data.placementOrder[placement].indexOf(id) + 1,
      total: data.placementOrder[placement].length,
      href: listHref({ kind: "placement", placement }),
    })),
    ...data.tags
      .filter((tag) => photo.tagIds.includes(tag.id))
      .map((tag) => ({
        label: `Galéria - tag „${tag.name}“`,
        position: (data.tagOrder[tag.id] ?? []).indexOf(id) + 1,
        total: (data.tagOrder[tag.id] ?? []).length,
        href: listHref({ kind: "tag", tagId: tag.id }),
      })),
  ];

  return (
    <div>
      <Link
        href="/admin"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        Späť na fotky
      </Link>

      <h1 className="font-heading mt-3 text-2xl font-semibold">Úprava fotky</h1>
      <ReadOnlyNotice reason={readOnlyReason} />

      <div className="mt-6">
        <PhotoEditForm
          photo={photo}
          tags={data.tags}
          occupied={occupied}
          positions={positions}
          readOnly={Boolean(readOnlyReason)}
        />
      </div>
    </div>
  );
}
