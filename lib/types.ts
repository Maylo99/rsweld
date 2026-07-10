/**
 * App-level content types. Deliberately decoupled from generated Prisma types
 * so pages/components work with either DB rows or static seed data.
 */

export const REFERENCE_CATEGORIES = [
  "CABLE_RAILING",
  "ROD_RAILING",
  "VERTICAL_RAILING",
  "FRENCH_BALCONY",
  "DESIGN_TABLE",
  "CONVEYOR",
  "PIPING",
  "ENGINEERING_COMPONENT",
  "WATER_INDUSTRY_COMPONENT",
  "LADDER",
] as const;

export type ReferenceCategoryKey = (typeof REFERENCE_CATEGORIES)[number];

/** Slovak category labels (visible site content). */
export const referenceCategoryLabels: Record<ReferenceCategoryKey, string> = {
  CABLE_RAILING: "Lankové zábradlia",
  ROD_RAILING: "Prútové zábradlia",
  VERTICAL_RAILING: "Zvislé zábradlia",
  FRENCH_BALCONY: "Francúzske balkóny",
  DESIGN_TABLE: "Dizajnové stolíky",
  CONVEYOR: "Nerezové dopravníky",
  PIPING: "Potrubia",
  ENGINEERING_COMPONENT: "Strojárske komponenty",
  WATER_INDUSTRY_COMPONENT: "Vodárenské komponenty",
  LADDER: "Nerezové rebríky",
};

export type ReferenceItem = {
  id: string;
  title: string;
  description?: string;
  category: ReferenceCategoryKey;
  imagePath: string;
  imageAlt: string;
  featured: boolean;
  sortOrder: number;
};

export type TestimonialItem = {
  id: string;
  author: string;
  company?: string;
  quote: string;
  sortOrder: number;
};

export type ServiceItem = {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: "quote" | "welding" | "grinding" | "cleaning" | "assembly";
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};
