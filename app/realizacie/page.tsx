import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Realizácie",
};

export default function RealizaciePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="text-3xl font-bold tracking-tight">Realizácie</h1>
      <p className="text-muted-foreground mt-4">
        TODO (phase 2): galéria referencií z Supabase Storage (bucket <code>references</code>).
      </p>
    </section>
  );
}
