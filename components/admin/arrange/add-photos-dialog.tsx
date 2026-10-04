"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { GalleryData } from "@/lib/types";
import { cn } from "@/lib/utils";

type AddPhotosDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: GalleryData;
  /** Photos already in the list. */
  excludeIds: string[];
  title: string;
  description: string;
  /** Free slots in a limited section. */
  maxSelectable?: number;
  /** Single-photo section: picking a photo replaces the current one. */
  singleChoice?: boolean;
  onConfirm: (ids: string[], done: () => void) => void;
  pending: boolean;
};

/** Photo picker for adding photos to a section or a tag. */
export function AddPhotosDialog({
  open,
  onOpenChange,
  data,
  excludeIds,
  title,
  description,
  maxSelectable,
  singleChoice = false,
  onConfirm,
  pending,
}: AddPhotosDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("");

  const candidates = useMemo(() => {
    const excluded = new Set(excludeIds);
    const needle = query.trim().toLowerCase();
    return data.photos.filter(
      (photo) =>
        !excluded.has(photo.id) &&
        (!needle || photo.title.toLowerCase().includes(needle)) &&
        (!tagFilter || photo.tagIds.includes(tagFilter)),
    );
  }, [data.photos, excludeIds, query, tagFilter]);

  const single = singleChoice;
  const limitReached = maxSelectable !== undefined && selected.length >= maxSelectable;

  const toggle = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (single) return [id];
      if (limitReached) return current;
      return [...current, id];
    });
  };

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSelected([]);
      setQuery("");
      setTagFilter("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {maxSelectable !== undefined && !single ? ` Voľné miesta: ${maxSelectable}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hľadať podľa názvu…"
              className="pl-8"
              aria-label="Hľadať fotky"
            />
          </div>
          {data.tags.length > 0 ? (
            <select
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              aria-label="Filtrovať podľa tagu"
              className="border-input bg-background h-8 rounded-lg border px-2.5 text-sm"
            >
              <option value="">Všetky tagy</option>
              {data.tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
          {candidates.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              {excludeIds.length === data.photos.length
                ? "Všetky fotky už sú v tomto zozname."
                : "Žiadna fotka nezodpovedá hľadaniu."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 pb-1 sm:grid-cols-4">
              {candidates.map((photo) => {
                const isSelected = selected.includes(photo.id);
                const blocked = !isSelected && limitReached && !single;
                return (
                  <li key={photo.id}>
                    <button
                      type="button"
                      onClick={() => toggle(photo.id)}
                      disabled={blocked}
                      aria-pressed={isSelected}
                      className={cn(
                        "focus-visible:ring-ring relative block w-full overflow-hidden rounded-lg border-2 text-left transition-all outline-none focus-visible:ring-2 disabled:opacity-40",
                        isSelected ? "border-primary" : "hover:border-border border-transparent",
                      )}
                    >
                      <div className="bg-muted relative aspect-[4/3]">
                        <Image
                          src={photo.imagePath}
                          alt=""
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                        <span
                          className={cn(
                            "absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-md border-2",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-white/90 bg-black/30 text-transparent",
                          )}
                        >
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      </div>
                      <p className="truncate px-1 py-1.5 text-xs font-medium">{photo.title}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            Zrušiť
          </Button>
          <Button
            disabled={selected.length === 0 || pending}
            onClick={() => onConfirm(selected, () => close(false))}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Check />}
            {single
              ? "Použiť fotku"
              : selected.length > 0
                ? `Pridať vybraté (${selected.length})`
                : "Pridať vybraté"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
