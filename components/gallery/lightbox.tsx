"use client";

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DisplayPhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

type LightboxProps = {
  items: DisplayPhoto[];
  /** Index of the open item within `items`, or null when closed. */
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
};

/** Minimum horizontal finger travel (px) that counts as a swipe. */
const SWIPE_THRESHOLD = 50;

const overlayButtonClass =
  "bg-background/85 hover:bg-background absolute z-10 shadow-sm backdrop-blur";

type NavZoneProps = {
  side: "left" | "right";
  onClick: () => void;
  label: string;
  children: React.ReactNode;
};

/*
 * Prev/next hit area: a full-height strip along the photo edge, with the
 * round button drawn inside it. The strip is the actual <button>, so a click
 * anywhere near the arrow counts. Centering is done with flexbox, not
 * `-translate-y-1/2` - the button's `active:translate-y-px` press effect
 * would override that transform and make the button jump away mid-click.
 */
function NavZone({ side, onClick, label, children }: NavZoneProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group/nav absolute inset-y-0 z-10 flex w-1/4 max-w-36 cursor-pointer items-center px-3 outline-none",
        side === "left" ? "left-0 justify-start" : "right-0 justify-end",
      )}
    >
      <span
        className={cn(
          buttonVariants({ variant: "secondary", size: "icon-lg" }),
          overlayButtonClass,
          "group-hover/nav:bg-background group-focus-visible/nav:ring-ring/50 static size-11 rounded-full group-focus-visible/nav:ring-3",
        )}
      >
        {children}
      </span>
    </button>
  );
}

/*
 * Minimal image lightbox on top of the dialog primitive: prev/next buttons
 * over the photo, arrow keys, touch swipe; Escape handled by the dialog.
 *
 * The photo is shown uncropped at its natural aspect ratio, as large as the
 * viewport allows (capped by both width and height, room left for the
 * caption). The caption uses `w-0 min-w-full` so it follows the image width
 * instead of widening the dialog. The dialog is pinned with `left-0 right-0
 * mx-auto` instead of `left-1/2`, otherwise `w-fit` could only grow to half
 * the viewport.
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

  // Capture phase: the dialog stops arrow-key propagation before it bubbles
  // up to `window`, so a bubbling listener never fires.
  useEffect(() => {
    if (openIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [openIndex, showNext, showPrevious]);

  const touchStartX = useRef<number | null>(null);
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (deltaX > SWIPE_THRESHOLD) showPrevious();
    if (deltaX < -SWIPE_THRESHOLD) showNext();
  };

  const hasMultiple = items.length > 1;
  return (
    <Dialog
      open={openIndex !== null}
      onOpenChange={(open) => {
        if (!open) onOpenIndexChange(null);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="right-0 left-0 mx-auto w-fit max-w-[96vw] translate-x-0 gap-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[96vw]"
      >
        {item ? (
          <figure className="relative overflow-hidden rounded-xl">
            <DialogClose
              render={
                <Button
                  variant="secondary"
                  size="icon"
                  className={cn(overlayButtonClass, "top-3 right-3 z-20")}
                />
              }
            >
              <XIcon aria-hidden />
              <span className="sr-only">Zavrieť</span>
            </DialogClose>
            <DialogTitle className="sr-only">{item.title}</DialogTitle>
            <DialogDescription className="sr-only">
              {item.tags.map((tag) => tag.name).join(", ")}
            </DialogDescription>

            <div
              className="relative"
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0].clientX;
              }}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                key={item.id}
                src={item.imagePath}
                alt={item.imageAlt}
                // Placeholder ratio until the file loads; the natural size wins after.
                width={2400}
                height={1800}
                sizes="96vw"
                className="bg-muted block h-auto max-h-[calc(100dvh-9rem)] w-auto max-w-[96vw]"
                priority
              />
              {hasMultiple ? (
                <>
                  <NavZone side="left" onClick={showPrevious} label="Predchádzajúca fotka">
                    <ChevronLeftIcon aria-hidden />
                  </NavZone>
                  <NavZone side="right" onClick={showNext} label="Ďalšia fotka">
                    <ChevronRightIcon aria-hidden />
                  </NavZone>
                </>
              ) : null}
            </div>

            <figcaption className="bg-card flex w-0 min-w-full items-center justify-between gap-4 p-4">
              <div>
                {item.tags.length > 0 ? (
                  <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                    {item.tags.map((tag) => tag.name).join(" · ")}
                  </p>
                ) : null}
                <p className="mt-0.5 font-semibold">{item.title}</p>
                {item.description ? (
                  <p className="text-muted-foreground mt-0.5 text-sm">{item.description}</p>
                ) : null}
              </div>
              {hasMultiple && openIndex !== null ? (
                <p
                  className="text-muted-foreground shrink-0 text-sm tabular-nums"
                  aria-live="polite"
                >
                  {openIndex + 1} / {items.length}
                </p>
              ) : null}
            </figcaption>
          </figure>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
