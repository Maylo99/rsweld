/**
 * App-level content types. Deliberately decoupled from generated Prisma types
 * so pages/components work with either DB rows or static seed data.
 */

export const PLACEMENTS = ["GALLERY", "HOME_FEATURED", "HOME_ABOUT"] as const;

/** A website section a photo can be shown in (see `lib/placements.ts`). */
export type PlacementKey = (typeof PLACEMENTS)[number];

/** Gallery filter tag; array order = order of the filter chips. */
export type TagItem = {
  id: string;
  /** Slovak label (visible site content). */
  name: string;
  /** URL-safe key used in `/galeria?tag=…`. */
  slug: string;
};

export type PhotoItem = {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  imageAlt: string;
  tagIds: string[];
  placements: PlacementKey[];
};

/**
 * The whole gallery as one consistent snapshot. Every list keeps its own
 * order: the gallery ("Všetky"), each tag filter and each homepage section are
 * ordered independently of each other.
 */
export type GalleryData = {
  /** Library order — newest first. */
  photos: PhotoItem[];
  tags: TagItem[];
  /** Tag id → photo ids in that tag's order. */
  tagOrder: Record<string, string[]>;
  /** Placement → photo ids in that section's order. */
  placementOrder: Record<PlacementKey, string[]>;
};

/** An ordered list the administrator can rearrange: a website section or a tag filter. */
export type OrderedList =
  { kind: "placement"; placement: PlacementKey } | { kind: "tag"; tagId: string };

/** A photo prepared for the public site, with its tags resolved. */
export type DisplayPhoto = Omit<PhotoItem, "tagIds" | "placements"> & {
  tags: TagItem[];
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

export type FaqCategory = "pricing" | "production" | "materials" | "cooperation";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  /** Also shown in the short FAQ teaser on the home page. */
  featured?: boolean;
};

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  /** Short, typical duration hint shown as a chip (e.g. "do 2–3 dní"). */
  duration: string;
  icon: "inquiry" | "measure" | "quote" | "workshop" | "handover";
};
