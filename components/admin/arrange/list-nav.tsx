import Link from "next/link";
import { Home, Images, Tag as TagIcon } from "lucide-react";

import { listHref, listKey } from "@/lib/admin/lists";
import { placementConfig } from "@/lib/placements";
import type { GalleryData, OrderedList } from "@/lib/types";
import { cn } from "@/lib/utils";

type ListNavProps = {
  data: GalleryData;
  active: OrderedList;
};

type NavEntry = { list: OrderedList; label: string; count: number; limit?: number };

export function listGroups(data: GalleryData) {
  const placementEntry = (placement: "GALLERY" | "HOME_FEATURED" | "HOME_ABOUT"): NavEntry => ({
    list: { kind: "placement", placement },
    label: placement === "GALLERY" ? "Všetky fotky" : placementConfig[placement].label,
    count: data.placementOrder[placement].length,
    limit: placementConfig[placement].limit,
  });

  return [
    {
      title: "Úvodná stránka",
      icon: Home,
      entries: [placementEntry("HOME_FEATURED"), placementEntry("HOME_ABOUT")],
    },
    {
      title: "Galéria",
      icon: Images,
      entries: [
        placementEntry("GALLERY"),
        ...data.tags.map((tag): NavEntry => ({
          list: { kind: "tag", tagId: tag.id },
          label: tag.name,
          count: data.tagOrder[tag.id]?.length ?? 0,
        })),
      ],
    },
  ];
}

/** Desktop list of everything that can be arranged. */
export function ListNav({ data, active }: ListNavProps) {
  const activeKey = listKey(active);

  return (
    <nav aria-label="Zoznamy na webe" className="space-y-6">
      {listGroups(data).map((group) => (
        <div key={group.title}>
          <h2 className="text-muted-foreground flex items-center gap-1.5 px-3 text-xs font-semibold tracking-wide uppercase">
            <group.icon className="size-3.5" />
            {group.title}
          </h2>
          <ul className="mt-2 space-y-0.5">
            {group.entries.map((entry) => {
              const key = listKey(entry.list);
              const isActive = key === activeKey;
              const isTag = entry.list.kind === "tag";
              return (
                <li key={key}>
                  <Link
                    href={listHref(entry.list)}
                    scroll={false}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "focus-visible:ring-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2",
                      isTag && "pl-6",
                      isActive
                        ? "bg-primary/10 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {isTag ? <TagIcon className="size-3.5 shrink-0 opacity-60" /> : null}
                    <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                    <span className="text-xs tabular-nums opacity-70">
                      {entry.limit ? `${entry.count}/${entry.limit}` : entry.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
