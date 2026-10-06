import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PageHero } from "@/components/shared/page-hero";
import { getGallery } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Galéria",
  description:
    "Galéria realizácií RSweld - nerezové zábradlia, schodiská, terasy, dizajnové kusy a priemyselné komponenty. Považská Bystrica a okolie.",
  alternates: { canonical: "/galeria" },
};

export const revalidate = 3600;

export default async function GalleryPage() {
  const { photos, tags } = await getGallery();

  return (
    <>
      <PageHero
        id="gallery-heading"
        eyebrow="Galéria"
        title="Naša práca z nerezu"
        description="Vyberte tému alebo si prezrite všetko - každá zákazka je vyrobená na mieru."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-label="Fotografie">
        <GalleryGrid photos={photos} tags={tags} />
      </section>
    </>
  );
}
