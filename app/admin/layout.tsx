import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";

import { logoutAction } from "@/app/admin/actions";
import { AdminSidebarNav, AdminTabsNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: {
    default: "Administrácia",
    template: "%s | Administrácia RSweld",
  },
  robots: { index: false, follow: false },
};

/**
 * Admin shell: sidebar on desktop, tabs on mobile. The chrome only renders for
 * a signed-in administrator, so the login page (which lives under the same
 * segment) stays a bare centered card.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    return <main className="bg-muted/40 flex flex-1 flex-col">{children}</main>;
  }

  return (
    <div className="bg-muted/40 flex flex-1">
      {/* Desktop sidebar */}
      <aside className="border-border bg-background sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo />
            <span className="border-border text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <AdminSidebarNav />
        </div>

        <div className="border-border space-y-1 border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start"
            nativeButton={false}
            render={<Link href="/" target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink />
            Otvoriť web
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" className="w-full justify-start">
              <LogOut />
              Odhlásiť sa
            </Button>
          </form>
          <p className="text-muted-foreground truncate px-2.5 pt-1 text-xs" title={session.email}>
            {session.email}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="bg-background/95 border-border sticky top-0 z-40 border-b backdrop-blur lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo />
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                nativeButton={false}
                render={<Link href="/" target="_blank" rel="noopener noreferrer" />}
                aria-label="Otvoriť web"
              >
                <ExternalLink />
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="icon" aria-label="Odhlásiť sa">
                  <LogOut />
                </Button>
              </form>
            </div>
          </div>
          <div className="px-4 pb-2">
            <AdminTabsNav />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
