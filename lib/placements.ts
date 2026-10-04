import type { PlacementKey } from "@/lib/types";

/**
 * Website sections the administrator can put photos into. Adding a section
 * means: a value in the `Placement` enum (schema + `PLACEMENTS`), an entry
 * here, and reading it with `getPlacementPhotos()` where it renders.
 */
export type PlacementConfig = {
  /** Slovak label shown in the admin. */
  label: string;
  /** Compact label for menus and summaries. */
  shortLabel: string;
  /** One-word label for photo thumbnails. */
  badge: string;
  /** Which page the section is on (admin grouping). */
  page: string;
  /** Public URL of that page, for "view on site" links. */
  href: string;
  /** One-line explanation for the administrator. */
  hint: string;
  /** Maximum number of photos the section shows; undefined = unlimited. */
  limit?: number;
};

export const placementConfig: Record<PlacementKey, PlacementConfig> = {
  GALLERY: {
    label: "Zobraziť v galérii",
    shortLabel: "Galéria",
    badge: "Galéria",
    page: "Galéria",
    href: "/galeria",
    hint: "Stránka Galéria — poradie pri filtri „Všetky“.",
  },
  HOME_FEATURED: {
    label: "Vybrané projekty",
    shortLabel: "Úvod – vybrané projekty",
    badge: "Úvod",
    page: "Úvodná stránka",
    href: "/#vybrane-projekty",
    hint: "Blok „Vybrané projekty“ na úvodnej stránke.",
    limit: 6,
  },
  HOME_ABOUT: {
    label: "Fotka v časti O nás",
    shortLabel: "Úvod – O nás",
    badge: "O nás",
    page: "Úvodná stránka",
    href: "/#o-nas",
    hint: "Jedna fotka vedľa textu „O nás“ na úvodnej stránke.",
    limit: 1,
  },
};
