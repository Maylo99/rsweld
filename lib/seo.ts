import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

/**
 * Canonical origin of the public site (no trailing slash). Overridable via
 * `SITE_URL` so canonicals, sitemap and structured data follow the production
 * domain. Server-only - client components must not depend on it.
 */
export const siteUrl = (process.env.SITE_URL || "https://rsweld.sk").replace(/\/+$/, "");

/** Absolute URL for a site path ("/galeria" → "https://…/galeria"). */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path === "/" ? "" : path}`;
}

const ogImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "RSweld - zváranie nerezu a ocele, zábradlia na mieru",
};

/**
 * Metadata for a public page: title, description, canonical URL, Open Graph
 * and Twitter card. Next replaces (does not merge) a parent's `openGraph`, so
 * every page needs the full object - hence one helper for all of them.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
}: {
  /** Page `<title>`; the root layout template appends " | RSweld". */
  title?: string;
  description: string;
  path: string;
  /** Title for social previews; defaults to "<title> | RSweld". */
  socialTitle?: string;
}): Metadata {
  const shareTitle = socialTitle ?? (title ? `${title} | ${siteConfig.name}` : siteConfig.name);

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "sk_SK",
      siteName: siteConfig.name,
      url: path,
      title: shareTitle,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [ogImage.url],
    },
  };
}
