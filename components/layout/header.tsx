"use client";

import { MenuIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="RSweld — domov">
          <Logo />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Hlavná navigácia">
          {mainNav.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "hover:text-foreground text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Button size="sm" render={<Link href="/cenova-ponuka" />}>
            Nezáväzný dopyt
          </Button>
        </nav>

        {/* Mobile navigation */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Zavolať ${siteConfig.phone}`}
            render={<a href={siteConfig.phoneHref} />}
          >
            <PhoneIcon className="size-4" />
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Otvoriť menu">
                  <MenuIcon className="size-5" />
                </Button>
              }
            />
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobilná navigácia">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-foreground hover:bg-accent rounded-md px-2 py-2.5 text-base font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t px-6 py-4">
                <Button className="w-full" render={<Link href="/cenova-ponuka" />}>
                  Nezáväzný dopyt
                </Button>
                <a
                  href={siteConfig.phoneHref}
                  className="text-muted-foreground hover:text-foreground mt-3 block text-center text-sm"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
