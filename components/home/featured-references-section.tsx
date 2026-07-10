import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { referenceCategoryLabels, type ReferenceItem } from "@/lib/types";

type FeaturedReferencesSectionProps = {
  references: ReferenceItem[];
};

export function FeaturedReferencesSection({ references }: FeaturedReferencesSectionProps) {
  if (references.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/60" aria-labelledby="featured-references-heading">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <AnimatedSection className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Realizácie"
            title="Vybrané projekty"
            description="Ukážka toho, čo z nerezu vyrábame — od zábradlí po priemyselné celky."
          />
          <Button variant="outline" render={<Link href="/realizacie" />}>
            Všetky realizácie
            <ArrowRightIcon aria-hidden />
          </Button>
        </AnimatedSection>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {references.map((reference, index) => (
            <AnimatedSection key={reference.id} delay={index * 0.06}>
              <Link
                href="/realizacie"
                className="group border-border bg-card focus-visible:ring-ring block h-full overflow-hidden rounded-xl border transition-all outline-none hover:shadow-lg focus-visible:ring-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={reference.imagePath}
                    alt={reference.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                    {referenceCategoryLabels[reference.category]}
                  </p>
                  <h3 className="mt-1.5 font-semibold">{reference.title}</h3>
                  {reference.description ? (
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
                      {reference.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
