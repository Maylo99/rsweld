import { siteConfig } from "@/lib/site";

/**
 * LocalBusiness structured data for local SEO
 * ("zváranie nerezu Považská Bystrica" and related queries).
 */
export function getLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    image: `${siteConfig.url}/og.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Považská Bystrica",
      addressCountry: "SK",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Trenčiansky kraj",
    },
    founder: {
      "@type": "Person",
      name: siteConfig.owner,
    },
    sameAs: [siteConfig.instagram],
    priceRange: "$$",
  };
}
