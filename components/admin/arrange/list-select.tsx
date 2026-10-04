"use client";

import { useRouter } from "next/navigation";

import { listGroups } from "@/components/admin/arrange/list-nav";
import { listHref, listKey } from "@/lib/admin/lists";
import type { GalleryData, OrderedList } from "@/lib/types";

/** Mobile replacement for `ListNav`. */
export function ListSelect({ data, active }: { data: GalleryData; active: OrderedList }) {
  const router = useRouter();
  const groups = listGroups(data);

  return (
    <label className="block">
      <span className="text-muted-foreground text-xs font-medium">Zoznam</span>
      <select
        value={listKey(active)}
        onChange={(event) => {
          const entry = groups
            .flatMap((group) => group.entries)
            .find((item) => listKey(item.list) === event.target.value);
          if (entry) router.push(listHref(entry.list), { scroll: false });
        }}
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
      >
        {groups.map((group) => (
          <optgroup key={group.title} label={group.title}>
            {group.entries.map((entry) => (
              <option key={listKey(entry.list)} value={listKey(entry.list)}>
                {entry.list.kind === "tag" ? `Tag: ${entry.label}` : entry.label} (
                {entry.limit ? `${entry.count}/${entry.limit}` : entry.count})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
