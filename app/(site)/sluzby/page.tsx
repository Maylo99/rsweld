import {
  ArrowRightIcon,
  DropletsIcon,
  FlameIcon,
  PaintRollerIcon,
  RulerIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaSection } from "@/components/home/cta-section";
import { AnimatedSection } from "@/components/shared/animated-section";
import { PageHero, PageHeroPhoneCard } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { craftServices } from "@/lib/data/offer";
import type { CraftService } from "@/lib/types";

export const metadata: Metadata = {
  title: "Služby",
  description:
    "Zameranie, delenie materiálu, zváranie nerezu a ocele (TIG, MIG/MAG), brúsenie, chemické čistenie, zinkovanie, povrchová úprava a montáž - zábradlia, konštrukcie aj priemyselné komponenty na mieru.",
};

const craftIcons: Record<CraftService["icon"], LucideIcon> = {
  measure: RulerIcon,
  cutting: ScissorsIcon,
  welding: FlameIcon,
  grinding: SparklesIcon,
  cleaning: DropletsIcon,
  galvanizing: ShieldCheckIcon,
  finishing: PaintRollerIcon,
  assembly: WrenchIcon,
};

/** "Mám záujem" link to the inquiry form; the service name is announced to screen readers. */
function InterestLink({ service }: { service: string }) {
  return (
    <Link
      href="/kontakt#dopyt"
      className="text-primary mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold hover:underline"
    >
      Mám záujem<span className="sr-only"> - {service}</span>
      <ArrowRightIcon className="size-4" aria-hidden />
    </Link>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        id="services-heading"
        eyebrow="Služby"
        title="Čo pre vás vyrobíme"
        description="Od zamerania cez výrobu v dielni až po montáž u vás - zábradlia, konštrukcie aj priemyselné komponenty z nerezu a ocele."
        aside={<PageHeroPhoneCard label="Poradíme telefonicky" />}
      />

      <section aria-labelledby="crafts-heading">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <AnimatedSection>
            <SectionHeading
              id="crafts-heading"
              eyebrow="Čo pre vás urobíme"
              title="Celá výroba pod jednou strechou"
              description="Od delenia materiálu po hotovú montáž - všetko, čo vaša zákazka potrebuje, zabezpečíme za vás."
            />
          </AnimatedSection>

          <ul className="mt-12 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {craftServices.map((service, index) => {
              const Icon = craftIcons[service.icon];
              return (
                <li key={service.id}>
                  <AnimatedSection
                    delay={(index % 4) * 0.06}
                    className="border-border bg-card hover:border-primary/40 flex h-full flex-col rounded-xl border p-5 transition-all hover:shadow-md"
                  >
                    <span className="bg-accent text-accent-foreground inline-flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">{service.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {service.description}
                    </p>
                    <InterestLink service={service.title} />
                  </AnimatedSection>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
