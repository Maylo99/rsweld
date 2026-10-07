import { HandshakeIcon, ScanSearchIcon, ShieldCheckIcon, TimerIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { CtaSection } from "@/components/home/cta-section";
import { AnimatedSection } from "@/components/shared/animated-section";
import { PageHero } from "@/components/shared/page-hero";
import { ProcessSection } from "@/components/shared/process-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPlacementPhotos } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "O nás",
  description:
    "RSweld je zváračská dielňa z Považskej Bystrice. Zábradlia a konštrukcie z nerezu aj ocele na mieru s citom pre detail, od zamerania až po montáž.",
  path: "/o-nas",
});

// Re-generate at most once per hour when a database is connected.
export const revalidate = 3600;

// TODO: verify with client (years of practice, background story, values)
const facts = [
  { value: "7+", label: "rokov praxe so zváraním nerezu a ocele" },
  { value: "TIG · MIG/MAG", label: "metódy zvárania" },
  { value: "2", label: "materiály - nerez aj oceľ" },
];

const values = [
  {
    icon: ScanSearchIcon,
    title: "Cit pre detail",
    text: "Zvar, ktorý vidno, musí vyzerať dobre aj zblízka. Brúsime a čistíme, kým nie je výsledok bez kompromisov.",
  },
  {
    icon: HandshakeIcon,
    title: "Osobný prístup",
    text: "Žiadne prepájanie z oddelenia na oddelenie. Zákazku s vami dohodneme, vyrobíme aj namontujeme - všetko pod jednou strechou.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Poctivý materiál",
    text: "Pracujeme s kvalitným nerezom aj oceľou. Nerezové zvary chemicky ošetríme, oceľ ochránime povrchovou úpravou, aby všetko vydržalo aj o dvadsať rokov.",
  },
  {
    icon: TimerIcon,
    title: "Dodržané slovo",
    text: "Termín a cenu, na ktorých sa dohodneme, dodržíme. Ak sa niečo zmení, dozviete sa to od nás hneď.",
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
      {/* TODO: verify with client (company story) */}
      <PageHero
        id="about-heading"
        eyebrow="O nás"
        title="Za každým zvarom stojí poctivé remeslo"
        description="Zváračská dielňa v Považskej Bystrici - zábradlia, konštrukcie a komponenty z nerezu aj ocele, vyrobené na mieru."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-label="Náš príbeh">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed">
              RSweld vznikol s jednoduchou myšlienkou: robiť nerez aj oceľ poriadne. Sme zváračská
              dielňa v Považskej Bystrici so sedemročnou praxou v zváraní nerezu a ocele a každú
              zákazku vedieme od prvého zamerania až po montáž.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Začínali sme pri priemyselných komponentoch podľa výkresovej dokumentácie, kde
              rozhodujú desatiny milimetra. Tú presnosť dnes prenášame do každej zákazky, či ide o
              strojársky diel, zábradlie na schodisko alebo dizajnový stolík. Každý kus vyrábame vo
              vlastnej dielni, a preto ručíme za to, že je urobený dobre.
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

        <dl className="border-border mt-16 grid gap-6 border-y py-8 sm:grid-cols-3">
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
              eyebrow="Na čom nám záleží"
              title="Remeslo s citom pre detail"
              description="Ako menšia dielňa máme jednu veľkú výhodu: každej zákazke venujeme plnú pozornosť."
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
