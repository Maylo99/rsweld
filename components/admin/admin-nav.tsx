"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, LayoutTemplate, Tags, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

export const adminNavItems = [
  {
    href: "/admin",
    label: "Fotky",
    short: "Fotky",
    hint: "Všetky fotky, úpravy",
    icon: Images,
    match: (path: string) => path === "/admin" || path.startsWith("/admin/fotky"),
  },
  {
    href: "/admin/nahrat",
    label: "Nahrať fotky",
    short: "Nahrať",
    hint: "Pridať nové fotky",
    icon: Upload,
    match: (path: string) => path.startsWith("/admin/nahrat"),
  },
  {
    href: "/admin/zobrazenie",
    label: "Zobrazenie na webe",
    short: "Na webe",
    hint: "Výber a poradie fotiek na webe",
    icon: LayoutTemplate,
    match: (path: string) => path.startsWith("/admin/zobrazenie"),
  },
  {
    href: "/admin/tagy",
    label: "Tagy",
    short: "Tagy",
    hint: "Témy pre filter v galérii",
    icon: Tags,
    match: (path: string) => path.startsWith("/admin/tagy"),
  },
] as const;

/** Sidebar navigation (desktop). */
export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administrácia" className="flex flex-col gap-1">
      {adminNavItems.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group focus-visible:ring-ring flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors outline-none focus-visible:ring-2",
              active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <item.icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                active ? "text-primary-soft" : "group-hover:text-foreground",
              )}
            />
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-sm font-medium",
                  active ? "text-foreground" : "group-hover:text-foreground",
                )}
              >
                {item.label}
              </span>
              <span className="text-muted-foreground block text-xs">{item.hint}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Horizontal tabs (mobile). */
export function AdminTabsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administrácia" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1">
        {adminNavItems.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-4", active && "text-primary-soft")} />
                {item.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
