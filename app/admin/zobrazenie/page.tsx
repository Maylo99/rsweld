import type { Metadata } from "next";

import { ListArranger } from "@/components/admin/arrange/list-arranger";
import { ListNav } from "@/components/admin/arrange/list-nav";
import { ListSelect } from "@/components/admin/arrange/list-select";
import { PageHeader, ReadOnlyNotice } from "@/components/admin/page-header";
import { listKey, parseListKey } from "@/lib/admin/lists";
import { loadAdminGallery } from "@/lib/admin/load";
import { requireSession } from "@/lib/auth-server";
import type { OrderedList } from "@/lib/types";

export const metadata: Metadata = { title: "Zobrazenie na webe" };

export const dynamic = "force-dynamic";

const DEFAULT_LIST: OrderedList = { kind: "placement", placement: "HOME_FEATURED" };

export default async function ArrangePage({
  searchParams,
}: {
  searchParams: Promise<{ zoznam?: string }>;
}) {
  await requireSession();

  const { zoznam } = await searchParams;
  const { data, readOnlyReason } = await loadAdminGallery();

  const requested = parseListKey(zoznam);
  const list =
    requested?.kind === "tag" && !data.tags.some((tag) => tag.id === requested.tagId)
      ? DEFAULT_LIST
      : (requested ?? DEFAULT_LIST);

  return (
    <div>
      <PageHeader
        title="Zobrazenie na webe"
        description="Vyberte časť webu a určte, ktoré fotky sa v nej zobrazia a v akom poradí. Každý zoznam má vlastné poradie — zmena v jednom neovplyvní ostatné."
      />
      <ReadOnlyNotice reason={readOnlyReason} />

      <div className="mt-6 lg:hidden">
        <ListSelect data={data} active={list} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <ListNav data={data} active={list} />
          </div>
        </aside>
        <section className="border-border bg-card min-w-0 rounded-2xl border p-4 sm:p-6">
          <ListArranger
            key={listKey(list)}
            data={data}
            list={list}
            readOnly={Boolean(readOnlyReason)}
          />
        </section>
      </div>
    </div>
  );
}
