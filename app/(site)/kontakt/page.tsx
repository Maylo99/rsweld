import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { InstagramIcon } from "@/components/shared/instagram-icon";
import { PageHero } from "@/components/shared/page-hero";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt na RSweld - René Slávik, Považská Bystrica. Zváranie nerezu, zábradlia a priemyselné komponenty. Zavolajte alebo napíšte.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        id="contact-heading"
        eyebrow="Kontakt"
        title="Ozvite sa nám"
        description="Na telefóne aj e-maile - a keď treba, prídeme zamerať priamo k vám."
      />

      <section
        className="mx-auto max-w-6xl px-4 py-12 sm:py-16"
        aria-label="Kontaktné údaje a formulár"
      >
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            {/* Contact details */}
            <ul className="space-y-4">
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="group border-border bg-card hover:border-primary/40 flex items-center gap-4 rounded-xl border p-4 transition-colors"
                >
                  <span className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <PhoneIcon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="text-muted-foreground block text-xs font-semibold tracking-wide uppercase">
                      Telefón
                    </span>
                    <span className="font-semibold">{siteConfig.phone}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.emailHref}
                  className="group border-border bg-card hover:border-primary/40 flex items-center gap-4 rounded-xl border p-4 transition-colors"
                >
                  <span className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <MailIcon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="text-muted-foreground block text-xs font-semibold tracking-wide uppercase">
                      E-mail
                    </span>
                    <span className="font-semibold">{siteConfig.email}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border-border bg-card hover:border-primary/40 flex items-center gap-4 rounded-xl border p-4 transition-colors"
                >
                  <span className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <InstagramIcon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="text-muted-foreground block text-xs font-semibold tracking-wide uppercase">
                      Instagram
                    </span>
                    <span className="font-semibold">{siteConfig.instagramHandle}</span>
                  </span>
                </a>
              </li>
              <li>
                <div className="border-border bg-card flex items-center gap-4 rounded-xl border p-4">
                  <span className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-lg">
                    <MapPinIcon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="text-muted-foreground block text-xs font-semibold tracking-wide uppercase">
                      Oblasť pôsobenia
                    </span>
                    <span className="font-semibold">{siteConfig.serviceArea}</span>
                  </span>
                </div>
              </li>
            </ul>

            {/* Map */}
            <div className="border-border overflow-hidden rounded-xl border">
              <iframe
                title="Mapa - Považská Bystrica"
                src="https://www.google.com/maps?q=Pova%C5%BEsk%C3%A1%20Bystrica&output=embed"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          {/* Contact form */}
          <div className="border-border bg-card h-fit rounded-2xl border p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Napíšte nám</h2>
            <p className="text-muted-foreground mt-1 mb-6 text-sm">
              Odpovedáme zvyčajne do jedného pracovného dňa.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
