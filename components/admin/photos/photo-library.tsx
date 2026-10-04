"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  EyeOff,
  ImageOff,
  LayoutTemplate,
  Search,
  Tag as TagIcon,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  addToListAction,
  addToNewTagAction,
  deletePhotosAction,
  removeFromListAction,
} from "@/app/admin/actions";
import { useMutation } from "@/components/admin/use-mutation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { placementConfig } from "@/lib/placements";
import { PLACEMENTS, type GalleryData, type PlacementKey } from "@/lib/types";
import { cn } from "@/lib/utils";

type PhotoLibraryProps = {
  data: GalleryData;
  readOnly: boolean;
};

const NO_TAG = "__none";
const NOWHERE = "__nowhere";

/** Slovak plural of "fotka" (1 / 2–4 / 5+). */
export function pluralizePhotos(count: number): string {
  if (count === 1) return "fotka";
  if (count >= 2 && count <= 4) return "fotky";
  return "fotiek";
}

export function PhotoLibrary({ data, readOnly }: PhotoLibraryProps) {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [placementFilter, setPlacementFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const { pending, run } = useMutation();

  const tagsById = useMemo(() => new Map(data.tags.map((tag) => [tag.id, tag])), [data.tags]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.photos.filter((photo) => {
      if (needle && !`${photo.title} ${photo.description ?? ""}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (tagFilter === NO_TAG && photo.tagIds.length > 0) return false;
      if (tagFilter && tagFilter !== NO_TAG && !photo.tagIds.includes(tagFilter)) return false;
      if (placementFilter === NOWHERE && photo.placements.length > 0) return false;
      if (
        placementFilter &&
        placementFilter !== NOWHERE &&
        !photo.placements.includes(placementFilter as PlacementKey)
      ) {
        return false;
      }
      return true;
    });
  }, [data.photos, placementFilter, query, tagFilter]);

  // Selection survives filtering, but only counts photos that still exist.
  const selectedIds = selected.filter((id) => data.photos.some((photo) => photo.id === id));
  const allVisibleSelected =
    visible.length > 0 && visible.every((photo) => selectedIds.includes(photo.id));

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const clearSelection = () => setSelected([]);
  const count = selectedIds.length;
  const countLabel = `${count} ${pluralizePhotos(count)}`;

  const untaggedCount = data.photos.filter((photo) => photo.tagIds.length === 0).length;
  const hiddenCount = data.photos.filter((photo) => photo.placements.length === 0).length;
  const filtersActive = Boolean(query || tagFilter || placementFilter);

  if (data.photos.length === 0) {
    return (
      <div className="border-border bg-card mt-8 rounded-2xl border border-dashed p-12 text-center">
        <ImageOff className="text-muted-foreground mx-auto size-10" />
        <h2 className="font-heading mt-4 text-lg font-semibold">Zatiaľ tu nie sú žiadne fotky</h2>
        <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
          Nahrajte prvé fotky — môžete ich vybrať naraz viac a otagovať ich už pri nahrávaní.
        </p>
        {readOnly ? null : (
          <Button
            className="mt-5"
            size="lg"
            nativeButton={false}
            render={<Link href="/admin/nahrat" />}
          >
            <Upload />
            Nahrať fotky
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("mt-6", count > 0 && "pb-28")}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hľadať podľa názvu…"
              className="bg-background pl-8"
              aria-label="Hľadať fotky"
            />
          </div>

          <select
            value={placementFilter ?? ""}
            onChange={(event) => setPlacementFilter(event.target.value || null)}
            aria-label="Filtrovať podľa umiestnenia na webe"
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
          >
            <option value="">Zobrazené kdekoľvek</option>
            {PLACEMENTS.map((placement) => (
              <option key={placement} value={placement}>
                {placementConfig[placement].shortLabel}
              </option>
            ))}
            <option value={NOWHERE}>Nezobrazené nikde ({hiddenCount})</option>
          </select>

          {filtersActive ? (
            <Button
              variant="ghost"
              onClick={() => {
                setQuery("");
                setTagFilter(null);
                setPlacementFilter(null);
              }}
            >
              <X />
              Zrušiť filtre
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrovať podľa tagu">
          <FilterChip active={tagFilter === null} onClick={() => setTagFilter(null)}>
            Všetky tagy
          </FilterChip>
          {data.tags.map((tag) => (
            <FilterChip
              key={tag.id}
              active={tagFilter === tag.id}
              onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}
            >
              {tag.name}
              <span className="opacity-70">{data.tagOrder[tag.id]?.length ?? 0}</span>
            </FilterChip>
          ))}
          {untaggedCount > 0 ? (
            <FilterChip
              active={tagFilter === NO_TAG}
              onClick={() => setTagFilter(tagFilter === NO_TAG ? null : NO_TAG)}
            >
              Bez tagu
              <span className="opacity-70">{untaggedCount}</span>
            </FilterChip>
          ) : null}
        </div>
      </div>

      <div className="text-muted-foreground mt-5 flex items-center justify-between gap-3 text-sm">
        <span>
          {filtersActive
            ? `Zobrazené ${visible.length} z ${data.photos.length}`
            : `${data.photos.length} ${pluralizePhotos(data.photos.length)} · najnovšie prvé`}
        </span>
        {!readOnly && visible.length > 0 ? (
          <button
            type="button"
            className="hover:text-foreground underline-offset-4 hover:underline"
            onClick={() =>
              setSelected((current) =>
                allVisibleSelected
                  ? current.filter((id) => !visible.some((photo) => photo.id === id))
                  : [...new Set([...current, ...visible.map((photo) => photo.id)])],
              )
            }
          >
            {allVisibleSelected ? "Zrušiť výber" : "Vybrať všetky zobrazené"}
          </button>
        ) : null}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="border-border text-muted-foreground mt-4 rounded-xl border border-dashed p-10 text-center text-sm">
          Žiadna fotka nezodpovedá filtrom.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((photo, index) => {
            const isSelected = selectedIds.includes(photo.id);
            return (
              <li
                key={photo.id}
                className={cn(
                  "group bg-card relative overflow-hidden rounded-xl border transition-shadow hover:shadow-md",
                  isSelected ? "border-primary ring-primary ring-2" : "border-border",
                )}
              >
                <Link
                  href={`/admin/fotky/${photo.id}`}
                  onClick={(event) => {
                    // While selecting, a click adds/removes the photo instead of opening it.
                    if (count > 0) {
                      event.preventDefault();
                      toggle(photo.id);
                    }
                  }}
                  className="focus-visible:ring-ring block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-inset"
                >
                  <div className="bg-muted relative aspect-[4/3]">
                    <Image
                      src={photo.imagePath}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover"
                      priority={index < 4}
                    />
                    <div className="absolute right-2 bottom-2 left-2 flex flex-wrap justify-end gap-1">
                      {photo.placements.length === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
                          <EyeOff className="size-3" />
                          Nezobrazená
                        </span>
                      ) : (
                        photo.placements.map((placement) => (
                          <span
                            key={placement}
                            className="rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white"
                          >
                            {placementConfig[placement].badge}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h2 className="truncate text-sm font-medium">{photo.title}</h2>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {photo.tagIds.length > 0
                        ? photo.tagIds.map((id) => tagsById.get(id)?.name).join(" · ")
                        : "Bez tagu"}
                    </p>
                  </div>
                </Link>

                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => toggle(photo.id)}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Zrušiť výber" : "Vybrať"}: ${photo.title}`}
                    className={cn(
                      "focus-visible:ring-ring absolute top-2 left-2 flex size-7 items-center justify-center rounded-md border-2 shadow-sm transition-all outline-none focus-visible:ring-2",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-white/90 bg-black/30 text-transparent opacity-100 hover:bg-black/50 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100",
                      count > 0 && "sm:opacity-100",
                    )}
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {/* Bulk action bar */}
      {count > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4 lg:left-64">
          <div
            role="toolbar"
            aria-label="Hromadné úpravy vybraných fotiek"
            className="border-border bg-background mx-auto flex max-w-4xl flex-wrap items-center gap-2 rounded-2xl border p-2.5 shadow-xl"
          >
            <span className="px-2 text-sm font-medium">Vybraté: {countLabel}</span>

            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger disabled={pending} render={<Button variant="outline" />}>
                  <TagIcon />
                  Tagy
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Pridať tag</DropdownMenuLabel>
                    {data.tags.map((tag) => (
                      <DropdownMenuItem
                        key={tag.id}
                        onClick={() =>
                          run(() => addToListAction({ kind: "tag", tagId: tag.id }, selectedIds), {
                            success: `Tag „${tag.name}“ pridaný (${countLabel}).`,
                          })
                        }
                      >
                        {tag.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <div className="flex gap-1 p-1">
                    <Input
                      value={newTagName}
                      onChange={(event) => setNewTagName(event.target.value)}
                      onKeyDown={(event) => event.stopPropagation()}
                      placeholder="Nový tag…"
                      aria-label="Nový tag pre vybraté fotky"
                      className="h-7"
                    />
                    <Button
                      size="sm"
                      disabled={newTagName.trim().length < 2}
                      onClick={() =>
                        run(() => addToNewTagAction(newTagName, selectedIds), {
                          success: `Tag „${newTagName.trim()}“ pridaný (${countLabel}).`,
                          onSuccess: () => setNewTagName(""),
                        })
                      }
                    >
                      Pridať
                    </Button>
                  </div>
                  {data.tags.length > 0 ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Odobrať tag</DropdownMenuLabel>
                        {data.tags
                          .filter((tag) =>
                            selectedIds.some((id) => data.tagOrder[tag.id]?.includes(id)),
                          )
                          .map((tag) => (
                            <DropdownMenuItem
                              key={tag.id}
                              onClick={() =>
                                run(
                                  () =>
                                    removeFromListAction(
                                      { kind: "tag", tagId: tag.id },
                                      selectedIds,
                                    ),
                                  { success: `Tag „${tag.name}“ odobratý.` },
                                )
                              }
                            >
                              <X />
                              {tag.name}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuGroup>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger disabled={pending} render={<Button variant="outline" />}>
                  <LayoutTemplate />
                  Na webe
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Zobraziť v</DropdownMenuLabel>
                    {PLACEMENTS.filter(
                      (placement) => placementConfig[placement].limit !== 1 || count === 1,
                    ).map((placement) => (
                      <DropdownMenuItem
                        key={placement}
                        onClick={() =>
                          run(
                            () => addToListAction({ kind: "placement", placement }, selectedIds),
                            { success: `Pridané do „${placementConfig[placement].shortLabel}“.` },
                          )
                        }
                      >
                        {placementConfig[placement].shortLabel}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Skryť z</DropdownMenuLabel>
                    {PLACEMENTS.map((placement) => (
                      <DropdownMenuItem
                        key={placement}
                        onClick={() =>
                          run(
                            () =>
                              removeFromListAction({ kind: "placement", placement }, selectedIds),
                            { success: `Odobraté z „${placementConfig[placement].shortLabel}“.` },
                          )
                        }
                      >
                        <EyeOff />
                        {placementConfig[placement].shortLabel}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="destructive"
                disabled={pending}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 />
                Zmazať
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSelection}
                aria-label="Zrušiť výber"
              >
                <X />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zmazať {countLabel}?</DialogTitle>
            <DialogDescription>
              Fotky sa odstránia z webu aj z úložiska, vrátane všetkých tagov a umiestnení. Túto
              akciu sa nedá vrátiť späť.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Zrušiť</DialogClose>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                run(() => deletePhotosAction(selectedIds), {
                  success: `Zmazané: ${countLabel}.`,
                  onSuccess: () => {
                    setConfirmDelete(false);
                    clearSelection();
                  },
                })
              }
            >
              <Trash2 />
              Zmazať natrvalo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "focus-visible:ring-ring inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
