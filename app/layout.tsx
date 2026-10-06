import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// Headings only - body text uses the system font stack (see globals.css),
// which keeps LCP fast on text-heavy pages.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - zváranie nerezu a ocele, zábradlia na mieru | Považská Bystrica`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "sk_SK",
    siteName: siteConfig.name,
    title: `${siteConfig.name} - zváranie nerezu a ocele, zábradlia na mieru`,
    description: siteConfig.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: siteConfig.name }],
  },
};

/**
 * Root layout - document shell only. Public pages get their chrome (header,
 * footer, structured data) from `app/(site)/layout.tsx`; the admin area under
 * `/admin` deliberately renders without it.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
