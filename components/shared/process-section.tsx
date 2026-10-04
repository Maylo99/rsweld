import {
  ClipboardListIcon,
  FileCheckIcon,
  FlameIcon,
  HandshakeIcon,
  RulerIcon,
  type LucideIcon,
} from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { processSteps } from "@/lib/data/process";
import type { ProcessStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const stepIcons: Record<ProcessStep["icon"], LucideIcon> = {
  inquiry: ClipboardListIcon,
  measure: RulerIcon,
  quote: FileCheckIcon,
  workshop: FlameIcon,
  handover: HandshakeIcon,
};

/*
 * "How a job runs" timeline — vertical on mobile, horizontal from `lg` up,
 * with a connecting line behind the step markers.
 */
export function ProcessSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("mx-auto max-w-6xl px-4 py-20 sm:py-24", className)}
      aria-labelledby="process-heading"
    >
      <AnimatedSection>
        <SectionHeading
          id="process-heading"
          eyebrow="Ako prebieha zákazka"
          title="Od prvého telefonátu po hotové dielo"
          description="Jasný postup bez prekvapení. Celý čas máte jedného človeka, ktorý zákazku pozná od zamerania až po montáž."
        />
      </AnimatedSection>

      <ol className="relative mt-12 grid list-none gap-8 lg:grid-cols-5 lg:gap-6">
        {/* Connecting line: vertical on mobile, horizontal on desktop */}
        <span
          aria-hidden
          className="bg-border absolute top-5 bottom-5 left-5 w-px lg:top-5 lg:right-[10%] lg:bottom-auto lg:left-[10%] lg:h-px lg:w-auto"
        />
        {processSteps.map((step, index) => {
          const Icon = stepIcons[step.icon];
          return (
            <li key={step.id} className="relative">
              <AnimatedSection
                delay={index * 0.06}
                className="flex gap-4 lg:flex-col lg:items-center lg:text-center"
              >
                <span className="bg-primary text-primary-foreground ring-background relative flex size-10 shrink-0 items-center justify-center rounded-full ring-8">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-muted-foreground font-heading text-xs font-semibold tracking-wide uppercase">
                    Krok {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  <p className="bg-accent text-accent-foreground mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {step.duration}
                  </p>
                </div>
              </AnimatedSection>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
