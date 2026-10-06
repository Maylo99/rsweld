import { HandshakeIcon, ScanSearchIcon, ShieldCheckIcon, TimerIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { CtaSection } from "@/components/home/cta-section";
import { AnimatedSection } from "@/components/shared/animated-section";
import { PageHero } from "@/components/shared/page-hero";
import { ProcessSection } from "@/components/shared/process-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPlacementPhotos } from "@/lib/queries";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "O nás",
  description:
    "RSweld je René Slávik, zvárač nerezu z Považskej Bystrice. Zábradlia a konštrukcie na mieru s citom pre detail, od zamerania až po montáž.",
};

// Re-generate at most once per hour when a database is connected.
export const revalidate = 3600;

// TODO: verify with client (years of practice, background story, values)
const facts = [
  { value: "5+", label: "rokov praxe so zváraním nerezu" },
  { value: "1", label: "človek od zamerania po montáž" },
  { value: "TIG", label: "precízna metóda zvárania" },
  { value: "304/316", label: "nerezová oceľ AISI" },
];

const values = [
  {
    icon: ScanSearchIcon,
    title: "Cit pre detail",
    text: "Zvar, ktorý vidno, musí vyzerať dobre aj zblízka. Brúsim a čistím, kým nie som spokojný ja, nie len zákazník.",
  },
  {
    icon: HandshakeIcon,
    title: "Osobný prístup",
    text: "Žiadne prepájanie na iné oddelenie. So mnou sa dohodnete na všetkom a ja zákazku aj vyrobím a namontujem.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Poctivý materiál",
    text: "Pracujem s kvalitnou nerezovou oceľou a zvary chemicky ošetrím, aby nerez zostal nerezom aj o dvadsať rokov.",
  },
  {
    icon: TimerIcon,
    title: "Dodržané slovo",
    text: "Termín a cenu, na ktorých sa dohodneme, dodržím. Ak sa niečo zmení, dozviete sa to odo mňa hneď.",
  },
];

/** Shown when the administrator has not picked a photo for the about section. */
const fallbackPhoto = {
  imagePath: "/references/tig-weld-detail.jpg",
  imageAlt: "Detail TIG zvaru nerezovej ocele z dielne RSweld",
};

export default async function AboutPage() {
  const [photo] = await getPlacementPhotos("HOME_ABOUT");
  const { imagePath, imageAlt } = photo ?? fallbackPhoto;

  return (
    <>
      {/* TODO: verify with client (personal story) */}
      <PageHero
        id="about-heading"
        eyebrow="O nás"
        title="Za každým zvarom stojí jeden človek"
        description="Bez tímu a obchodného oddelenia - jeden zvárač, jedna dielňa v Považskej Bystrici a poctivá práca s nerezom."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-label="Môj príbeh">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed">
              Volám sa {siteConfig.owner} a RSweld som založil s jednoduchou myšlienkou: robiť nerez
              poriadne. Za firmou nie je tím ani obchodné oddelenie. Som to ja, moja dielňa v
              Považskej Bystrici a niekoľko rokov praxe so zváraním nerezovej ocele.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Začínal som pri priemyselných komponentoch podľa výkresovej dokumentácie, kde
              rozhodujú desatiny milimetra. Tú presnosť si dnes nosím do každej zákazky, či ide o
              strojársky diel, zábradlie na schodisko alebo dizajnový stolík. Každý kus vyrábam sám,
              a preto viem, že je urobený dobre.
            </p>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={imagePath}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div
              aria-hidden
              className="border-primary absolute -bottom-3 -left-3 -z-10 h-full w-full rounded-2xl border-2"
            />
          </div>
        </div>

        <dl className="border-border mt-16 grid grid-cols-2 gap-6 border-y py-8 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-sm">{fact.label}</dt>
              <dd className="font-heading text-primary order-first text-3xl font-bold">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-muted/40 border-y" aria-labelledby="values-heading">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <AnimatedSection>
            <SectionHeading
              id="values-heading"
              eyebrow="Na čom mi záleží"
              title="Remeslo s citom pre detail"
              description="Malá dielňa má jednu veľkú výhodu: každá zákazka je pre mňa osobná."
            />
          </AnimatedSection>

          <ul className="mt-12 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <li key={value.title}>
                <AnimatedSection
                  delay={index * 0.06}
                  className="border-border bg-card h-full rounded-xl border p-5"
                >
                  <span className="bg-accent text-accent-foreground inline-flex size-10 items-center justify-center rounded-lg">
                    <value.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{value.text}</p>
                </AnimatedSection>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProcessSection />
      <CtaSection />
    </>
  );
}
