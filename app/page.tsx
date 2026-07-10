import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <p className="text-muted-foreground text-sm font-medium">{siteConfig.location}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{siteConfig.name}</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-lg">{siteConfig.description}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button render={<Link href="/cenova-ponuka" />}>Nezáväzná cenová ponuka</Button>
        <Button variant="outline" render={<Link href="/realizacie" />}>
          Pozrieť realizácie
        </Button>
      </div>

      {/* TODO (phase 2): hero, services, references preview, CTA, final copy. */}
    </section>
  );
}
