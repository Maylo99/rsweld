import type { Metadata } from "next";

import { PageHeader, ReadOnlyNotice } from "@/components/admin/page-header";
import { TagManager } from "@/components/admin/tags/tag-manager";
import { loadAdminGallery } from "@/lib/admin/load";
import { requireSession } from "@/lib/auth-server";

export const metadata: Metadata = { title: "Tagy" };

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  await requireSession();

  const { data, readOnlyReason } = await loadAdminGallery();

  return (
    <div>
      <PageHeader
        title="Tagy"
        description="Tagy sú témy, podľa ktorých si návštevník filtruje galériu (napr. Zábradlia, Schodiská). Fotky im priradíte pri nahrávaní, pri úprave fotky alebo hromadne v zozname fotiek."
      />
      <ReadOnlyNotice reason={readOnlyReason} />
      <TagManager data={data} readOnly={Boolean(readOnlyReason)} />
    </div>
  );
}
