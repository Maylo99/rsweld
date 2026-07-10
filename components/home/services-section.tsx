import {
  DropletsIcon,
  FileTextIcon,
  FlameIcon,
  SparklesIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { services } from "@/lib/data/services";
import type { ServiceItem } from "@/lib/types";

const serviceIcons: Record<ServiceItem["icon"], LucideIcon> = {
  quote: FileTextIcon,
  welding: FlameIcon,
  grinding: SparklesIcon,
  cleaning: DropletsIcon,
  assembly: WrenchIcon,
};

/*
 * The five services presented as the actual workflow (steps 1→5).
 */
export function ServicesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24" aria-labelledby="services-heading">
      <AnimatedSection>
        <SectionHeading
          eyebrow="Služby"
          title="Od cenovej ponuky po hotovú montáž"
          description="Celý proces zvládneme pod jednou strechou — bez preposielania medzi dodávateľmi."
        />
      </AnimatedSection>

      <ol className="mt-12 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {services.map((service, index) => {
          const Icon = serviceIcons[service.icon];
          return (
            <li key={service.id}>
              <AnimatedSection
                delay={index * 0.06}
                className="group border-border bg-card hover:border-primary/40 relative h-full rounded-xl border p-5 transition-all hover:shadow-md"
              >
                <span className="text-muted-foreground/60 font-heading absolute top-4 right-5 text-sm font-semibold">
                  0{service.step}
                </span>
                <span className="bg-accent text-accent-foreground inline-flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold">{service.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {service.description}
                </p>
              </AnimatedSection>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
