import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PageHero } from "@/components/shared/page-hero";
import { getGallery } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Galéria",
  description:
    "Galéria realizácií RSweld - zábradlia z nerezu a ocele, schodiská, terasy, dizajnové kusy a priemyselné komponenty. Považská Bystrica a okolie.",
  path: "/galeria",
});

export const revalidate = 3600;

export default async function GalleryPage() {
  const { photos, tags } = await getGallery();

  return (
    <>
      <PageHero
        id="gallery-heading"
        eyebrow="Galéria"
        title="Naša práca z nerezu a ocele"
        description="Vyberte tému alebo si prezrite všetko - každá zákazka je vyrobená na mieru."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-label="Fotografie">
        <GalleryGrid photos={photos} tags={tags} />
      </section>
    </>
  );
}
