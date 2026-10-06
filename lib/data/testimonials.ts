import type { TestimonialItem } from "@/lib/types";

/*
 * Testimonial seed data - drafts to be replaced with real client quotes.
 * Kept short so the section reads credible, not salesy.
 */
// TODO: verify with client - replace with real testimonials
export const testimonialsSeed: TestimonialItem[] = [
  {
    id: "testimonial-01",
    author: "Peter M.",
    company: "rodinný dom, Považská Bystrica",
    quote:
      "Zábradlie presne podľa návrhu, čisté zvary a montáž bez jediného problému. Komunikácia rýchla a férová cena.",
    sortOrder: 1,
  },
  {
    id: "testimonial-02",
    author: "výrobná spoločnosť",
    company: "strojársky priemysel",
    quote:
      "Spoľahlivý partner pre nerezové komponenty podľa výkresovej dokumentácie. Termíny dodržané, kvalita zvarov na vysokej úrovni.",
    sortOrder: 2,
  },
];
