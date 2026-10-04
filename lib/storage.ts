import { isStorageConfigured } from "@/lib/config";
import { UserFacingError } from "@/lib/errors";
import { createSupabaseAdminClient, REFERENCES_BUCKET } from "@/lib/supabase";

/**
 * Gallery image storage (Supabase Storage, public `references` bucket).
 * Server-only: every call goes through the service-role client.
 */

/** Builds a collision-free object name from the original file name. */
function buildObjectPath(fileName: string): string {
  const extension = fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? ".jpg";
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);

  return `${base || "photo"}-${crypto.randomUUID().slice(0, 8)}${extension}`;
}

/**
 * Local development without Supabase: photos go to `public/uploads/` (git
 * ignored) so the whole admin flow can be tried out. Never used in production —
 * a serverless filesystem is read-only and ephemeral.
 */
const LOCAL_UPLOAD_DIR = "uploads/gallery";

function canUseLocalUploads(): boolean {
  return process.env.NODE_ENV === "development";
}

async function saveLocally(file: File, objectPath: string): Promise<string> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const directory = path.join(process.cwd(), "public", LOCAL_UPLOAD_DIR);

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, objectPath), Buffer.from(await file.arrayBuffer()));
  return `/${LOCAL_UPLOAD_DIR}/${objectPath}`;
}

/**
 * Uploads a gallery image and returns its public URL (stored as
 * `Photo.imagePath`). Throws with a Slovak message the admin UI can show.
 */
export async function uploadGalleryImage(file: File): Promise<string> {
  if (!isStorageConfigured() && canUseLocalUploads()) {
    return saveLocally(file, buildObjectPath(file.name));
  }

  if (!isStorageConfigured()) {
    throw new UserFacingError(
      "Úložisko obrázkov nie je nastavené (chýbajú Supabase prístupy). Fotku sa nepodarilo nahrať.",
    );
  }

  const supabase = createSupabaseAdminClient();
  const objectPath = buildObjectPath(file.name);

  const { error } = await supabase.storage
    .from(REFERENCES_BUCKET)
    .upload(objectPath, file, { contentType: file.type || "image/jpeg", upsert: false });

  if (error) {
    console.error("uploadGalleryImage: upload failed", error);
    throw new UserFacingError("Fotku sa nepodarilo nahrať do úložiska. Skúste to prosím znova.");
  }

  const { data } = supabase.storage.from(REFERENCES_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

/**
 * Best-effort cleanup of a previously uploaded image. Silently ignores images
 * that are not ours (seed photos served from `/public`) — a failed cleanup must
 * never block the database change that triggered it.
 */
export async function deleteGalleryImage(imagePath: string): Promise<void> {
  if (imagePath.startsWith(`/${LOCAL_UPLOAD_DIR}/`) && canUseLocalUploads()) {
    const { rm } = await import("node:fs/promises");
    const path = await import("node:path");
    await rm(path.join(process.cwd(), "public", imagePath), { force: true });
    return;
  }

  if (!isStorageConfigured() || !imagePath.startsWith("http")) {
    return;
  }

  const marker = `/${REFERENCES_BUCKET}/`;
  const markerIndex = imagePath.indexOf(marker);

  if (markerIndex === -1) {
    return;
  }

  const objectPath = decodeURIComponent(imagePath.slice(markerIndex + marker.length));

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(REFERENCES_BUCKET).remove([objectPath]);

    if (error) {
      console.error("deleteGalleryImage: remove failed", error);
    }
  } catch (error) {
    console.error("deleteGalleryImage: unexpected error", error);
  }
}
