import { faqItems } from "@/lib/data/faq";
import { services } from "@/lib/data/services";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

/**
 * Site-wide structured data for local SEO ("zváranie nerezu / ocele Považská
 * Bystrica" and related queries): the business, its services and the website.
 */
export function getLocalBusinessJsonLd() {
  const businessId = `${siteUrl}/#business`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": businessId,
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteUrl,
        telephone: siteConfig.phone,
        email: siteConfig.email,
        image: absoluteUrl("/og.jpg"),
        logo: absoluteUrl("/logo.png"),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Považská Bystrica",
          addressCountry: "SK",
        },
        areaServed: [
          { "@type": "City", name: "Považská Bystrica" },
          { "@type": "AdministrativeArea", name: "Trenčiansky kraj" },
          { "@type": "AdministrativeArea", name: "Žilinský kraj" },
        ],
        founder: { "@type": "Person", name: siteConfig.owner },
        sameAs: [siteConfig.instagram],
        priceRange: "$$",
        knowsAbout: ["Zváranie nerezu", "Zváranie ocele", "Nerezové zábradlia", "TIG zváranie"],
        makesOffer: services
          .filter((service) => service.icon !== "quote")
          .map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.title,
              description: service.description,
              areaServed: siteConfig.serviceArea,
            },
          })),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteConfig.name,
        inLanguage: "sk-SK",
        publisher: { "@id": businessId },
      },
    ],
  };
}

/** FAQPage structured data for the `/caste-otazky` page. */
export function getFaqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
