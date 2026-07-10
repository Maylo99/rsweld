import { QuoteIcon } from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";
import type { TestimonialItem } from "@/lib/types";

type TestimonialsSectionProps = {
  testimonials: TestimonialItem[];
};

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/60" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <AnimatedSection>
          <SectionHeading eyebrow="Referencie" title="Čo hovoria zákazníci" align="center" />
        </AnimatedSection>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={testimonial.id} delay={index * 0.08}>
              <figure className="border-border bg-card h-full rounded-xl border p-6">
                <QuoteIcon className="text-primary size-6" aria-hidden />
                <blockquote className="mt-4 text-sm leading-relaxed">
                  „{testimonial.quote}“
                </blockquote>
                <figcaption className="text-muted-foreground mt-4 text-sm">
                  <span className="text-foreground font-medium">{testimonial.author}</span>
                  {testimonial.company ? <> · {testimonial.company}</> : null}
                </figcaption>
              </figure>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
