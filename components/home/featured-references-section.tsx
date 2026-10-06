import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { DisplayPhoto } from "@/lib/types";

type FeaturedReferencesSectionProps = {
  /** Photos the administrator placed in "Vybrané projekty", in their order. */
  photos: DisplayPhoto[];
};

export function FeaturedReferencesSection({ photos }: FeaturedReferencesSectionProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <section
      id="vybrane-projekty"
      className="bg-muted/60 scroll-mt-16"
      aria-labelledby="featured-references-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <AnimatedSection className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Realizácie"
            title="Vybrané projekty"
            description="Ukážka toho, čo z nerezu vyrábame - od zábradlí po priemyselné celky."
          />
          <Button variant="outline" nativeButton={false} render={<Link href="/galeria" />}>
            Celá galéria
            <ArrowRightIcon aria-hidden />
          </Button>
        </AnimatedSection>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => {
            const mainTag = photo.tags[0];
            return (
              <AnimatedSection key={photo.id} delay={index * 0.06}>
                <Link
                  href={mainTag ? `/galeria?tag=${mainTag.slug}` : "/galeria"}
                  className="group border-border bg-card focus-visible:ring-ring block h-full overflow-hidden rounded-xl border transition-all outline-none hover:shadow-lg focus-visible:ring-2"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={photo.imagePath}
                      alt={photo.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    {mainTag ? (
                      <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                        {mainTag.name}
                      </p>
                    ) : null}
                    <h3 className="mt-1.5 font-semibold">{photo.title}</h3>
                    {photo.description ? (
                      <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
                        {photo.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
