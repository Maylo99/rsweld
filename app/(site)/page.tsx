import { AboutSection } from "@/components/home/about-section";
import { CtaSection } from "@/components/home/cta-section";
import { FaqSection } from "@/components/home/faq-section";
import { FeaturedReferencesSection } from "@/components/home/featured-references-section";
import { Hero } from "@/components/home/hero";
import { ServicesSection } from "@/components/home/services-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { getFeaturedReferences, getTestimonials } from "@/lib/queries";

// Re-generate at most once per hour when a database is connected.
export const revalidate = 3600;

export default async function HomePage() {
  const [featuredReferences, testimonials] = await Promise.all([
    getFeaturedReferences(),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero />
      <ServicesSection />
      <FeaturedReferencesSection references={featuredReferences} />
      <AboutSection />
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection />
      <CtaSection />
    </>
  );
}
