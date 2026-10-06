"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  GripVertical,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import { addToListAction, removeFromListAction, reorderListAction } from "@/app/admin/actions";
import { AddPhotosDialog } from "@/components/admin/arrange/add-photos-dialog";
import { useMutation } from "@/components/admin/use-mutation";
import { Button } from "@/components/ui/button";
import { placementConfig } from "@/lib/placements";
import type { GalleryData, OrderedList, PhotoItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type ListArrangerProps = {
  data: GalleryData;
  list: OrderedList;
  readOnly: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function describeList(data: GalleryData, list: OrderedList) {
  if (list.kind === "tag") {
    const tag = data.tags.find((item) => item.id === list.tagId);
    return {
      eyebrow: "Galéria - filter podľa tagu",
      title: tag?.name ?? "Neznámy tag",
      hint: "Poradie, v akom sa fotky zobrazia, keď si návštevník v galérii vyberie tento tag. Je nezávislé od poradia vo „Všetky“ aj v iných tagoch.",
      href: tag ? `/galeria?tag=${tag.slug}` : "/galeria",
      ids: data.tagOrder[list.tagId] ?? [],
      limit: undefined,
      addLabel: "Pridať fotky k tagu",
    };
  }

  const config = placementConfig[list.placement];
  return {
    eyebrow: config.page,
    title: list.placement === "GALLERY" ? "Všetky fotky" : config.label,
    hint:
      list.placement === "GALLERY"
        ? "Fotky na stránke Galéria a ich poradie pri filtri „Všetky“. Každý tag má vlastné poradie - vyberiete ho v zozname tagov."
        : list.placement === "HOME_ABOUT"
          ? "Jedna fotka vedľa textu „O nás“. Ak žiadnu nevyberiete, zobrazí sa predvolená."
          : `${config.hint} Zobrazí sa najviac ${config.limit} fotiek v tomto poradí.`,
    href: config.href,
    ids: data.placementOrder[list.placement],
    limit: config.limit,
    addLabel: list.placement === "HOME_ABOUT" ? "Vybrať fotku" : "Pridať fotky",
  };
}

export function ListArranger({ data, list, readOnly }: ListArrangerProps) {
  const info = describeList(data, list);
  const serverIds = info.ids;
  const photosById = useMemo(
    () => new Map(data.photos.map((photo) => [photo.id, photo])),
    [data.photos],
  );

  // Local (optimistic) order; re-synced whenever the server sends new data.
  const [order, setOrder] = useState(serverIds);
  const serverKey = serverIds.join(",");
  const [syncedKey, setSyncedKey] = useState(serverKey);
  if (syncedKey !== serverKey) {
    setSyncedKey(serverKey);
    setOrder(serverIds);
  }

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startSaving] = useTransition();
  const { pending, run } = useMutation();
  // Stable id keeps dnd-kit's aria-describedby identical on server and client.
  const dndId = useId();
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveVersion = useRef(0);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const saveOrder = (next: string[]) => {
    const previous = order;
    setOrder(next);
    setSaveState("saving");
    const version = ++saveVersion.current;

    startSaving(async () => {
      let ok = false;
      let message = "Poradie sa nepodarilo uložiť.";
      try {
        const result = await reorderListAction(list, next);
        ok = result.ok;
        if (!result.ok) message = result.message;
      } catch {
        message = "Spojenie zlyhalo - poradie sa neuložilo.";
      }
      // A newer save superseded this one; let it report instead.
      if (version !== saveVersion.current) return;

      if (ok) {
        setSaveState("saved");
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaveState("idle"), 2500);
      } else {
        setOrder(previous);
        setSaveState("error");
        const { toast } = await import("sonner");
        toast.error(message);
      }
    });
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    saveOrder(arrayMove(order, index, target));
  };

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(String(active.id));
    const to = order.indexOf(String(over.id));
    if (from !== -1 && to !== -1) saveOrder(arrayMove(order, from, to));
  };

  const removeOne = (photo: PhotoItem) =>
    run(() => removeFromListAction(list, [photo.id]), {
      success:
        list.kind === "tag"
          ? `Tag „${info.title}“ odobratý z „${photo.title}“.`
          : `„${photo.title}“ sa už v „${info.title}“ nezobrazí.`,
    });

  const photos = order.map((id) => photosById.get(id)).filter((photo) => photo !== undefined);
  const activePhoto = activeId ? photosById.get(activeId) : undefined;
  const inGallery = new Set(data.placementOrder.GALLERY);
  const full = info.limit !== undefined && info.limit > 1 && photos.length >= info.limit;
  const canSort = !readOnly && photos.length > 1;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium">{info.eyebrow}</p>
          <h2 className="font-heading mt-0.5 text-xl font-semibold">{info.title}</h2>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">{info.hint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={info.href} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink />
            Pozrieť na webe
          </Button>
          <Button disabled={readOnly || pending || full} onClick={() => setDialogOpen(true)}>
            <Plus />
            {info.addLabel}
          </Button>
        </div>
      </div>

      {/* Status line */}
      <div className="mt-4 flex min-h-6 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">
          {info.limit && info.limit > 1
            ? `${photos.length} z ${info.limit} miest`
            : `${photos.length} ${photos.length === 1 ? "fotka" : photos.length >= 2 && photos.length <= 4 ? "fotky" : "fotiek"}`}
          {canSort ? " · poradie zmeníte potiahnutím alebo šípkami" : ""}
        </span>
        {full && !readOnly ? (
          <span className="text-muted-foreground">
            Všetky miesta sú obsadené - ak chcete pridať inú fotku, najprv niektorú odoberte.
          </span>
        ) : null}
        <span aria-live="polite" className="inline-flex items-center gap-1.5">
          {saveState === "saving" ? (
            <>
              <Loader2 className="text-muted-foreground size-3.5 animate-spin" />
              <span className="text-muted-foreground">Ukladám poradie…</span>
            </>
          ) : saveState === "saved" ? (
            <>
              <Check className="size-3.5 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400">Poradie uložené</span>
            </>
          ) : null}
        </span>
      </div>

      {/* Sortable grid */}
      {photos.length === 0 ? (
        <div className="border-border mt-4 rounded-2xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            {list.kind === "tag"
              ? "Žiadna fotka zatiaľ nemá tento tag."
              : list.placement === "HOME_ABOUT"
                ? "Nie je vybraná žiadna fotka - na webe sa zobrazuje predvolená."
                : "V tejto časti zatiaľ nie sú žiadne fotky."}
          </p>
          <Button className="mt-4" disabled={readOnly} onClick={() => setDialogOpen(true)}>
            <Plus />
            {info.addLabel}
          </Button>
        </div>
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
          accessibility={{
            screenReaderInstructions: {
              draggable:
                "Fotku zdvihnete medzerníkom, presuniete šípkami, položíte medzerníkom, zrušíte klávesom Escape.",
            },
            announcements: {
              onDragStart: ({ active }) =>
                `Zdvihnutá fotka ${photosById.get(String(active.id))?.title ?? ""}.`,
              onDragOver: ({ over }) =>
                over ? `Nad pozíciou ${order.indexOf(String(over.id)) + 1}.` : "",
              onDragEnd: ({ over }) =>
                over ? `Fotka položená na pozíciu ${order.indexOf(String(over.id)) + 1}.` : "",
              onDragCancel: () => "Presun zrušený.",
            },
          }}
        >
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <ol className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {photos.map((photo, index) => (
                <SortablePhoto
                  key={photo.id}
                  photo={photo}
                  index={index}
                  total={photos.length}
                  disabled={!canSort}
                  readOnly={readOnly}
                  dimmed={info.limit !== undefined && index >= info.limit}
                  warning={
                    list.kind === "tag" && !inGallery.has(photo.id)
                      ? "Nie je v galérii - na webe sa neukáže"
                      : undefined
                  }
                  onShowInGallery={() =>
                    run(
                      () =>
                        addToListAction({ kind: "placement", placement: "GALLERY" }, [photo.id]),
                      { success: `„${photo.title}“ je teraz v galérii.` },
                    )
                  }
                  onMove={(delta) => move(index, delta)}
                  onRemove={() => removeOne(photo)}
                  removeLabel={list.kind === "tag" ? "Odobrať tag" : "Odobrať z tejto časti"}
                />
              ))}
            </ol>
          </SortableContext>
          <DragOverlay>
            {activePhoto ? (
              <div className="border-primary bg-card overflow-hidden rounded-xl border-2 shadow-2xl">
                <div className="bg-muted relative aspect-[4/3]">
                  <Image
                    src={activePhoto.imagePath}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
                <p className="truncate p-2.5 text-sm font-medium">{activePhoto.title}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <AddPhotosDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={data}
        excludeIds={order}
        title={info.addLabel}
        description={
          list.kind === "tag"
            ? `Vybraté fotky dostanú tag „${info.title}“ a zaradia sa na koniec.`
            : list.placement === "HOME_ABOUT"
              ? "Vyberte jednu fotku. Ak tu už nejaká je, nahradí ju."
              : "Vybraté fotky sa zaradia na koniec - potom ich môžete presunúť."
        }
        singleChoice={info.limit === 1}
        maxSelectable={
          info.limit !== undefined && info.limit > 1 ? info.limit - photos.length : undefined
        }
        onConfirm={(ids, done) =>
          run(() => addToListAction(list, ids), {
            success: ids.length === 1 ? "Fotka pridaná." : `Pridané fotky: ${ids.length}.`,
            onSuccess: done,
          })
        }
        pending={pending}
      />
    </div>
  );
}

type SortablePhotoProps = {
  photo: PhotoItem;
  index: number;
  total: number;
  disabled: boolean;
  readOnly: boolean;
  /** Beyond the section's limit - kept but not shown on the site. */
  dimmed: boolean;
  warning?: string;
  onShowInGallery: () => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
  removeLabel: string;
};

function SortablePhoto({
  photo,
  index,
  total,
  disabled,
  readOnly,
  dimmed,
  warning,
  onShowInGallery,
  onMove,
  onRemove,
  removeLabel,
}: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group border-border bg-card relative overflow-hidden rounded-xl border",
        isDragging && "opacity-30",
        dimmed && "opacity-50",
      )}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`${index + 1}. ${photo.title}${disabled ? "" : " - potiahnite pre zmenu poradia"}`}
        aria-roledescription="presúvateľná fotka"
        className={cn(
          "bg-muted focus-visible:ring-ring relative block aspect-[4/3] touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-inset",
          !disabled && "cursor-grab active:cursor-grabbing",
        )}
      >
        <Image
          src={photo.imagePath}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="pointer-events-none object-cover select-none"
          draggable={false}
        />
        <span className="bg-background/95 text-foreground absolute top-2 left-2 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold tabular-nums shadow">
          {index + 1}
        </span>
        {!disabled ? (
          <span className="absolute top-2 right-2 rounded-md bg-black/55 p-1 text-white opacity-80 group-hover:opacity-100">
            <GripVertical className="size-4" />
          </span>
        ) : null}
        {dimmed ? (
          <span className="absolute inset-x-2 bottom-2 rounded-md bg-black/70 px-2 py-1 text-center text-[11px] text-white">
            Nad limit - na webe sa nezobrazí
          </span>
        ) : null}
      </div>

      <div className="p-2.5">
        <Link
          href={`/admin/fotky/${photo.id}`}
          className="block truncate text-sm font-medium hover:underline"
          title={photo.title}
        >
          {photo.title}
        </Link>
        {warning ? (
          <p className="mt-1 flex items-start gap-1 text-[11px] leading-tight text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-px size-3 shrink-0" />
            <span>
              {warning}.{" "}
              {!readOnly ? (
                <button type="button" onClick={onShowInGallery} className="font-medium underline">
                  Pridať do galérie
                </button>
              ) : null}
            </span>
          </p>
        ) : null}

        {!readOnly ? (
          <div className="mt-2 flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={index === 0}
              onClick={() => onMove(-1)}
              aria-label={`Posunúť „${photo.title}“ dopredu`}
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
              aria-label={`Posunúť „${photo.title}“ dozadu`}
            >
              <ArrowRight />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive ml-auto"
              onClick={onRemove}
              aria-label={`${removeLabel}: ${photo.title}`}
            >
              <X />
              <span className="hidden sm:inline">Odobrať</span>
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
