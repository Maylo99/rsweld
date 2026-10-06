import type { CraftService } from "@/lib/types";

/*
 * Content of the services page (`/sluzby`): workshop services, in workflow
 * order.
 * The homepage keeps its own five-step summary in `services.ts`.
 */
// TODO: verify with client (derived "Zameranie a návrh"; galvanizing done in-house
// or outsourced; available finishes)
export const craftServices: CraftService[] = [
  {
    id: "craft-measure",
    title: "Zameranie a návrh",
    description:
      "Prídeme na miesto, všetko zameriame a navrhneme riešenie - materiál, typ výplne aj spôsob kotvenia.",
    icon: "measure",
  },
  {
    id: "craft-cutting",
    title: "Delenie materiálu",
    description: "Presné delenie profilov na mieru podľa zamerania alebo výkresovej dokumentácie.",
    icon: "cutting",
  },
  {
    id: "craft-welding",
    title: "Zváranie nerezu a ocele",
    description:
      "Metódami TIG aj MIG/MAG - precízne pohľadové zvary na nereze aj pevné spoje oceľových konštrukcií.",
    icon: "welding",
  },
  {
    id: "craft-grinding",
    title: "Brúsenie",
    description:
      "Zvary zabrúsime a povrch zjednotíme, aby výsledok vyzeral čisto a jednotne aj zblízka.",
    icon: "grinding",
  },
  {
    id: "craft-cleaning",
    title: "Chemické čistenie",
    description:
      "Morenie a pasivácia nerezových zvarov - odstráni zafarbenie po zváraní a obnoví odolnosť voči korózii.",
    icon: "cleaning",
  },
  {
    id: "craft-galvanizing",
    title: "Zinkovanie",
    description:
      "Zinkovanie oceľových konštrukcií zabezpečíme pre dlhodobú ochranu pred koróziou v exteriéri.",
    icon: "galvanizing",
  },
  {
    id: "craft-finishing",
    title: "Povrchová úprava",
    description:
      "Komaxit, nátery aj brúsený či leštený vzhľad nerezu - podľa toho, kde bude výrobok slúžiť.",
    icon: "finishing",
  },
  {
    id: "craft-assembly",
    title: "Montáž",
    description:
      "Doprava, ukotvenie a finálne opracovanie priamo na mieste - zákazku odovzdáme hotovú.",
    icon: "assembly",
  },
];
