import type { FaqCategory, FaqItem } from "@/lib/types";

/** Tabs on the FAQ page, in display order. */
export const faqCategories: { id: FaqCategory; title: string; description: string }[] = [
  {
    id: "pricing",
    title: "Cena a ponuka",
    description: "Koľko to stojí, ako rýchlo dostanete ponuku a čo je zadarmo.",
  },
  {
    id: "production",
    title: "Výroba a montáž",
    description: "Termíny výroby, montáž priamo u vás a záruka na prácu.",
  },
  {
    id: "materials",
    title: "Materiály a údržba",
    description: "Aký nerez zvoliť, s čím sa dá kombinovať a ako sa oň starať.",
  },
  {
    id: "cooperation",
    title: "Spolupráca",
    description: "Pre koho pracujeme, kde pôsobíme a čo od vás potrebujeme.",
  },
];

// TODO: verify answers with client (lead times, service area radius, minimum order size,
// pricing, free measurement, warranty length, payment terms)
export const faqItems: FaqItem[] = [
  {
    id: "faq-small-jobs",
    category: "cooperation",
    featured: true,
    question: "Robíte aj malé zákazky?",
    answer:
      "Áno. Okrem priemyselných zákaziek radi zvárame aj menšie projekty, napríklad zábradlie na schodisko, francúzsky balkón alebo opravu existujúcej konštrukcie. Napíšte nám, čo potrebujete, a ozveme sa.",
  },
  {
    id: "faq-price",
    category: "pricing",
    featured: true,
    question: "Koľko stojí nerezové zábradlie?",
    answer:
      "Cena závisí hlavne od dĺžky, typu výplne (prúty, lanko, sklo), od toho, či ide o interiér alebo exteriér, a od spôsobu kotvenia. Presnú sumu vám povieme po zameraní, prípadne už podľa fotky a približných rozmerov.",
  },
  {
    id: "faq-free-quote",
    category: "pricing",
    featured: true,
    question: "Je cenová ponuka a zameranie zadarmo?",
    answer:
      "Cenová ponuka je vždy bezplatná a nezáväzná. Zameranie v okolí Považskej Bystrice je zadarmo. Pri vzdialenejších lokalitách sa na podmienkach dohodneme vopred.",
  },
  {
    id: "faq-quote-time",
    category: "pricing",
    question: "Ako dlho trvá vypracovanie cenovej ponuky?",
    answer:
      "Pri bežných zákazkách posielame cenovú ponuku zvyčajne do 2–3 pracovných dní. Pri zložitejších projektoch podľa výkresovej dokumentácie sa vopred dohodneme na termíne.",
  },
  {
    id: "faq-lead-time",
    category: "production",
    featured: true,
    question: "Ako dlho trvá výroba a montáž?",
    answer:
      "Výroba bežného zábradlia trvá zvyčajne 2–4 týždne od potvrdenia objednávky, v sezóne môže byť termín dlhší. Samotná montáž na mieste väčšinou zaberie jeden deň. Termín vždy uvedieme v cenovej ponuke.",
  },
  {
    id: "faq-service-area",
    category: "cooperation",
    question: "Pôsobíte len v Považskej Bystrici?",
    answer:
      "Sídlime v Považskej Bystrici a najčastejšie pracujeme v okruhu Trenčianskeho kraja. Po dohode vieme realizovať montáž aj ďalej, závisí to od rozsahu zákazky.",
  },
  {
    id: "faq-drawings",
    category: "cooperation",
    featured: true,
    question: "Potrebujem mať vlastný výkres?",
    answer:
      "Nie je to podmienka. Ak výkresovú dokumentáciu máte, pracujeme presne podľa nej. Ak nie, prídeme, zameriame a navrhneme riešenie spolu s vami.",
  },
  {
    id: "faq-materials",
    category: "materials",
    question: "S akými materiálmi pracujete?",
    answer:
      "Špecializujeme sa na nerezovú oceľ (AISI 304/316). Vďaka chemickému čisteniu a pasivácii zvarov je výsledok odolný voči korózii aj v exteriéri.",
  },
  {
    id: "faq-304-vs-316",
    category: "materials",
    question: "Aký je rozdiel medzi nerezom 304 a 316?",
    answer:
      "Nerez 316 obsahuje molybdén, a preto lepšie odoláva soli a chlóru. Odporúčame ho do exteriéru pri cestách, ktoré sa v zime solia, a k bazénom. Do interiéru a na bežné terasy úplne postačí nerez 304.",
  },
  {
    id: "faq-combined",
    category: "materials",
    question: "Dá sa nerez kombinovať so sklom alebo drevom?",
    answer:
      "Áno. Vyrábame zábradlia so sklenenou výplňou aj s dreveným madlom. Rovnako robíme nerezové konštrukcie pre kamenné či drevené dosky, napríklad stolíky a lavice.",
  },
  {
    id: "faq-companies",
    category: "cooperation",
    question: "Vyrábate aj pre firmy podľa výkresov?",
    answer:
      "Áno. Pre strojárske a výrobné firmy zvárame kusové aj malosériové komponenty podľa výkresovej dokumentácie. Prijímame PDF aj CAD formáty (DWG, DXF, STEP).",
  },
  {
    id: "faq-installation",
    category: "production",
    question: "Zabezpečujete aj montáž?",
    answer:
      "Áno, montáž je súčasťou našich služieb. Konštrukciu vyrobíme v dielni a namontujeme priamo na mieste vrátane kotvenia a finálneho dočistenia.",
  },
  {
    id: "faq-warranty",
    category: "production",
    question: "Poskytujete na prácu záruku?",
    answer:
      "Áno, na zvary aj montáž poskytujeme záruku. Jej dĺžku uvádzame v cenovej ponuke. Ak by sa čokoľvek vyskytlo, ozvite sa a vyriešime to.",
  },
  {
    id: "faq-care",
    category: "materials",
    question: "Ako sa o nerezové zábradlie starať?",
    answer:
      "Stačí ho občas umyť vlažnou vodou s jemným saponátom a utrieť mäkkou handričkou. Nepoužívajte drôtenky ani prípravky s chlórom. V exteriéri je dobré zábradlie umyť aspoň raz za sezónu, najmä po zime.",
  },
];
