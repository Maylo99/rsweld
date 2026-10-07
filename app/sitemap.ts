import type { MetadataRoute } from "next";

import { getGallery } from "@/lib/queries";
import { absoluteUrl } from "@/lib/seo";

// Gallery images change through the admin - refresh with the gallery page.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { photos } = await getGallery();
  const routes = ["/", "/sluzby", "/o-nas", "/galeria", "/caste-otazky", "/kontakt"];

  return routes.map((route) => ({
    url: absoluteUrl(route),
    changeFrequency: route === "/galeria" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
    // Image sitemap entries help the gallery photos show up in image search.
    ...(route === "/galeria"
      ? { images: photos.map((photo) => absoluteUrl(photo.imagePath)) }
      : {}),
  }));
}
