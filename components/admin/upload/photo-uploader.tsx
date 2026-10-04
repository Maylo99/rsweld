"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LayoutTemplate,
  Loader2,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";

import { uploadPhotoAction } from "@/app/admin/actions";
import { PlacementPicker } from "@/components/admin/placement-picker";
import { pluralizePhotos } from "@/components/admin/photos/photo-library";
import { TagPicker } from "@/components/admin/tag-picker";
import { compressImage, ImageDecodeError } from "@/components/admin/upload/compress-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { placementConfig } from "@/lib/placements";
import type { PlacementKey, TagItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type UploadStatus = "ready" | "uploading" | "done" | "error";

type QueuedPhoto = {
  key: string;
  file: File;
  preview: string;
  title: string;
  status: UploadStatus;
  error?: string;
};

type PhotoUploaderProps = {
  tags: TagItem[];
  /** How many photos each section holds right now. */
  occupied: Record<PlacementKey, number>;
  disabled?: boolean;
};

/** Camera / messenger file names carry no meaning — don't prefill them. */
const MEANINGLESS_NAME =
  /^(img|dsc|dscn|dcim|pxl|mvimg|photo|image|whatsapp|screenshot|snimka|fotka|p\d|\d)[\s_-]?/i;

function titleFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  if (MEANINGLESS_NAME.test(base)) return "";
  const words = base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function PhotoUploader({ tags, occupied, disabled }: PhotoUploaderProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<QueuedPhoto[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [placements, setPlacements] = useState<PlacementKey[]>(["GALLERY"]);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const queueRef = useRef(queue);

  // Free preview URLs when leaving the page.
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => () => queueRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), []);

  const pendingItems = queue.filter((item) => item.status !== "done");
  const doneCount = queue.filter((item) => item.status === "done").length;
  const allDone = queue.length > 0 && pendingItems.length === 0;

  // A choice stops applying when more photos are added than the section fits.
  const validPlacements = placements.filter((placement) => {
    const { limit } = placementConfig[placement];
    if (limit === undefined) return true;
    if (limit === 1) return pendingItems.length <= 1;
    return pendingItems.length <= limit - occupied[placement];
  });

  const addFiles = (files: FileList | File[]) => {
    const images = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name),
    );
    setQueue((current) => [
      ...current,
      ...images.map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
        title: titleFromFileName(file.name),
        status: "ready" as const,
      })),
    ]);
  };

  const update = (key: string, patch: Partial<QueuedPhoto>) =>
    setQueue((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const remove = (key: string) =>
    setQueue((current) => {
      const item = current.find((entry) => entry.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return current.filter((entry) => entry.key !== key);
    });

  const missingTitles = pendingItems.filter((item) => item.title.trim().length < 2);

  const uploadAll = async () => {
    setShowErrors(true);
    if (missingTitles.length > 0) {
      document.getElementById(`title-${missingTitles[0].key}`)?.focus();
      return;
    }

    setRunning(true);
    // Tags typed as new are created by the first upload; later uploads find
    // them by name, so every photo ends up with the same tags.
    for (const item of pendingItems) {
      update(item.key, { status: "uploading", error: undefined });
      try {
        const file = await compressImage(item.file);
        const formData = new FormData();
        formData.set("image", file);
        formData.set("title", item.title.trim());
        tagIds.forEach((id) => formData.append("tagIds", id));
        newTags.forEach((name) => formData.append("newTags", name));
        validPlacements.forEach((placement) => formData.append("placements", placement));

        const result = await uploadPhotoAction(formData);
        update(
          item.key,
          result.ok ? { status: "done" } : { status: "error", error: result.message },
        );
      } catch (error) {
        update(item.key, {
          status: "error",
          error:
            error instanceof ImageDecodeError
              ? error.message
              : "Nahrávanie zlyhalo. Skontrolujte internet a skúste znova.",
        });
      }
    }
    setRunning(false);
    router.refresh();
  };

  const reset = () => {
    queue.forEach((item) => URL.revokeObjectURL(item.preview));
    setQueue([]);
    setShowErrors(false);
  };

  if (allDone) {
    return (
      <div className="border-border bg-card mt-6 rounded-2xl border p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        <h2 className="font-heading mt-4 text-xl font-semibold">
          Hotovo — nahraté {doneCount} {pluralizePhotos(doneCount)}
        </h2>
        <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
          Nové fotky sú zaradené na koniec každého zoznamu. Poradie zmeníte v časti Zobrazenie na
          webe.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button size="lg" onClick={reset}>
            <ImagePlus />
            Nahrať ďalšie
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/zobrazenie" />}
          >
            <LayoutTemplate />
            Upraviť poradie
          </Button>
          <Button size="lg" variant="ghost" nativeButton={false} render={<Link href="/admin" />}>
            Prejsť na fotky
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Step 1 — choose files */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !running) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled && !running) addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "border-border bg-card rounded-2xl border-2 border-dashed transition-colors",
          dragging && "border-primary bg-primary/5",
          queue.length > 0 ? "p-4" : "p-10 sm:p-14",
        )}
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        {queue.length === 0 ? (
          <div className="text-center">
            <div className="bg-primary/10 text-primary-soft mx-auto flex size-14 items-center justify-center rounded-full">
              <Upload className="size-6" />
            </div>
            <h2 className="font-heading mt-4 text-lg font-semibold">
              Pretiahnite sem fotky alebo ich vyberte
            </h2>
            <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
              Naraz môžete vybrať aj viac fotiek. Veľké fotky z mobilu sa pred nahraním automaticky
              zmenšia, takže nahrávanie je rýchle.
            </p>
            <Button
              className="mt-5"
              size="lg"
              disabled={disabled}
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus />
              Vybrať fotky
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="font-medium">
                Vybraté: {queue.length} {pluralizePhotos(queue.length)}
              </span>
              <span className="text-muted-foreground"> · ďalšie môžete pretiahnuť sem</span>
            </p>
            <Button variant="outline" disabled={running} onClick={() => fileInput.current?.click()}>
              <ImagePlus />
              Pridať ďalšie
            </Button>
          </div>
        )}
      </div>

      {queue.length > 0 ? (
        <>
          {/* Step 2 — names */}
          <section className="border-border bg-card rounded-2xl border p-4 sm:p-6">
            <h2 className="font-heading text-base font-semibold">1. Pomenujte fotky</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Názov sa zobrazí pod fotkou v galérii. Popis doplníte neskôr pri úprave fotky.
            </p>
            <ul className="mt-4 divide-y">
              {queue.map((item, index) => {
                const invalid =
                  showErrors && item.status !== "done" && item.title.trim().length < 2;
                return (
                  <li key={item.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-20">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                      <img src={item.preview} alt="" className="size-full object-cover" />
                      {item.status === "uploading" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                          <Loader2 className="size-5 animate-spin" />
                        </div>
                      ) : null}
                      {item.status === "done" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/70 text-white">
                          <CheckCircle2 className="size-6" />
                        </div>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`title-${item.key}`} className="sr-only">
                        Názov fotky {index + 1}
                      </label>
                      <Input
                        id={`title-${item.key}`}
                        value={item.title}
                        maxLength={120}
                        disabled={running || item.status === "done"}
                        placeholder="Napr. Lankové zábradlie na terase"
                        aria-invalid={invalid || undefined}
                        onChange={(event) => update(item.key, { title: event.target.value })}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            const next = queue[index + 1];
                            if (next) document.getElementById(`title-${next.key}`)?.focus();
                          }
                        }}
                      />
                      <p className="mt-1 truncate text-xs">
                        {item.status === "error" ? (
                          <span className="text-destructive inline-flex items-center gap-1">
                            <AlertCircle className="size-3.5" />
                            {item.error}
                          </span>
                        ) : invalid ? (
                          <span className="text-destructive">Zadajte názov (aspoň 2 znaky).</span>
                        ) : item.status === "done" ? (
                          <span className="text-emerald-700 dark:text-emerald-400">Nahraté</span>
                        ) : (
                          <span className="text-muted-foreground">{item.file.name}</span>
                        )}
                      </p>
                    </div>
                    {item.status !== "done" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={running}
                        onClick={() => remove(item.key)}
                        aria-label={`Odstrániť ${item.file.name} zo zoznamu`}
                      >
                        <X />
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Step 3 — shared settings */}
          <section className="border-border bg-card rounded-2xl border p-4 sm:p-6">
            <h2 className="font-heading text-base font-semibold">
              2. Tagy pre všetky vybraté fotky
            </h2>
            <p className="text-muted-foreground mt-0.5 mb-4 text-sm">
              Podľa tagov si návštevník filtruje galériu. Fotku môžete neskôr pretagovať aj
              jednotlivo.
            </p>
            <TagPicker
              tags={tags}
              selectedIds={tagIds}
              newTags={newTags}
              onChange={(ids, names) => {
                setTagIds(ids);
                setNewTags(names);
              }}
              disabled={running}
            />
          </section>

          <section className="border-border bg-card rounded-2xl border p-4 sm:p-6">
            <h2 className="font-heading text-base font-semibold">3. Kde sa majú zobraziť</h2>
            <p className="text-muted-foreground mt-0.5 mb-4 text-sm">
              Nové fotky sa zaradia na koniec. Ak nevyberiete nič, fotky sa uložia len do
              administrácie.
            </p>
            <PlacementPicker
              value={validPlacements}
              onChange={setPlacements}
              occupied={occupied}
              photoCount={Math.max(1, pendingItems.length)}
              disabled={running}
            />
          </section>

          {/* Submit */}
          <div className="border-border bg-background/95 sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
            <p className="text-muted-foreground text-sm">
              {running
                ? `Nahrávam… ${doneCount} z ${queue.length}`
                : doneCount > 0
                  ? `Nahraté ${doneCount} z ${queue.length} — zvyšné skúste znova.`
                  : `Pripravené: ${pendingItems.length} ${pluralizePhotos(pendingItems.length)}`}
            </p>
            <div className="ml-auto flex gap-2">
              {!running ? (
                <Button variant="ghost" onClick={reset}>
                  Zrušiť
                </Button>
              ) : null}
              <Button size="lg" disabled={running || disabled} onClick={uploadAll}>
                {running ? (
                  <Loader2 className="animate-spin" />
                ) : doneCount > 0 ? (
                  <RotateCcw />
                ) : (
                  <Upload />
                )}
                {running
                  ? "Nahrávam…"
                  : doneCount > 0
                    ? "Skúsiť znova"
                    : `Nahrať ${pendingItems.length} ${pluralizePhotos(pendingItems.length)}`}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
