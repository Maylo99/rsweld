import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { siteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// Headings only - body text uses the system font stack (see globals.css),
// which keeps LCP fast on text-heavy pages.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} - zváranie nerezu a ocele, zábradlia na mieru | Považská Bystrica`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.owner }],
  formatDetection: { telephone: false, email: false, address: false },
  // Google Search Console HTML-tag verification (optional).
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
