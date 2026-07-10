import { ChevronDownIcon } from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { faqItems } from "@/lib/data/faq";

/*
 * FAQ built on native <details>/<summary>: accessible, zero JS.
 */
export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:py-24" aria-labelledby="faq-heading">
      <AnimatedSection>
        <SectionHeading eyebrow="FAQ" title="Časté otázky" align="center" />
      </AnimatedSection>

      <AnimatedSection delay={0.08} className="mt-10 space-y-3">
        {faqItems.map((item) => (
          <details
            key={item.id}
            className="group border-border bg-card open:border-primary/40 rounded-xl border transition-colors"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDownIcon
                className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="text-muted-foreground px-5 pb-5 text-sm leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </AnimatedSection>
    </section>
  );
}
