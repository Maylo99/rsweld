import type { ProcessStep } from "@/lib/types";

/*
 * How a job runs from the customer's point of view (inquiry → handover).
 * Complements `services.ts`, which lists the craft steps.
 */
// TODO: verify with client (durations, free measurement, deposit)
export const processSteps: ProcessStep[] = [
  {
    id: "process-inquiry",
    title: "Dopyt",
    description:
      "Zavolajte alebo vyplňte formulár. Stačí pár viet, približné rozmery a fotka miesta alebo výkres.",
    duration: "5 minút",
    icon: "inquiry",
  },
  {
    id: "process-measure",
    title: "Konzultácia a zameranie",
    description:
      "Prídeme na miesto, všetko presne zameriame a poradíme s typom výplne, materiálom aj kotvením.",
    duration: "podľa dohody",
    icon: "measure",
  },
  {
    id: "process-quote",
    title: "Cenová ponuka",
    description:
      "Dostanete prehľadnú ponuku s cenou a termínom. Je nezáväzná, takže sa rozhodujete bez tlaku.",
    duration: "do 2-3 pracovných dní",
    icon: "quote",
  },
  {
    id: "process-workshop",
    title: "Výroba v dielni",
    description:
      "Rezanie, zváranie TIG aj MIG/MAG, brúsenie a chemické čistenie zvarov. Každý kus kontrolujeme ešte v dielni.",
    duration: "podľa náročnosti",
    icon: "workshop",
  },
  {
    id: "process-handover",
    title: "Montáž a odovzdanie",
    description:
      "Výrobok privezieme, namontujeme a na mieste finálne doladíme. Po sebe upraceme a odovzdáme hotovú prácu.",
    duration: "zväčša 1 deň",
    icon: "handover",
  },
];
