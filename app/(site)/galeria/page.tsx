import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { getGallery } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Galéria",
  description:
    "Galéria realizácií RSweld — nerezové zábradlia, schodiská, terasy, dizajnové kusy a priemyselné komponenty. Považská Bystrica a okolie.",
  alternates: { canonical: "/galeria" },
};

export const revalidate = 3600;

export default async function GalleryPage() {
  const { photos, tags } = await getGallery();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading
        eyebrow="Galéria"
        title="Naša práca z nerezu"
        description="Vyberte tému alebo si prezrite všetko — každá zákazka je vyrobená na mieru."
      />
      <div className="mt-10">
        <GalleryGrid photos={photos} tags={tags} />
      </div>
    </section>
  );
}
