import {
  EuroIcon,
  HandshakeIcon,
  LayersIcon,
  MessageCircleQuestionIcon,
  PhoneIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { AnimatedSection } from "@/components/shared/animated-section";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { SteelBackdrop } from "@/components/shared/steel-backdrop";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faqCategories, faqItems } from "@/lib/data/faq";
import { siteConfig } from "@/lib/site";
import type { FaqCategory } from "@/lib/types";

const categoryIcons: Record<FaqCategory, LucideIcon> = {
  pricing: EuroIcon,
  production: WrenchIcon,
  materials: LayersIcon,
  cooperation: HandshakeIcon,
};

const groups = faqCategories.map((category) => ({
  ...category,
  items: faqItems.filter((item) => item.category === category.id),
}));

/** Slovak plural: 1 otázka, 2–4 otázky, 5+ otázok. */
function questionCount(count: number) {
  if (count === 1) return "1 otázka";
  if (count >= 2 && count <= 4) return `${count} otázky`;
  return `${count} otázok`;
}

/*
 * FAQ page body: compact dark hero, then category tabs (vertical cards on
 * desktop, 2×2 grid on mobile) swapping the questions of one category.
 */
export function FaqBrowser() {
  return (
    <>
      <section
        className="dark bg-background text-foreground relative overflow-hidden"
        aria-labelledby="faq-heading"
      >
        <SteelBackdrop glow="top-right" fadeFrom="top" sparks={false} />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:py-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-primary-soft text-sm font-semibold tracking-wide uppercase">
              Časté otázky
            </p>
            <h1
              id="faq-heading"
              className="mt-3 max-w-2xl text-4xl font-bold text-balance sm:text-5xl"
            >
              S čím vám môžeme pomôcť?
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
              Vyberte si tému a nájdite odpovede o cenách, termínoch, materiáloch aj montáži.
            </p>
          </div>
          <a
            href={siteConfig.phoneHref}
            className="group border-border bg-card/60 hover:border-primary-soft flex shrink-0 items-center gap-4 self-start rounded-xl border p-4 backdrop-blur transition-colors lg:self-auto"
          >
            <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-lg">
              <PhoneIcon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="text-muted-foreground block text-xs font-semibold tracking-wide uppercase">
                Radšej sa opýtate priamo?
              </span>
              <span className="group-hover:text-primary-soft font-semibold transition-colors">
                {siteConfig.phone}
              </span>
            </span>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-label="Otázky a odpovede">
        <Tabs
          defaultValue={faqCategories[0].id}
          orientation="vertical"
          className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-12"
        >
          <div className="min-w-0 space-y-6">
            <TabsList
              aria-label="Kategórie otázok"
              className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 lg:flex lg:group-data-vertical/tabs:flex-col"
            >
              {groups.map((group) => {
                const Icon = categoryIcons[group.id];
                return (
                  <TabsTrigger
                    key={group.id}
                    value={group.id}
                    className="group/trigger border-border bg-card text-foreground data-active:border-primary data-active:bg-accent/60 hover:border-primary/40 dark:data-active:border-primary h-full justify-start gap-3 rounded-xl border px-3 py-2.5 text-left whitespace-normal shadow-none after:hidden data-active:shadow-sm lg:py-3"
                  >
                    <span className="bg-accent text-accent-foreground group-data-active/trigger:bg-primary group-data-active/trigger:text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors lg:size-10">
                      <Icon className="size-4 lg:size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{group.title}</span>
                      <span className="text-muted-foreground hidden text-xs font-normal lg:block">
                        {questionCount(group.items.length)}
                      </span>
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <ContactCard className="hidden lg:block" />
          </div>

          <div className="min-w-0">
            {groups.map((group) => {
              const Icon = categoryIcons[group.id];
              return (
                <TabsContent key={group.id} value={group.id}>
                  <AnimatedSection>
                    <div className="mb-6 flex items-start gap-4">
                      <span className="bg-primary text-primary-foreground hidden size-12 shrink-0 items-center justify-center rounded-xl sm:flex">
                        <Icon className="size-6" aria-hidden />
                      </span>
                      <div>
                        <h2 className="text-2xl font-bold">{group.title}</h2>
                        <p className="text-muted-foreground mt-1">{group.description}</p>
                      </div>
                    </div>
                    <FaqAccordion items={group.items} openFirst numbered />
                  </AnimatedSection>
                </TabsContent>
              );
            })}
            <ContactCard className="mt-10 lg:hidden" />
          </div>
        </Tabs>
      </section>
    </>
  );
}

function ContactCard({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="dark bg-background text-foreground relative overflow-hidden rounded-2xl border p-5">
        <SteelBackdrop glow="top-right" fadeFrom="top" sparks={false} />
        <div className="relative">
          <span className="bg-primary text-primary-foreground inline-flex size-10 items-center justify-center rounded-lg">
            <MessageCircleQuestionIcon className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Nenašli ste odpoveď?</p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Zavolajte alebo napíšte. Radi poradíme aj s otázkou, ktorá tu nie je.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" nativeButton={false} render={<a href={siteConfig.phoneHref} />}>
              <PhoneIcon aria-hidden />
              Zavolať
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/kontakt" />}
            >
              Napísať správu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
