import type { ReferenceItem } from "@/lib/types";

/*
 * Reference seed data. Categories and collaborations (Red Bull, IMC) come from
 * the original rs-weld.com site; titles/descriptions are drafts.
 * Images are generated placeholders — swap for real photos when the client
 * delivers them (replace files in /public/references and update alt texts).
 */
// TODO: verify descriptions and project details with client
export const referencesSeed: ReferenceItem[] = [
  {
    id: "ref-cable-railing-01",
    title: "Lankové zábradlie na terasu",
    description:
      "Nerezové zábradlie s lankovou výplňou pre rodinný dom — kombinácia bezpečnosti a čistého výhľadu.",
    category: "CABLE_RAILING",
    imagePath: "/references/cable-railing.jpg",
    imageAlt: "Nerezové lankové zábradlie na terase rodinného domu",
    featured: true,
    sortOrder: 1,
  },
  {
    id: "ref-rod-railing-01",
    title: "Prútové zábradlie schodiska",
    description:
      "Interiérové zábradlie s prútovou výplňou, brúsený nerez s jemnou povrchovou úpravou.",
    category: "ROD_RAILING",
    imagePath: "/references/rod-railing.jpg",
    imageAlt: "Prútové nerezové zábradlie interiérového schodiska",
    featured: true,
    sortOrder: 2,
  },
  {
    id: "ref-design-table-01",
    title: "Dizajnový stolík pre Red Bull",
    description:
      "Zákazková výroba dizajnových nerezových stolíkov — spolupráca so značkou Red Bull.",
    category: "DESIGN_TABLE",
    imagePath: "/references/design-table.jpg",
    imageAlt: "Dizajnový nerezový stolík vyrobený pre Red Bull",
    featured: true,
    sortOrder: 3,
  },
  {
    id: "ref-conveyor-01",
    title: "Nerezový dopravník pre IMC",
    description:
      "Výroba a zváranie nerezových dopravníkových systémov pre priemyselnú výrobu — spolupráca s IMC.",
    category: "CONVEYOR",
    imagePath: "/references/conveyor.jpg",
    imageAlt: "Priemyselný nerezový dopravník vo výrobnej hale",
    featured: true,
    sortOrder: 4,
  },
  {
    id: "ref-french-balcony-01",
    title: "Francúzsky balkón",
    description: "Nerezový francúzsky balkón na mieru podľa výkresovej dokumentácie.",
    category: "FRENCH_BALCONY",
    imagePath: "/references/french-balcony.jpg",
    imageAlt: "Nerezový francúzsky balkón na fasáde bytového domu",
    featured: true,
    sortOrder: 5,
  },
  {
    id: "ref-piping-01",
    title: "Nerezové potrubné rozvody",
    description: "Zváranie potrubných trás z nerezovej ocele vrátane prípravy a montáže.",
    category: "PIPING",
    imagePath: "/references/piping.jpg",
    imageAlt: "Zvárané nerezové potrubné rozvody",
    featured: true,
    sortOrder: 6,
  },
  {
    id: "ref-vertical-railing-01",
    title: "Zvislé zábradlie balkóna",
    description: "Zábradlie so zvislou výplňou pre bytový dom — bezpečné aj pre malé deti.",
    category: "VERTICAL_RAILING",
    imagePath: "/references/vertical-railing.jpg",
    imageAlt: "Nerezové zábradlie so zvislou výplňou na balkóne",
    featured: false,
    sortOrder: 7,
  },
  {
    id: "ref-engineering-01",
    title: "Komponenty pre strojársky priemysel",
    description:
      "Presné zváranie nerezových komponentov podľa výkresovej dokumentácie — spolupráca s IMC.",
    category: "ENGINEERING_COMPONENT",
    imagePath: "/references/engineering-component.jpg",
    imageAlt: "Zvárané nerezové komponenty pre strojársky priemysel",
    featured: false,
    sortOrder: 8,
  },
  {
    id: "ref-water-industry-01",
    title: "Komponenty pre vodárenský priemysel",
    description: "Nerezové diely a zvary odolné voči korózii pre vodárenské technológie.",
    category: "WATER_INDUSTRY_COMPONENT",
    imagePath: "/references/water-industry-component.jpg",
    imageAlt: "Nerezové komponenty pre vodárenský priemysel",
    featured: false,
    sortOrder: 9,
  },
  {
    id: "ref-ladder-01",
    title: "Nerezový rebrík",
    description: "Pevný nerezový rebrík na mieru pre technologickú šachtu.",
    category: "LADDER",
    imagePath: "/references/ladder.jpg",
    imageAlt: "Nerezový rebrík vyrobený na mieru",
    featured: false,
    sortOrder: 10,
  },
];
