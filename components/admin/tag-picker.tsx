"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TagItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type TagPickerProps = {
  tags: TagItem[];
  selectedIds: string[];
  /** Tags typed by the administrator that do not exist yet (created on save). */
  newTags: string[];
  onChange: (selectedIds: string[], newTags: string[]) => void;
  /** Renders hidden `tagIds` / `newTags` inputs for use inside a `<form>`. */
  withHiddenInputs?: boolean;
  disabled?: boolean;
  id?: string;
};

/**
 * Toggle chips for existing tags plus an inline "new tag" input. Typing the
 * name of an existing tag (any letter case) selects it instead of duplicating.
 */
export function TagPicker({
  tags,
  selectedIds,
  newTags,
  onChange,
  withHiddenInputs,
  disabled,
  id,
}: TagPickerProps) {
  const [draft, setDraft] = useState("");

  const toggle = (tagId: string) => {
    onChange(
      selectedIds.includes(tagId)
        ? selectedIds.filter((idValue) => idValue !== tagId)
        : [...selectedIds, tagId],
      newTags,
    );
  };

  const addDraft = () => {
    const name = draft.trim().replace(/\s+/g, " ");
    if (name.length < 2) return;

    const existing = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selectedIds.includes(existing.id)) onChange([...selectedIds, existing.id], newTags);
    } else if (!newTags.some((tag) => tag.toLowerCase() === name.toLowerCase())) {
      onChange(selectedIds, [...newTags, name.slice(0, 40)]);
    }
    setDraft("");
  };

  return (
    <div className="space-y-3">
      {withHiddenInputs ? (
        <>
          {selectedIds.map((tagId) => (
            <input key={tagId} type="hidden" name="tagIds" value={tagId} />
          ))}
          {newTags.map((name) => (
            <input key={name} type="hidden" name="newTags" value={name} />
          ))}
        </>
      ) : null}

      {tags.length > 0 || newTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tagy">
          {tags.map((tag) => {
            const selected = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(tag.id)}
                aria-pressed={selected}
                className={cn(
                  "focus-visible:ring-ring inline-flex h-8 items-center gap-1 rounded-full border px-3 text-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-50",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {selected ? <Check className="size-3.5" /> : null}
                {tag.name}
              </button>
            );
          })}
          {newTags.map((name) => (
            <span
              key={name}
              className="border-primary bg-primary text-primary-foreground inline-flex h-8 items-center gap-1 rounded-full border pr-1 pl-3 text-sm"
            >
              {name}
              <span className="bg-primary-foreground/20 rounded px-1 text-[10px] font-semibold uppercase">
                nový
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(
                    selectedIds,
                    newTags.filter((tag) => tag !== name),
                  )
                }
                className="hover:bg-primary-foreground/20 focus-visible:ring-primary-foreground rounded-full p-0.5 outline-none focus-visible:ring-2"
                aria-label={`Odobrať nový tag ${name}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex max-w-sm gap-2">
        <Input
          id={id}
          value={draft}
          disabled={disabled}
          maxLength={40}
          placeholder="Nový tag, napr. Balkóny"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addDraft();
            }
          }}
          aria-label="Názov nového tagu"
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || draft.trim().length < 2}
          onClick={addDraft}
        >
          <Plus />
          Pridať
        </Button>
      </div>
    </div>
  );
}
