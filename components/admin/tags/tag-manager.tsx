"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  ListOrdered,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createTagAction,
  deleteTagAction,
  renameTagAction,
  reorderTagsAction,
} from "@/app/admin/actions";
import { pluralizePhotos } from "@/components/admin/photos/photo-library";
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
import { Input } from "@/components/ui/input";
import type { GalleryData, TagItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type TagManagerProps = {
  data: GalleryData;
  readOnly: boolean;
};

export function TagManager({ data, readOnly }: TagManagerProps) {
  const { pending, run } = useMutation();
  const [newName, setNewName] = useState("");
  // Stable id keeps dnd-kit's aria-describedby identical on server and client.
  const dndId = useId();
  const [toDelete, setToDelete] = useState<TagItem | null>(null);

  // Optimistic order, re-synced when the server sends new data.
  const serverOrder = data.tags.map((tag) => tag.id);
  const serverKey = serverOrder.join(",");
  const [order, setOrder] = useState(serverOrder);
  const [syncedKey, setSyncedKey] = useState(serverKey);
  if (syncedKey !== serverKey) {
    setSyncedKey(serverKey);
    setOrder(serverOrder);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const saveOrder = (next: string[]) => {
    const previous = order;
    setOrder(next);
    run(() => reorderTagsAction(next), {
      success: "Poradie tagov uložené.",
      onError: () => setOrder(previous),
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    saveOrder(arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id))));
  };

  const create = () => {
    const name = newName.trim();
    if (name.length < 2) return;
    run(() => createTagAction(name), {
      success: `Tag „${name}“ vytvorený.`,
      onSuccess: () => setNewName(""),
    });
  };

  const tagsById = new Map(data.tags.map((tag) => [tag.id, tag]));
  const tags = order.map((id) => tagsById.get(id)).filter((tag) => tag !== undefined);

  return (
    <div className="mt-6 max-w-3xl space-y-6">
      <form
        className="border-border bg-card flex flex-wrap items-end gap-2 rounded-2xl border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          create();
        }}
      >
        <label className="min-w-56 flex-1">
          <span className="text-sm font-medium">Nový tag</span>
          <Input
            className="mt-1.5"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            maxLength={40}
            placeholder="Napr. Balkóny"
            disabled={readOnly}
          />
        </label>
        <Button type="submit" disabled={readOnly || pending || newName.trim().length < 2}>
          <Plus />
          Vytvoriť tag
        </Button>
      </form>

      {tags.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
          Zatiaľ nemáte žiadne tagy. Vytvorte prvý - napr. „Zábradlia“ alebo „Priemysel“.
        </p>
      ) : (
        <div>
          <p className="text-muted-foreground mb-2 text-sm">
            Poradie tagov = poradie filtrov v galérii na webe. Zmeníte ho potiahnutím.
          </p>
          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border">
                {tags.map((tag, index) => (
                  <SortableTagRow
                    key={tag.id}
                    tag={tag}
                    index={index}
                    total={tags.length}
                    photoCount={data.tagOrder[tag.id]?.length ?? 0}
                    readOnly={readOnly}
                    pending={pending}
                    onMove={(delta) => saveOrder(arrayMove(order, index, index + delta))}
                    onRename={(name) =>
                      run(() => renameTagAction(tag.id, name), { success: "Tag premenovaný." })
                    }
                    onDelete={() => setToDelete(tag)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zmazať tag „{toDelete?.name}“?</DialogTitle>
            <DialogDescription>
              {(() => {
                const count = toDelete ? (data.tagOrder[toDelete.id]?.length ?? 0) : 0;
                return count > 0
                  ? `Tag zmizne z ${count} ${count === 1 ? "fotky" : "fotiek"} a z filtra v galérii. Samotné fotky zostanú.`
                  : "Tag nemá žiadne fotky. Zmizne z filtra v galérii.";
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Zrušiť</DialogClose>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => {
                if (!toDelete) return;
                const tag = toDelete;
                run(() => deleteTagAction(tag.id), {
                  success: `Tag „${tag.name}“ zmazaný.`,
                  onSuccess: () => setToDelete(null),
                });
              }}
            >
              <Trash2 />
              Zmazať tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type SortableTagRowProps = {
  tag: TagItem;
  index: number;
  total: number;
  photoCount: number;
  readOnly: boolean;
  pending: boolean;
  onMove: (delta: number) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
};

function SortableTagRow({
  tag,
  index,
  total,
  photoCount,
  readOnly,
  pending,
  onMove,
  onRename,
  onDelete,
}: SortableTagRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tag.name);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id, disabled: readOnly || editing });

  const submit = () => {
    const name = draft.trim();
    if (name.length >= 2 && name !== tag.name) onRename(name);
    setEditing(false);
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-card flex items-center gap-2 px-3 py-2.5 sm:gap-3",
        isDragging && "relative z-10 shadow-lg",
      )}
    >
      {!readOnly ? (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring cursor-grab touch-manipulation rounded p-1 outline-none focus-visible:ring-2 active:cursor-grabbing"
          aria-label={`Presunúť tag ${tag.name}`}
        >
          <GripVertical className="size-4" />
        </button>
      ) : null}

      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            className="flex gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <Input
              autoFocus
              value={draft}
              maxLength={40}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setDraft(tag.name);
                  setEditing(false);
                }
              }}
              aria-label="Nový názov tagu"
            />
            <Button type="submit" size="icon" aria-label="Uložiť názov">
              <Check />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setDraft(tag.name);
                setEditing(false);
              }}
              aria-label="Zrušiť premenovanie"
            >
              <X />
            </Button>
          </form>
        ) : (
          <>
            <p className="truncate text-sm font-medium">{tag.name}</p>
            <p className="text-muted-foreground text-xs">
              {photoCount} {pluralizePhotos(photoCount)} · /galeria?tag={tag.slug}
            </p>
          </>
        )}
      </div>

      {!editing ? (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={`/admin/zobrazenie?zoznam=tag-${tag.id}`} />}
          >
            <ListOrdered />
            <span className="hidden sm:inline">Poradie fotiek</span>
          </Button>
          {!readOnly ? (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hidden sm:inline-flex"
                disabled={index === 0 || pending}
                onClick={() => onMove(-1)}
                aria-label={`Posunúť tag ${tag.name} vyššie`}
              >
                <ArrowUp />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hidden sm:inline-flex"
                disabled={index === total - 1 || pending}
                onClick={() => onMove(1)}
                aria-label={`Posunúť tag ${tag.name} nižšie`}
              >
                <ArrowDown />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setDraft(tag.name);
                  setEditing(true);
                }}
                aria-label={`Premenovať tag ${tag.name}`}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:text-destructive"
                onClick={onDelete}
                aria-label={`Zmazať tag ${tag.name}`}
              >
                <Trash2 />
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
