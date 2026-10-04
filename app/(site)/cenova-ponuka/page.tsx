import { ClockIcon, FileTextIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";

import { QuoteForm } from "@/components/forms/quote-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { siteConfig } from "@/lib/site";

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
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <SectionHeading
        eyebrow="Cenová ponuka"
        title="Nezáväzný dopyt"
        description="Vyplňte formulár alebo rovno zavolajte — obe cesty vedú k rovnakej ponuke."
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <div className="border-border bg-card rounded-2xl border p-6 sm:p-8">
          <QuoteForm />
        </div>

        <aside className="space-y-8">
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
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="border-border rounded-xl border p-5">
            <p className="text-sm font-semibold">Radšej telefonicky?</p>
            <a
              href={siteConfig.phoneHref}
              className="text-primary mt-1 block text-lg font-semibold hover:underline"
            >
              {siteConfig.phone}
            </a>
            <p className="text-muted-foreground mt-1 text-sm">
              {siteConfig.owner} · {siteConfig.location}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
