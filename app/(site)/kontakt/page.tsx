import { ClockIcon, FileTextIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ComponentType, ReactNode } from "react";

import { InquiryForm } from "@/components/forms/inquiry-form";
import { InstagramIcon } from "@/components/shared/instagram-icon";
import { PageHero, PageHeroPhoneCard } from "@/components/shared/page-hero";
import { siteConfig } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Kontakt a cenová ponuka",
  description:
    "Nezáväzná cenová ponuka na zváranie nerezu a ocele - zábradlia, konštrukcie a priemyselné komponenty z Považskej Bystrice. Pošlite popis zákazky alebo výkres, zavolajte alebo napíšte.",
  path: "/kontakt",
});

const steps = [
  {
    icon: FileTextIcon,
    title: "Popíšte zákazku",
    text: "Stačí pár viet - čo potrebujete, rozmery a prípadne výkres alebo fotka.",
  },
  {
    icon: ClockIcon,
    title: "Ozveme sa do 2-3 dní",
    text: "Ponuku pripravíme zvyčajne do niekoľkých pracovných dní.",
  },
  {
    icon: PhoneIcon,
    title: "Doladíme detaily",
    text: "Termín, materiál aj montáž si dohodneme tak, aby vám to sedelo.",
  },
];

function ContactCard({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-5" aria-hidden />
      </span>
      <span>
        <span className="text-muted-foreground block text-xs font-semibold tracking-wide uppercase">
          {label}
        </span>
        <span className="block font-semibold">{children}</span>
      </span>
    </>
  );
}

const cardClass = "border-border bg-card flex items-center gap-4 rounded-xl border p-4";
const linkCardClass = `${cardClass} hover:border-primary/40 transition-colors`;

export default function ContactPage() {
  return (
    <>
      <PageHero
        id="contact-heading"
        eyebrow="Kontakt"
        title="Nezáväzný dopyt alebo otázka"
        description="Pošlite popis zákazky, výkres alebo len otázku - a keď treba, prídeme zamerať priamo k vám."
        aside={<PageHeroPhoneCard label="Radšej telefonicky?" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-label="Formulár a kontakty">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div
            id="dopyt"
            className="border-border bg-card h-fit scroll-mt-24 rounded-2xl border p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold">Napíšte nám</h2>
            <p className="text-muted-foreground mt-1 mb-6 text-sm">
              Ozveme sa zvyčajne do 2-3 pracovných dní.
            </p>
            <InquiryForm />
          </div>

          <aside className="space-y-10">
            <div>
              <h2 className="text-base font-semibold">Ako to prebieha</h2>
              <ol className="mt-4 space-y-5">
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
            </div>

            <div>
              <h2 className="text-base font-semibold">Kontakty</h2>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href={siteConfig.phoneHref} className={linkCardClass}>
                    <ContactCard icon={PhoneIcon} label="Telefón">
                      {siteConfig.phone}
                    </ContactCard>
                  </a>
                </li>
                <li>
                  <a href={siteConfig.emailHref} className={linkCardClass}>
                    <ContactCard icon={MailIcon} label="E-mail">
                      {siteConfig.email}
                    </ContactCard>
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCardClass}
                  >
                    <ContactCard icon={InstagramIcon} label="Instagram">
                      {siteConfig.instagramHandle}
                    </ContactCard>
                  </a>
                </li>
                <li>
                  <div className={cardClass}>
                    <ContactCard icon={MapPinIcon} label="Oblasť pôsobenia">
                      {siteConfig.serviceArea}
                    </ContactCard>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border-border overflow-hidden rounded-xl border">
              <iframe
                title="Mapa - Považská Bystrica"
                src="https://www.google.com/maps?q=Pova%C5%BEsk%C3%A1%20Bystrica&output=embed"
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
