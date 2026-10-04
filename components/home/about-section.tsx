import { CheckIcon } from "lucide-react";
import Image from "next/image";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { siteConfig } from "@/lib/site";
import type { DisplayPhoto } from "@/lib/types";

/*
 * Short, personal about section with trust points.
 */
// TODO: verify with client (story, years of experience, exact collaborations)
const trustPoints = [
  "Práca podľa výkresovej dokumentácie aj vlastného návrhu",
  "Spolupráca so strojárskou firmou IMC na priemyselných zákazkách",
  "Dizajnové kusy — vrátane stolíkov pre Red Bull",
  "Doprava a montáž priamo na mieste realizácie",
];

/** Shown when the administrator has not picked a photo for this section. */
const fallbackPhoto = {
  imagePath: "/references/tig-weld-detail.jpg",
  imageAlt: "Detail TIG zvaru nerezovej ocele z dielne RSweld",
};

export function AboutSection({ photo }: { photo?: DisplayPhoto }) {
  const { imagePath, imageAlt } = photo ?? fallbackPhoto;

  return (
    <section
      id="o-nas"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:py-24"
      aria-labelledby="about-heading"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <AnimatedSection>
          <SectionHeading eyebrow="O nás" title="Remeslo, na ktoré sa dá spoľahnúť" />
          <p className="text-muted-foreground mt-6 leading-relaxed">
            RSweld vedie {siteConfig.owner} z Považskej Bystrice. Špecializujeme sa na zváranie
            nerezovej ocele — od zábradlí pre rodinné domy až po komponenty pre strojársky a
            vodárenský priemysel. Každú zákazku riešime na mieru: podľa vašej výkresovej
            dokumentácie, alebo prídeme, zameriame a navrhneme riešenie spolu.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Záleží nám na detailoch, ktoré vidno aj po rokoch — čisté zvary, precízne brúsenie a
            chemické ošetrenie povrchu, vďaka ktorému nerez zostane nerezom.
          </p>
          <ul className="mt-8 space-y-3">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <span className="bg-accent text-accent-foreground mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                  <CheckIcon className="size-3.5" aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={imagePath}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div
            aria-hidden
            className="border-primary absolute -bottom-3 -left-3 -z-10 h-full w-full rounded-2xl border-2"
          />
        </AnimatedSection>
      </div>
    </section>
  );
}
