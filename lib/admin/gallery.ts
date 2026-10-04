import { isDatabaseConfigured } from "@/lib/config";
import { UserFacingError } from "@/lib/errors";
import { slugify } from "@/lib/gallery";
import { fetchGalleryData } from "@/lib/gallery-data";
import { placementConfig } from "@/lib/placements";
import type { GalleryData, OrderedList, PlacementKey } from "@/lib/types";
import type { PhotoInput } from "@/lib/validations";

/**
 * Gallery data access for the admin area. Unlike `lib/queries.ts` (which falls
 * back to seed data so the public site always renders), every call here
 * requires a real database and throws errors whose message the UI can show
 * as-is (Slovak).
 */

export class DatabaseNotConfiguredError extends UserFacingError {
  constructor() {
    super(
      "Databáza nie je pripojená, zmeny sa nedajú uložiť. Doplňte prístupy do .env a spustite migráciu.",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

async function getPrisma() {
  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError();
  }

  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

type Prisma = Awaited<ReturnType<typeof getPrisma>>;
type Tx = Parameters<Parameters<Prisma["$transaction"]>[0]>[0];

export async function loadGallery(): Promise<GalleryData> {
  await getPrisma();
  return fetchGalleryData();
}

/* -------------------------------------------------------------------------- */
/*  Tags                                                                       */
/* -------------------------------------------------------------------------- */

async function uniqueSlug(tx: Tx, name: string, exceptId?: string): Promise<string> {
  const base = slugify(name) || "tag";
  let slug = base;

  for (let suffix = 2; ; suffix++) {
    const clash = await tx.tag.findUnique({ where: { slug } });
    if (!clash || clash.id === exceptId) return slug;
    slug = `${base}-${suffix}`;
  }
}

/** Case-insensitive lookup so "zábradlia" and "Zábradlia" are one tag. */
async function findTagByName(tx: Tx, name: string) {
  return tx.tag.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
}

async function createTagInTx(tx: Tx, name: string): Promise<string> {
  const existing = await findTagByName(tx, name);
  if (existing) return existing.id;

  const last = await tx.tag.findFirst({ orderBy: { sortOrder: "desc" } });
  const tag = await tx.tag.create({
    data: { name, slug: await uniqueSlug(tx, name), sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
  return tag.id;
}

export async function createTag(name: string): Promise<string> {
  const prisma = await getPrisma();
  return prisma.$transaction((tx) => createTagInTx(tx, name));
}

export async function renameTag(id: string, name: string): Promise<void> {
  const prisma = await getPrisma();

  await prisma.$transaction(async (tx) => {
    const clash = await findTagByName(tx, name);
    if (clash && clash.id !== id) {
      throw new UserFacingError(`Tag „${clash.name}“ už existuje.`);
    }
    await tx.tag.update({ where: { id }, data: { name, slug: await uniqueSlug(tx, name, id) } });
  });
}

/** Deletes the tag; photos stay, they just lose this tag. */
export async function deleteTag(id: string): Promise<void> {
  const prisma = await getPrisma();
  await prisma.tag.delete({ where: { id } });
}

export async function reorderTags(ids: string[]): Promise<void> {
  const prisma = await getPrisma();
  const current = await prisma.tag.findMany({ select: { id: true } });
  assertSameMembers(
    current.map((tag) => tag.id),
    ids,
  );

  await prisma.$transaction(
    ids.map((id, index) => prisma.tag.update({ where: { id }, data: { sortOrder: index + 1 } })),
  );
}

/* -------------------------------------------------------------------------- */
/*  List membership (tags + placements)                                        */
/* -------------------------------------------------------------------------- */

/** Appends photos at the end of a tag's order (keeps existing positions). */
async function addPhotosToTag(tx: Tx, tagId: string, photoIds: string[]): Promise<void> {
  const existing = await tx.photoTag.findMany({ where: { tagId } });
  const present = new Set(existing.map((row) => row.photoId));
  let next = Math.max(0, ...existing.map((row) => row.sortOrder));

  const toAdd = photoIds.filter((id) => !present.has(id));
  if (toAdd.length === 0) return;

  await tx.photoTag.createMany({
    data: toAdd.map((photoId) => ({ photoId, tagId, sortOrder: ++next })),
  });
}

/**
 * Appends photos at the end of a website section. A single-photo section
 * (limit 1) swaps its photo; other limited sections refuse to overflow.
 */
async function addPhotosToPlacement(
  tx: Tx,
  placement: PlacementKey,
  photoIds: string[],
): Promise<void> {
  const config = placementConfig[placement];
  const existing = await tx.photoPlacement.findMany({ where: { placement } });
  const present = new Set(existing.map((row) => row.photoId));
  const toAdd = photoIds.filter((id) => !present.has(id));

  if (toAdd.length === 0) return;

  if (config.limit === 1) {
    if (toAdd.length > 1) {
      throw new UserFacingError(`Do časti „${config.label}“ patrí len jedna fotka.`);
    }
    await tx.photoPlacement.deleteMany({ where: { placement } });
    await tx.photoPlacement.create({ data: { photoId: toAdd[0], placement, sortOrder: 1 } });
    return;
  }

  if (config.limit !== undefined && existing.length + toAdd.length > config.limit) {
    throw new UserFacingError(
      `V časti „${config.label}“ môže byť najviac ${config.limit} fotiek (teraz ${existing.length}). ` +
        "Najprv niektorú odoberte v časti Zobrazenie na webe.",
    );
  }

  let next = Math.max(0, ...existing.map((row) => row.sortOrder));
  await tx.photoPlacement.createMany({
    data: toAdd.map((photoId) => ({ photoId, placement, sortOrder: ++next })),
  });
}

export async function addToList(list: OrderedList, photoIds: string[]): Promise<void> {
  const prisma = await getPrisma();
  await prisma.$transaction((tx) =>
    list.kind === "tag"
      ? addPhotosToTag(tx, list.tagId, photoIds)
      : addPhotosToPlacement(tx, list.placement, photoIds),
  );
}

/** Same as `addToList` for a tag that may not exist yet (bulk "new tag"). */
export async function addToNewTag(name: string, photoIds: string[]): Promise<void> {
  const prisma = await getPrisma();
  await prisma.$transaction(async (tx) => {
    const tagId = await createTagInTx(tx, name);
    await addPhotosToTag(tx, tagId, photoIds);
  });
}

export async function removeFromList(list: OrderedList, photoIds: string[]): Promise<void> {
  const prisma = await getPrisma();

  if (list.kind === "tag") {
    await prisma.photoTag.deleteMany({ where: { tagId: list.tagId, photoId: { in: photoIds } } });
  } else {
    await prisma.photoPlacement.deleteMany({
      where: { placement: list.placement, photoId: { in: photoIds } },
    });
  }
}

/**
 * Saves a new order for one list. The submitted ids must be exactly the list's
 * current members — otherwise the admin is looking at stale data.
 */
export async function reorderList(list: OrderedList, ids: string[]): Promise<void> {
  const prisma = await getPrisma();

  if (list.kind === "tag") {
    const rows = await prisma.photoTag.findMany({ where: { tagId: list.tagId } });
    assertSameMembers(
      rows.map((row) => row.photoId),
      ids,
    );
    await prisma.$transaction(
      ids.map((photoId, index) =>
        prisma.photoTag.update({
          where: { photoId_tagId: { photoId, tagId: list.tagId } },
          data: { sortOrder: index + 1 },
        }),
      ),
    );
    return;
  }

  const rows = await prisma.photoPlacement.findMany({ where: { placement: list.placement } });
  assertSameMembers(
    rows.map((row) => row.photoId),
    ids,
  );
  await prisma.$transaction(
    ids.map((photoId, index) =>
      prisma.photoPlacement.update({
        where: { photoId_placement: { photoId, placement: list.placement } },
        data: { sortOrder: index + 1 },
      }),
    ),
  );
}

function assertSameMembers(current: string[], submitted: string[]): void {
  const a = new Set(current);
  const b = new Set(submitted);
  if (a.size !== b.size || submitted.length !== b.size || [...a].some((id) => !b.has(id))) {
    throw new UserFacingError(
      "Zoznam sa medzitým zmenil (napr. v inej karte). Obnovte stránku a skúste to znova.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Photos                                                                     */
/* -------------------------------------------------------------------------- */

/** Brings a photo's tags and sections in line with the form, keeping positions. */
async function syncMemberships(tx: Tx, photoId: string, input: PhotoInput): Promise<void> {
  const tagIds = [...input.tagIds];
  for (const name of input.newTags) {
    tagIds.push(await createTagInTx(tx, name));
  }

  await tx.photoTag.deleteMany({ where: { photoId, tagId: { notIn: tagIds } } });
  for (const tagId of new Set(tagIds)) {
    await addPhotosToTag(tx, tagId, [photoId]);
  }

  await tx.photoPlacement.deleteMany({
    where: { photoId, placement: { notIn: input.placements } },
  });
  for (const placement of input.placements) {
    await addPhotosToPlacement(tx, placement, [photoId]);
  }
}

function photoFields(input: PhotoInput) {
  return {
    title: input.title,
    description: input.description || null,
    imageAlt: input.imageAlt || input.title,
  };
}

export async function createPhoto(input: PhotoInput, imagePath: string): Promise<string> {
  const prisma = await getPrisma();

  return prisma.$transaction(async (tx) => {
    const photo = await tx.photo.create({ data: { ...photoFields(input), imagePath } });
    await syncMemberships(tx, photo.id, input);
    return photo.id;
  });
}

/**
 * Updates text fields, tags and sections. `imagePath` is only touched when a
 * new photo was uploaded; returns the replaced image so the caller can clean
 * up storage.
 */
export async function updatePhoto(
  id: string,
  input: PhotoInput,
  imagePath?: string,
): Promise<{ replacedImagePath: string | null }> {
  const prisma = await getPrisma();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.photo.findUnique({ where: { id } });

    if (!existing) {
      throw new UserFacingError("Fotka sa nenašla — možno ju medzitým niekto zmazal.");
    }

    await tx.photo.update({
      where: { id },
      data: { ...photoFields(input), ...(imagePath ? { imagePath } : {}) },
    });
    await syncMemberships(tx, id, input);

    return { replacedImagePath: imagePath ? existing.imagePath : null };
  });
}

/** Deletes photos (tags and placements cascade); returns their images for cleanup. */
export async function deletePhotos(ids: string[]): Promise<string[]> {
  const prisma = await getPrisma();

  return prisma.$transaction(async (tx) => {
    const photos = await tx.photo.findMany({ where: { id: { in: ids } } });
    await tx.photo.deleteMany({ where: { id: { in: ids } } });
    return photos.map((photo) => photo.imagePath);
  });
}
