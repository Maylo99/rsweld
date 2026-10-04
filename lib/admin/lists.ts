import { PLACEMENTS, type OrderedList, type PlacementKey } from "@/lib/types";

/**
 * Ordered lists are addressed in the URL as `?zoznam=` — a placement key in
 * kebab case (`home-featured`) or `tag-<id>`.
 */
export function listKey(list: OrderedList): string {
  return list.kind === "tag"
    ? `tag-${list.tagId}`
    : list.placement.toLowerCase().replace(/_/g, "-");
}

export function parseListKey(key: string | undefined): OrderedList | null {
  if (!key) return null;
  if (key.startsWith("tag-")) return { kind: "tag", tagId: key.slice(4) };

  const placement = key.toUpperCase().replace(/-/g, "_");
  return (PLACEMENTS as readonly string[]).includes(placement)
    ? { kind: "placement", placement: placement as PlacementKey }
    : null;
}

export function listHref(list: OrderedList): string {
  return `/admin/zobrazenie?zoznam=${listKey(list)}`;
}
