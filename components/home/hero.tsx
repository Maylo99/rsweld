import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/shared/logo";
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

      {/* The logo's TIG torch, oversized, aiming into the hero - with a glowing
          arc at its tip. Static and decorative; hidden where it would crowd
          the copy. The nozzle tip sits at ~2.2% / 62.4% of the mark's box. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 right-[-3%] hidden w-[400px] lg:block xl:right-[4%]"
      >
        <LogoMark className="w-full opacity-25" />
        <span className="absolute top-[62.4%] left-[2.2%] size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(235,245,255,0.95)_5%,rgba(150,200,255,0.55)_14%,rgba(70,126,247,0.2)_36%,transparent_68%)]" />
      </div>

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
