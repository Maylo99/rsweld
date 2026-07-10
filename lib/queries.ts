import { referencesSeed } from "@/lib/data/references";
import { testimonialsSeed } from "@/lib/data/testimonials";
import type { ReferenceItem, TestimonialItem } from "@/lib/types";

/**
 * Content queries with graceful degradation: read from the database when
 * configured, otherwise fall back to the static seed data. This keeps the
 * site fully functional before Supabase credentials are provisioned and
 * during local development without a DB.
 */

const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);

export async function getReferences(): Promise<ReferenceItem[]> {
  if (!isDatabaseConfigured()) {
    return referencesSeed;
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.reference.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      category: row.category,
      imagePath: row.imagePath,
      imageAlt: row.imageAlt,
      featured: row.featured,
      sortOrder: row.sortOrder,
    }));
  } catch (error) {
    console.error("getReferences: database read failed, using seed data", error);
    return referencesSeed;
  }
}

export async function getFeaturedReferences(): Promise<ReferenceItem[]> {
  const references = await getReferences();
  return references.filter((reference) => reference.featured).slice(0, 6);
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
  if (!isDatabaseConfigured()) {
    return testimonialsSeed;
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((row) => ({
      id: row.id,
      author: row.author,
      company: row.company ?? undefined,
      quote: row.quote,
      sortOrder: row.sortOrder,
    }));
  } catch (error) {
    console.error("getTestimonials: database read failed, using seed data", error);
    return testimonialsSeed;
  }
}
