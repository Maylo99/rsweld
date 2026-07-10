import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
};

export default function KontaktPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="text-3xl font-bold tracking-tight">Kontakt</h1>
      <p className="text-muted-foreground mt-4">
        TODO (phase 2): kontaktné údaje, mapa a kontaktný formulár (type=&quot;contact&quot;).
      </p>
    </section>
  );
}
