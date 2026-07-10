import type { FaqItem } from "@/lib/types";

// TODO: verify answers with client (lead times, service area radius, minimum order size)
export const faqItems: FaqItem[] = [
  {
    id: "faq-small-jobs",
    question: "Robíte aj malé zákazky?",
    answer:
      "Áno. Okrem priemyselných zákaziek radi zvárame aj menšie projekty — zábradlie na schodisko, francúzsky balkón či opravu existujúcej konštrukcie. Napíšte nám, čo potrebujete, a ozveme sa.",
  },
  {
    id: "faq-quote-time",
    question: "Ako dlho trvá vypracovanie cenovej ponuky?",
    answer:
      "Pri bežných zákazkách posielame cenovú ponuku zvyčajne do 2–3 pracovných dní. Pri zložitejších projektoch podľa výkresovej dokumentácie sa vopred dohodneme na termíne.",
  },
  {
    id: "faq-service-area",
    question: "Pôsobíte len v Považskej Bystrici?",
    answer:
      "Sídlime v Považskej Bystrici a najčastejšie pracujeme v okruhu Trenčianskeho kraja. Po dohode vieme realizovať montáž aj ďalej — závisí od rozsahu zákazky.",
  },
  {
    id: "faq-drawings",
    question: "Potrebujem mať vlastný výkres?",
    answer:
      "Nie je to podmienka. Ak výkresovú dokumentáciu máte, pracujeme presne podľa nej. Ak nie, prídeme, zameriame a navrhneme riešenie spolu s vami.",
  },
  {
    id: "faq-materials",
    question: "S akými materiálmi pracujete?",
    answer:
      "Špecializujeme sa na nerezovú oceľ (AISI 304/316). Vďaka chemickému čisteniu a pasivácii zvarov je výsledok odolný voči korózii aj v exteriéri.",
  },
  {
    id: "faq-installation",
    question: "Zabezpečujete aj montáž?",
    answer:
      "Áno, montáž je súčasťou našich služieb. Konštrukciu vyrobíme v dielni a namontujeme priamo na mieste vrátane kotvenia a finálneho dočistenia.",
  },
];
