import { PhoneIcon } from "lucide-react";
import type { ReactNode } from "react";

import { SteelBackdrop } from "@/components/shared/steel-backdrop";
import { siteConfig } from "@/lib/site";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Id of the h1, used for `aria-labelledby` on the section. */
  id: string;
  /** Optional card on the right (bottom-aligned on desktop, below on mobile). */
  aside?: ReactNode;
};

/*
 * Compact dark header shared by every subpage: eyebrow, h1, lead text and an
 * optional aside card over the steel backdrop. Static on purpose (no
 * scroll-in) — it holds the page's h1 and often its LCP text.
 */
export function PageHero({ eyebrow, title, description, id, aside }: PageHeroProps) {
  return (
    <section
      className="dark bg-background text-foreground relative overflow-hidden"
      aria-labelledby={id}
    >
      <SteelBackdrop glow="top-right" fadeFrom="top" sparks={false} />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:py-16 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-primary-soft text-sm font-semibold tracking-wide uppercase">
            {eyebrow}
          </p>
          <h1 id={id} className="mt-3 max-w-2xl text-4xl font-bold text-balance sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0 self-start lg:self-auto">{aside}</div> : null}
      </div>
    </section>
  );
}

/** Phone shortcut card for the hero aside. */
export function PageHeroPhoneCard({ label }: { label: string }) {
  return (
    <a
      href={siteConfig.phoneHref}
      className="group border-border bg-card/60 hover:border-primary-soft flex items-center gap-4 rounded-xl border p-4 backdrop-blur transition-colors"
    >
      <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-lg">
        <PhoneIcon className="size-5" aria-hidden />
      </span>
      <span>
        <span className="text-muted-foreground block text-xs font-semibold tracking-wide uppercase">
          {label}
        </span>
        <span className="group-hover:text-primary-soft font-semibold transition-colors">
          {siteConfig.phone}
        </span>
      </span>
    </a>
  );
}
