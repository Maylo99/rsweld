import type { FaqCategory, FaqItem } from "@/lib/types";

/** Tabs on the FAQ page, in display order. */
export const faqCategories: { id: FaqCategory; title: string; description: string }[] = [
  {
    id: "pricing",
    title: "Cena a ponuka",
    description: "Koľko to stojí a ako rýchlo dostanete ponuku.",
  },
  {
    id: "production",
    title: "Výroba a montáž",
    description: "Termíny výroby a montáž priamo u vás.",
  },
  {
    id: "materials",
    title: "Materiály",
    description: "Nerez alebo oceľ - čo sa na vašu zákazku hodí viac.",
  },
  {
    id: "cooperation",
    title: "Spolupráca",
    description: "Pre koho pracujeme, kde pôsobíme a čo od vás potrebujeme.",
  },
];

// TODO: verify answers with client (lead times, service area radius, minimum order size,
// pricing, payment terms)
export const faqItems: FaqItem[] = [
  {
    id: "faq-small-jobs",
    category: "cooperation",
    featured: true,
    question: "Robíte aj malé zákazky?",
    answer:
      "Áno. Okrem priemyselných zákaziek radi zvárame aj menšie projekty, napríklad zábradlie na schodisko alebo francúzsky balkón. Napíšte nám, čo potrebujete, a ozveme sa.",
  },
  {
    id: "faq-price",
    category: "pricing",
    featured: true,
    question: "Koľko stojí zábradlie na mieru?",
    answer:
      "Cena závisí hlavne od materiálu (nerez alebo oceľ), dĺžky, typu výplne (prúty, lanko, sklo), od toho, či ide o interiér alebo exteriér, a od spôsobu kotvenia. Presnú sumu vám povieme po zameraní, prípadne už podľa fotky a približných rozmerov.",
  },
  {
    id: "faq-quote-time",
    category: "pricing",
    question: "Ako dlho trvá vypracovanie cenovej ponuky?",
    answer:
      "Pri bežných zákazkách posielame cenovú ponuku zvyčajne do 2-3 pracovných dní. Pri zložitejších projektoch podľa výkresovej dokumentácie sa vopred dohodneme na termíne.",
  },
  {
    id: "faq-lead-time",
    category: "production",
    featured: true,
    question: "Ako dlho trvá výroba a montáž?",
    answer:
      "Termín závisí hlavne od náročnosti a zložitosti projektu a od toho, koľko zákaziek máme práve rozpracovaných. Jednoduché zábradlie zvládneme rýchlejšie, rozsiahlejšia konštrukcia alebo atypické riešenie si vyžiada viac času. Preto vám termín výroby aj montáže vždy uvedieme konkrétne v cenovej ponuke a dohodnutý termín dodržíme.",
  },
  {
    id: "faq-service-area",
    category: "cooperation",
    question: "Pôsobíte len v Považskej Bystrici?",
    answer:
      "Sídlime v Považskej Bystrici a najčastejšie pracujeme v Trenčianskom a Žilinskom kraji. Po dohode vieme realizovať montáž aj ďalej, závisí to od rozsahu zákazky.",
  },
  {
    id: "faq-drawings",
    category: "cooperation",
    featured: true,
    question: "Potrebujem mať vlastný výkres?",
    answer:
      "Nie je to podmienka. Ak výkresovú dokumentáciu máte, pracujeme presne podľa nej. Ak nie, prídeme, zameriame a dohodneme všetky potrebné detaily.",
  },
  {
    id: "faq-materials",
    category: "materials",
    question: "S akými materiálmi pracujete?",
    answer:
      "Pracujeme s oceľou aj nerezom. Nerezové zvary chemicky čistíme a pasivujeme, oceľ chránime povrchovou úpravou, takže výsledok vydrží aj v exteriéri.",
  },
  {
    id: "faq-stainless-vs-steel",
    category: "materials",
    featured: true,
    question: "Nerez alebo oceľ - čo si vybrať?",
    // TODO: verify with client (surface finishes offered for steel)
    answer:
      "Nerez nepotrebuje náter, je takmer bezúdržbový a pôsobí elegantne. Oceľ zase ponúka množstvo možností povrchových úprav. Radi vám poradíme, čo sa na vašu zákazku hodí viac.",
  },
  {
    id: "faq-companies",
    category: "cooperation",
    question: "Vyrábate aj pre firmy podľa výkresov?",
    answer:
      "Áno. Pre strojárske a výrobné firmy zvárame kusové aj sériové komponenty podľa výkresovej dokumentácie.",
  },
  {
    id: "faq-installation",
    category: "production",
    question: "Zabezpečujete aj montáž?",
    answer:
      "Áno, montáž je súčasťou našich služieb. Konštrukciu vyrobíme v dielni a namontujeme priamo na mieste vrátane kotvenia a finálneho opracovania.",
  },
];
