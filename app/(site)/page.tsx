import { AboutSection } from "@/components/home/about-section";
import { CtaSection } from "@/components/home/cta-section";
import { FaqSection } from "@/components/home/faq-section";
import { FeaturedReferencesSection } from "@/components/home/featured-references-section";
import { Hero } from "@/components/home/hero";
import { ServicesSection } from "@/components/home/services-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ProcessSection } from "@/components/shared/process-section";
import { getPlacementPhotos, getTestimonials } from "@/lib/queries";

// Re-generate at most once per hour when a database is connected.
export const revalidate = 3600;

export default async function HomePage() {
  const [featuredPhotos, [aboutPhoto], testimonials] = await Promise.all([
    getPlacementPhotos("HOME_FEATURED"),
    getPlacementPhotos("HOME_ABOUT"),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero />
      <ServicesSection />
      <FeaturedReferencesSection photos={featuredPhotos} />
      <ProcessSection />
      <AboutSection photo={aboutPhoto} />
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection />
      <CtaSection />
    </>
  );
}
