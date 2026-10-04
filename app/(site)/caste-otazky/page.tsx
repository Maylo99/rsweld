import type { Metadata } from "next";

import { FaqBrowser } from "@/components/faq/faq-browser";
import { getFaqPageJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Časté otázky",
  description:
    "Odpovede na časté otázky o nerezových zábradliach a zváraní nerezu: cena, cenová ponuka, termíny výroby, montáž, záruka, materiály a údržba.",
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqPageJsonLd()) }}
      />
      <FaqBrowser />
    </>
  );
}
