import type { Metadata } from "next";

import { FaqBrowser } from "@/components/faq/faq-browser";
import { getFaqPageJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Časté otázky",
  description:
    "Odpovede na časté otázky o zábradliach a zváraní nerezu aj ocele: cena, cenová ponuka, termíny výroby, montáž a materiály.",
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
