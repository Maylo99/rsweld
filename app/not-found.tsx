import { ArrowRightIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SteelBackdrop } from "@/components/shared/steel-backdrop";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stránka sa nenašla",
};

const suggestions = [
  { href: "/galeria", label: "Galéria realizácií" },
  { href: "/o-nas", label: "O nás" },
  { href: "/caste-otazky", label: "Časté otázky" },
  { href: "/kontakt", label: "Kontakt" },
];

/*
 * Global 404. Lives at the app root (not in `(site)`) so it also catches
 * unmatched URLs, which is why it renders the site header/footer itself.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="dark bg-background text-foreground relative flex flex-1 items-center overflow-hidden">
        <SteelBackdrop glow="top-right" fadeFrom="top" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:py-32">
          <p className="font-heading text-primary-soft text-sm font-semibold tracking-wide uppercase">
            Chyba 404
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold text-balance sm:text-5xl">
            Tento zvar sa nepodaril. Stránka neexistuje.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
            Odkaz je možno starý alebo v adrese chýba písmenko. Skúste začať na úvodnej stránke
            alebo nám rovno zavolajte.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/" />}>
              Späť na úvod
              <ArrowRightIcon aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<a href={siteConfig.phoneHref} />}
            >
              <PhoneIcon aria-hidden />
              {siteConfig.phone}
            </Button>
          </div>

          <nav aria-label="Užitočné odkazy" className="mt-12">
            <ul className="text-muted-foreground flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {suggestions.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-primary-soft inline-flex items-center gap-2 transition-colors"
                  >
                    <span aria-hidden className="bg-primary size-1.5 rounded-full" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
