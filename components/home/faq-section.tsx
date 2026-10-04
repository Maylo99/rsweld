import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { AnimatedSection } from "@/components/shared/animated-section";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { faqItems } from "@/lib/data/faq";

/*
 * Short FAQ teaser (featured questions only); the full list lives on
 * `/caste-otazky`.
 */
export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:py-24" aria-labelledby="faq-heading">
      <AnimatedSection>
        <SectionHeading id="faq-heading" eyebrow="FAQ" title="Časté otázky" align="center" />
      </AnimatedSection>

      <AnimatedSection delay={0.08} className="mt-10">
        <FaqAccordion items={faqItems.filter((item) => item.featured)} openFirst />
        <div className="mt-8 text-center">
          <Link
            href="/caste-otazky"
            className="text-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline"
          >
            Všetky otázky a odpovede
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </div>
      </AnimatedSection>
    </section>
  );
}
