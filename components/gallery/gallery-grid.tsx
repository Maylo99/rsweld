"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { Lightbox } from "@/components/gallery/lightbox";
import { AnimatedSection } from "@/components/shared/animated-section";
import {
  REFERENCE_CATEGORIES,
  referenceCategoryLabels,
  type ReferenceCategoryKey,
  type ReferenceItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type GalleryGridProps = {
  references: ReferenceItem[];
};

type CategoryFilter = ReferenceCategoryKey | "ALL";

export function GalleryGrid({ references }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Only offer categories that actually have items.
  const availableCategories = useMemo(
    () =>
      REFERENCE_CATEGORIES.filter((category) =>
        references.some((reference) => reference.category === category),
      ),
    [references],
  );

  const visibleReferences = useMemo(
    () =>
      activeCategory === "ALL"
        ? references
        : references.filter((reference) => reference.category === activeCategory),
    [activeCategory, references],
  );

  const filters: { value: CategoryFilter; label: string }[] = [
    { value: "ALL", label: "Všetky" },
    ...availableCategories.map((category) => ({
      value: category as CategoryFilter,
      label: referenceCategoryLabels[category],
    })),
  ];

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter podľa kategórie">
        {filters.map((filter) => {
          const isActive = activeCategory === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setActiveCategory(filter.value);
                setOpenIndex(null);
              }}
              aria-pressed={isActive}
              className={cn(
                "focus-visible:ring-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleReferences.map((reference, index) => (
          <AnimatedSection key={reference.id} delay={Math.min(index, 5) * 0.05}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group border-border bg-card focus-visible:ring-ring block h-full w-full overflow-hidden rounded-xl border text-left transition-all outline-none hover:shadow-lg focus-visible:ring-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={reference.imagePath}
                  alt={reference.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  // First row is above the fold — load eagerly for LCP.
                  priority={index < 3}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  {referenceCategoryLabels[reference.category]}
                </p>
                <h2 className="mt-1.5 text-base font-semibold">{reference.title}</h2>
                {reference.description ? (
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
                    {reference.description}
                  </p>
                ) : null}
              </div>
            </button>
          </AnimatedSection>
        ))}
      </div>

      {visibleReferences.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-center">
          V tejto kategórii zatiaľ nemáme zverejnené realizácie.
        </p>
      ) : null}

      <Lightbox items={visibleReferences} openIndex={openIndex} onOpenIndexChange={setOpenIndex} />
    </div>
  );
}
