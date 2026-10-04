import type { GalleryData, PhotoItem, PlacementKey, TagItem } from "@/lib/types";

/*
 * Gallery seed data — real client photos delivered 2026-07 (WhatsApp set),
 * renamed to descriptive English file names in /public/references.
 * Used as the site's fallback content without a database and by `pnpm db:seed`.
 */
// TODO: verify with client — titles, descriptions, tag names and assignments

export const tagsSeed: TagItem[] = [
  { id: "tag-railings", name: "Zábradlia", slug: "zabradlia" },
  { id: "tag-staircases", name: "Schodiská", slug: "schodiska" },
  { id: "tag-terraces", name: "Terasy", slug: "terasy" },
  { id: "tag-interior", name: "Interiér", slug: "interier" },
  { id: "tag-industry", name: "Priemysel", slug: "priemysel" },
  { id: "tag-welds", name: "Detaily zvarov", slug: "detaily-zvarov" },
  { id: "tag-design", name: "Dizajn a nábytok", slug: "dizajn-a-nabytok" },
];

type SeedPhoto = Omit<PhotoItem, "tagIds" | "placements"> & { tags: string[] };

/** Gallery order ("Všetky"). A tag's order = the order photos appear here. */
const photos: SeedPhoto[] = [
  {
    id: "ref-exterior-staircase-railing",
    title: "Exteriérové schodiskové zábradlie",
    description:
      "Nerezové zábradlie na vonkajšie schodisko a terasu rodinného domu — vodorovná prútová výplň odolná voči poveternosti.",
    imagePath: "/references/exterior-staircase-railing.jpg",
    imageAlt: "Nerezové zábradlie na vonkajšom schodisku a terase rodinného domu",
    tags: ["tag-railings", "tag-staircases", "tag-terraces"],
  },
  {
    id: "ref-cable-staircase-railing",
    title: "Lankové schodiskové zábradlie",
    description:
      "Interiérové schodiskové zábradlie s nerezovou lankovou výplňou — vzdušný vzhľad a čistý výhľad do priestoru.",
    imagePath: "/references/cable-staircase-railing.jpg",
    imageAlt: "Interiérové nerezové schodiskové zábradlie s lankovou výplňou",
    tags: ["tag-railings", "tag-staircases", "tag-interior"],
  },
  {
    id: "ref-interior-staircase-railing",
    title: "Interiérové schodiskové zábradlie",
    description:
      "Brúsené nerezové zábradlie s vodorovnou prútovou výplňou pre interiérové schodisko rodinného domu.",
    imagePath: "/references/interior-staircase-railing.jpg",
    imageAlt: "Brúsené nerezové zábradlie interiérového schodiska s vodorovnou výplňou",
    tags: ["tag-railings", "tag-staircases", "tag-interior"],
  },
  {
    id: "ref-design-side-tables",
    title: "Dizajnové príručné stolíky",
    description:
      "Zákazková výroba sady okrúhlych príručných stolíkov — nerezová konštrukcia s kamennou doskou.",
    imagePath: "/references/design-side-tables.jpg",
    imageAlt: "Sada okrúhlych príručných stolíkov s nerezovou konštrukciou a kamennou doskou",
    tags: ["tag-design", "tag-interior"],
  },
  {
    id: "ref-terrace-railing",
    title: "Zábradlie na terasu",
    description:
      "Nerezové terasové zábradlie s vodorovnou prútovou výplňou, kotvené do bočnej hrany terasy.",
    imagePath: "/references/terrace-railing.jpg",
    imageAlt: "Nerezové terasové zábradlie s vodorovnou prútovou výplňou",
    tags: ["tag-railings", "tag-terraces"],
  },
  {
    id: "ref-tig-weld-detail",
    title: "Detail TIG zvaru nerezu",
    description:
      "Detail zvaru nerezového profilu metódou TIG — rovnomerná húsenica bez potreby dodatočného brúsenia.",
    imagePath: "/references/tig-weld-detail.jpg",
    imageAlt: "Detail rovnomerného TIG zvaru na nerezovom profile",
    tags: ["tag-welds"],
  },
  {
    id: "ref-tig-weld-base-plate",
    title: "Zvar kotviacej platne",
    description:
      "Obvodový TIG zvar nerezovej kotviacej platne k profilu — presná príprava pre montážne kotvenie.",
    imagePath: "/references/tig-weld-base-plate.jpg",
    imageAlt: "Obvodový TIG zvar nerezovej kotviacej platne k profilu",
    tags: ["tag-welds", "tag-railings"],
  },
  {
    id: "ref-industrial-hood",
    title: "Nerezový priemyselný kryt",
    description:
      "Zváraný nerezový kryt s kruhovou prírubou pre priemyselné technologické zariadenie.",
    imagePath: "/references/industrial-hood.jpg",
    imageAlt: "Veľký zváraný nerezový priemyselný kryt s kruhovou prírubou v dielni",
    tags: ["tag-industry"],
  },
  {
    id: "ref-industrial-hopper",
    title: "Nerezová násypka",
    description:
      "Zákazková nerezová násypka pre priemyselnú výrobnú linku — zvary vyhotovené podľa výkresovej dokumentácie.",
    imagePath: "/references/industrial-hopper.jpg",
    imageAlt: "Zváraná nerezová priemyselná násypka na montážnom stole",
    tags: ["tag-industry"],
  },
  {
    id: "ref-perforated-guard",
    title: "Perforovaný nerezový kryt",
    description:
      "Nerezový ochranný kryt s perforáciou pre priemyselné zariadenie — bezpečnostný prvok výrobnej linky.",
    imagePath: "/references/perforated-guard.jpg",
    imageAlt: "Nerezový perforovaný ochranný kryt priemyselného zariadenia",
    tags: ["tag-industry"],
  },
];

const placementOrder: Record<PlacementKey, string[]> = {
  GALLERY: photos.map((photo) => photo.id),
  HOME_FEATURED: [
    "ref-exterior-staircase-railing",
    "ref-cable-staircase-railing",
    "ref-interior-staircase-railing",
    "ref-design-side-tables",
    "ref-tig-weld-detail",
    "ref-tig-weld-base-plate",
  ],
  HOME_ABOUT: ["ref-tig-weld-detail"],
};

export const gallerySeed: GalleryData = {
  photos: photos.map(({ tags, ...photo }) => ({
    ...photo,
    tagIds: tags,
    placements: (Object.keys(placementOrder) as PlacementKey[]).filter((placement) =>
      placementOrder[placement].includes(photo.id),
    ),
  })),
  tags: tagsSeed,
  tagOrder: Object.fromEntries(
    tagsSeed.map((tag) => [
      tag.id,
      photos.filter((photo) => photo.tags.includes(tag.id)).map((photo) => photo.id),
    ]),
  ),
  placementOrder,
};
