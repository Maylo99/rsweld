import { ClockIcon, FileTextIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";

import { QuoteForm } from "@/components/forms/quote-form";
import { PageHero, PageHeroPhoneCard } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Cenová ponuka",
  description:
    "Nezáväzná cenová ponuka na zváranie nerezu — zábradlia, konštrukcie a priemyselné komponenty. Pošlite popis zákazky alebo výkres, ozveme sa do pár dní.",
};

const steps = [
  {
    icon: FileTextIcon,
    title: "Popíšte zákazku",
    text: "Stačí pár viet — čo potrebujete, rozmery a prípadne výkres alebo fotka.",
  },
  {
    icon: ClockIcon,
    title: "Ozveme sa do 2–3 dní",
    text: "Ponuku pripravíme zvyčajne do niekoľkých pracovných dní.",
  },
  {
    icon: PhoneIcon,
    title: "Doladíme detaily",
    text: "Termín, materiál aj montáž si dohodneme tak, aby vám to sedelo.",
  },
];

export default function QuoteRequestPage() {
  return (
    <>
      <PageHero
        id="quote-heading"
        eyebrow="Cenová ponuka"
        title="Nezáväzný dopyt"
        description="Vyplňte formulár alebo rovno zavolajte — obe cesty vedú k rovnakej ponuke."
        aside={<PageHeroPhoneCard label="Radšej telefonicky?" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-label="Formulár dopytu">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="border-border bg-card rounded-2xl border p-6 sm:p-8">
            <QuoteForm />
          </div>

          <aside>
            <ol className="space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {index + 1}. {step.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </>
  );
}
