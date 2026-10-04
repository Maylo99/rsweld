import { ArrowRightIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";

import { AnimatedSection } from "@/components/shared/animated-section";
import { InstagramIcon } from "@/components/shared/instagram-icon";
import { SteelBackdrop } from "@/components/shared/steel-backdrop";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

/*
 * Final call-to-action + Instagram teaser. Rendered as an elevated, bordered
 * panel (bg-card, lighter than the page) so it reads as a distinct band and
 * doesn't merge into the equally-dark footer below it.
 */
export function CtaSection() {
  return (
    <section className="dark bg-background text-foreground" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="border-border bg-card relative overflow-hidden rounded-3xl border px-6 py-12 sm:px-12 sm:py-14">
          <SteelBackdrop glow="top-right" fadeFrom="top" sparks={false} />
          <div className="relative">
            <AnimatedSection className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 id="cta-heading" className="text-3xl font-bold sm:text-4xl">
                  Máte projekt z nerezu?
                </h2>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  Pošlite nám popis alebo výkres a do pár dní sa ozveme s cenovou ponukou. Menšie
                  zákazky aj priemyselné celky.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" nativeButton={false} render={<Link href="/cenova-ponuka" />}>
                  Nezáväzná cenová ponuka
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
            </AnimatedSection>

            <AnimatedSection
              delay={0.08}
              className="border-border mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8"
            >
              <p className="text-muted-foreground text-sm">
                Najnovšie realizácie pridávame na Instagram.
              </p>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-soft inline-flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <InstagramIcon className="text-primary size-4" aria-hidden />
                Sledujte {siteConfig.instagramHandle}
              </a>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
