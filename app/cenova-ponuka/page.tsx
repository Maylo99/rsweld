import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cenová ponuka",
};

export default function CenovaPonukaPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="text-3xl font-bold tracking-tight">Cenová ponuka</h1>
      <p className="text-muted-foreground mt-4">
        TODO (phase 2): formulár dopytu (napojený na <code>/api/inquiries</code>,
        type=&quot;quote&quot;).
      </p>
    </section>
  );
}
