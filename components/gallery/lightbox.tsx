"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { referenceCategoryLabels, type ReferenceItem } from "@/lib/types";

type LightboxProps = {
  items: ReferenceItem[];
  /** Index of the open item within `items`, or null when closed. */
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
};

/*
 * Minimal image lightbox on top of the dialog primitive: prev/next buttons,
 * arrow-key navigation, Escape handled by the dialog itself.
 */
export function Lightbox({ items, openIndex, onOpenIndexChange }: LightboxProps) {
  const item = openIndex !== null ? items[openIndex] : undefined;

  const showPrevious = useCallback(() => {
    if (openIndex === null || items.length === 0) return;
    onOpenIndexChange((openIndex - 1 + items.length) % items.length);
  }, [items.length, onOpenIndexChange, openIndex]);

  const showNext = useCallback(() => {
    if (openIndex === null || items.length === 0) return;
    onOpenIndexChange((openIndex + 1) % items.length);
  }, [items.length, onOpenIndexChange, openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openIndex, showNext, showPrevious]);

  return (
    <Dialog
      open={openIndex !== null}
      onOpenChange={(open) => {
        if (!open) onOpenIndexChange(null);
      }}
    >
      <DialogContent className="w-[min(96vw,64rem)] max-w-none border-none bg-transparent p-0 shadow-none">
        {item ? (
          <figure className="overflow-hidden rounded-xl">
            <DialogTitle className="sr-only">{item.title}</DialogTitle>
            <DialogDescription className="sr-only">
              {referenceCategoryLabels[item.category]}
            </DialogDescription>

            <div className="relative aspect-[4/3] w-full">
              <Image
                src={item.imagePath}
                alt={item.imageAlt}
                fill
                sizes="96vw"
                className="object-cover"
                priority
              />
            </div>

            <figcaption className="bg-card flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  {referenceCategoryLabels[item.category]}
                </p>
                <p className="mt-0.5 font-semibold">{item.title}</p>
                {item.description ? (
                  <p className="text-muted-foreground mt-0.5 text-sm">{item.description}</p>
                ) : null}
              </div>
              {items.length > 1 ? (
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={showPrevious}
                    aria-label="Predchádzajúca fotka"
                  >
                    <ChevronLeftIcon aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={showNext}
                    aria-label="Ďalšia fotka"
                  >
                    <ChevronRightIcon aria-hidden />
                  </Button>
                </div>
              ) : null}
            </figcaption>
          </figure>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
