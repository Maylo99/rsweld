"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { listHref } from "@/lib/admin/lists";
import { placementConfig } from "@/lib/placements";
import { PLACEMENTS, type PlacementKey } from "@/lib/types";
import { cn } from "@/lib/utils";

type PlacementPickerProps = {
  value: PlacementKey[];
  onChange: (value: PlacementKey[]) => void;
  /** How many *other* photos each section already holds. */
  occupied: Record<PlacementKey, number>;
  /** How many photos this choice applies to (bulk upload). */
  photoCount?: number;
  withHiddenInputs?: boolean;
  disabled?: boolean;
};

/**
 * "Where on the website" checkboxes with each section's capacity, so the
 * administrator sees up front when a section is full.
 */
export function PlacementPicker({
  value,
  onChange,
  occupied,
  photoCount = 1,
  withHiddenInputs,
  disabled,
}: PlacementPickerProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {withHiddenInputs
        ? value.map((placement) => (
            <input key={placement} type="hidden" name="placements" value={placement} />
          ))
        : null}

      {PLACEMENTS.map((placement) => {
        const config = placementConfig[placement];
        const checked = value.includes(placement);
        const taken = occupied[placement];
        const swaps = config.limit === 1 && taken > 0;
        const free = config.limit === undefined ? Infinity : config.limit - taken;
        const tooMany = config.limit === 1 ? photoCount > 1 : photoCount > free;
        const blocked = !checked && !swaps && tooMany;

        let status: string;
        if (config.limit === undefined) {
          status = `${taken + (checked ? photoCount : 0)} fotiek`;
        } else if (config.limit === 1) {
          status =
            photoCount > 1 ? "Len pre jednu fotku" : swaps ? "Nahradí súčasnú fotku" : "Voľné";
        } else {
          status = `${taken + (checked ? photoCount : 0)} / ${config.limit} obsadené`;
        }

        return (
          <label
            key={placement}
            className={cn(
              "border-border bg-background flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
              checked && "border-primary/50 bg-primary/5",
              (disabled || (blocked && !checked) || (config.limit === 1 && photoCount > 1)) &&
                "cursor-not-allowed opacity-60",
            )}
          >
            <Checkbox
              className="mt-0.5"
              checked={checked}
              disabled={disabled || blocked || (config.limit === 1 && photoCount > 1)}
              onCheckedChange={(next) =>
                onChange(next ? [...value, placement] : value.filter((item) => item !== placement))
              }
            />
            <span className="min-w-0">
              <span className="text-muted-foreground block text-xs">{config.page}</span>
              <span className="block text-sm font-medium">{config.label}</span>
              <span
                className={cn(
                  "mt-1 block text-xs",
                  blocked ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {blocked ? "Plné - najprv odoberte inú fotku." : status}
              </span>
              {blocked ? (
                <Link
                  href={listHref({ kind: "placement", placement })}
                  className="text-primary-soft mt-0.5 inline-block text-xs font-medium underline-offset-4 hover:underline"
                >
                  Spravovať túto časť
                </Link>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
