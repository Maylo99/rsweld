import Link from "next/link";
import { Upload } from "lucide-react";

import { PageHeader, ReadOnlyNotice } from "@/components/admin/page-header";
import { PhotoLibrary } from "@/components/admin/photos/photo-library";
import { StatusToast } from "@/components/admin/status-toast";
import { Button } from "@/components/ui/button";
import { loadAdminGallery } from "@/lib/admin/load";
import { requireSession } from "@/lib/auth-server";

export const metadata = { title: "Fotky" };

// The session cookie already forces dynamic rendering; stated for clarity.
export const dynamic = "force-dynamic";

export default async function AdminPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ stav?: string }>;
}) {
  await requireSession();

  const { stav } = await searchParams;
  const { data, readOnlyReason } = await loadAdminGallery();

  return (
    <div>
      <StatusToast status={stav} />

      <PageHeader
        title="Fotky"
        description="Všetky nahraté fotky. Kliknutím fotku upravíte, cez štvorček v rohu označíte viac fotiek naraz a hromadne im pridáte tag alebo ich zobrazíte na webe."
        actions={
          readOnlyReason ? (
            <Button size="lg" disabled>
              <Upload />
              Nahrať fotky
            </Button>
          ) : (
            <Button size="lg" nativeButton={false} render={<Link href="/admin/nahrat" />}>
              <Upload />
              Nahrať fotky
            </Button>
          )
        }
      />

      <ReadOnlyNotice reason={readOnlyReason} />
      <PhotoLibrary data={data} readOnly={Boolean(readOnlyReason)} />
    </div>
  );
}
