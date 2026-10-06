import type { ServiceItem } from "@/lib/types";

/*
 * The five services from the original site, ordered as the real workflow
 * (inquiry → welding → grinding → cleaning → assembly).
 */
export const services: ServiceItem[] = [
  {
    id: "service-quote",
    step: 1,
    title: "Cenová ponuka",
    description:
      "Pošlite nám popis zákazky alebo výkresovú dokumentáciu - ponuku pripravíme zvyčajne do niekoľkých pracovných dní.",
    icon: "quote",
  },
  {
    id: "service-welding",
    step: 2,
    title: "Zváranie nerezu a ocele",
    description:
      "Presné zváranie nerezu aj ocele - od zábradlí a konštrukcií po priemyselné komponenty podľa výkresov.",
    icon: "welding",
  },
  {
    id: "service-grinding",
    step: 3,
    title: "Brúsenie",
    description:
      "Brúsenie a povrchová úprava zvarov, aby výsledok vyzeral čisto a jednotne aj zblízka.",
    icon: "grinding",
  },
  {
    id: "service-cleaning",
    step: 4,
    title: "Chemické čistenie",
    description:
      "Morenie a pasivácia nerezových zvarov pre maximálnu odolnosť voči korózii a dlhú životnosť nerezu.",
    icon: "cleaning",
  },
  {
    id: "service-assembly",
    step: 5,
    title: "Montáž",
    description:
      "Doprava a odborná montáž priamo u vás - zábradlie či konštrukciu odovzdáme hotové.",
    icon: "assembly",
  },
];
