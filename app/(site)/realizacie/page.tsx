import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { getReferences } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Realizácie",
  description:
    "Galéria realizácií RSweld — nerezové zábradlia, francúzske balkóny, dizajnové stolíky, dopravníky a priemyselné komponenty. Považská Bystrica a okolie.",
};

export const revalidate = 3600;

export default async function ReferencesPage() {
  const references = await getReferences();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading
        eyebrow="Realizácie"
        title="Naša práca z nerezu"
        description="Vyberte kategóriu alebo si prezrite všetko — každá zákazka je vyrobená na mieru."
      />
      <div className="mt-10">
        <GalleryGrid references={references} />
      </div>
    </section>
  );
}
