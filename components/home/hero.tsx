import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { SteelBackdrop } from "@/components/shared/steel-backdrop";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

/*
 * Hero is intentionally static (no scroll animation) so the LCP content is
 * visible immediately. Dark section via the `dark` class token remap.
 */
export function Hero() {
  return (
    <section className="dark bg-background text-foreground relative overflow-hidden">
      <SteelBackdrop glow="top-right" fadeFrom="top" />

      <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <p className="text-primary-soft text-sm font-semibold tracking-wide uppercase">
          Zváranie nerezovej ocele · {siteConfig.location}
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold text-balance sm:text-6xl">
          Nerezové zábradlia a konštrukcie na mieru
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
          Od zábradlia na terasu po priemyselné dopravníky. Zvárame, brúsime, chemicky čistíme a
          montujeme - presne podľa výkresovej dokumentácie alebo návrhu, ktorý pripravíme spolu s
          vami.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/cenova-ponuka" />}>
            Nezáväzná cenová ponuka
            <ArrowRightIcon aria-hidden />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/galeria" />}
          >
            Pozrieť galériu
          </Button>
        </div>

        {/* Trust indicators */}
        {/* TODO: verify with client (collaborations, years of experience) */}
        <ul className="text-muted-foreground mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {[
            "TIG zváranie nerezu",
            "Práca podľa výkresovej dokumentácie",
            "Spolupráca s IMC a Red Bull",
            "Montáž priamo na mieste",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span aria-hidden className="bg-primary size-1.5 rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
