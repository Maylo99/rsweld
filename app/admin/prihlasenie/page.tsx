import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/shared/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Prihlásenie",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = isAdminConfigured();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Logo className="text-2xl" />
          <h1 className="font-heading mt-4 text-xl font-semibold">Administrácia</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Prihláste sa pre správu galérie realizácií.
          </p>
        </div>

        <Card>
          {configured ? (
            <CardContent className="pt-6">
              <LoginForm next={next} />
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Prihlásenie zatiaľ nie je nastavené</CardTitle>
                <CardDescription>
                  V prostredí chýbajú premenné <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code>{" "}
                  a <code>AUTH_SECRET</code>. Kým nie sú doplnené, do administrácie sa nedá
                  prihlásiť.
                </CardDescription>
              </CardHeader>
            </>
          )}
        </Card>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link href="/" className="hover:text-foreground underline underline-offset-4">
            Späť na web
          </Link>
        </p>
      </div>
    </div>
  );
}
