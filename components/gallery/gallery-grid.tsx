"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Lightbox } from "@/components/gallery/lightbox";
import { AnimatedSection } from "@/components/shared/animated-section";
import type { PublicGalleryTag } from "@/lib/gallery";
import type { DisplayPhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

type GalleryGridProps = {
  /** Gallery photos in the "Všetky" order. */
  photos: DisplayPhoto[];
  /** Filter tags, each with its own photo order. */
  tags: PublicGalleryTag[];
};

const ALL = "ALL";

export function GalleryGrid({ photos, tags }: GalleryGridProps) {
  const [activeTagId, setActiveTagId] = useState<string>(ALL);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // `?tag=slug` deep links (e.g. from homepage cards). Read after mount so the
  // page itself stays statically rendered.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("tag");
    const tag = tags.find((item) => item.slug === slug);
    if (tag) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL
      setActiveTagId(tag.id);
    }
  }, [tags]);

  const visiblePhotos = useMemo(() => {
    const tag = tags.find((item) => item.id === activeTagId);
    if (!tag) {
      return photos;
    }
    const byId = new Map(photos.map((photo) => [photo.id, photo]));
    return tag.photoIds.map((id) => byId.get(id)).filter((photo) => photo !== undefined);
  }, [activeTagId, photos, tags]);

  const filters = [
    { id: ALL, slug: null, label: "Všetky", count: photos.length },
    ...tags.map((tag) => ({
      id: tag.id,
      slug: tag.slug,
      label: tag.name,
      count: tag.photoIds.length,
    })),
  ];

  const selectFilter = (id: string, slug: string | null) => {
    setActiveTagId(id);
    setOpenIndex(null);
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set("tag", slug);
    } else {
      url.searchParams.delete("tag");
    }
    window.history.replaceState(null, "", url);
  };

  return (
    <div>
      {/* Tag filter */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter podľa témy">
          {filters.map((filter) => {
            const isActive = activeTagId === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => selectFilter(filter.id, filter.slug)}
                aria-pressed={isActive}
                className={cn(
                  "focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground/80",
                  )}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePhotos.map((photo, index) => (
          <AnimatedSection key={photo.id} delay={Math.min(index, 5) * 0.05}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group border-border bg-card focus-visible:ring-ring block h-full w-full overflow-hidden rounded-xl border text-left transition-all outline-none hover:shadow-lg focus-visible:ring-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={photo.imagePath}
                  alt={photo.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  // First row is above the fold — load eagerly for LCP.
                  priority={index < 3}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                {photo.tags.length > 0 ? (
                  <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                    {photo.tags[0].name}
                  </p>
                ) : null}
                <h2 className="mt-1.5 text-base font-semibold">{photo.title}</h2>
                {photo.description ? (
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
                    {photo.description}
                  </p>
                ) : null}
              </div>
            </button>
          </AnimatedSection>
        ))}
      </div>

      {visiblePhotos.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-center">
          Zatiaľ tu nemáme zverejnené žiadne fotky.
        </p>
      ) : null}

      <Lightbox items={visiblePhotos} openIndex={openIndex} onOpenIndexChange={setOpenIndex} />
    </div>
  );
}
