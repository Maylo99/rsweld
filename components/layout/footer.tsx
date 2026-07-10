import Link from "next/link";

import { mainNav, siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-base font-bold">{siteConfig.name}</p>
          <p className="text-muted-foreground max-w-xs text-sm">{siteConfig.description}</p>
          <p className="text-muted-foreground text-sm">{siteConfig.location}</p>
        </div>

        <nav className="flex flex-col gap-2">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t">
        <p className="text-muted-foreground mx-auto max-w-6xl px-4 py-4 text-xs">
          © {year} {siteConfig.name}. Všetky práva vyhradené.
        </p>
      </div>
    </footer>
  );
}
