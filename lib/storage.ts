import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { isStorageConfigured } from "@/lib/config";
import { UserFacingError } from "@/lib/errors";
import { GALLERY_PREFIX, getBucketName, getS3Client, MEDIA_ROUTE } from "@/lib/s3";

/**
 * Gallery image storage (S3 bucket, `gallery/` prefix). Images are served
 * through the `/media/[...key]` proxy route, so `Photo.imagePath` stores a
 * site-relative path like `/media/gallery/railing-1a2b3c4d.jpg`.
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
 * Local development without object storage: photos go to `public/uploads/` (git
 * ignored) so the whole admin flow can be tried out. Never used in production -
 * a container filesystem is ephemeral and wiped on every deploy.
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
      "Úložisko obrázkov nie je nastavené (chýbajú prístupy k S3 bucketu). Fotku sa nepodarilo nahrať.",
    );
  }

  const key = `${GALLERY_PREFIX}${buildObjectPath(file.name)}`;

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || "image/jpeg",
        // Keys are unique per upload, so the object never changes.
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    console.error("uploadGalleryImage: upload failed", error);
    throw new UserFacingError("Fotku sa nepodarilo nahrať do úložiska. Skúste to prosím znova.");
  }

  return `${MEDIA_ROUTE}${key}`;
}

/**
 * Best-effort cleanup of a previously uploaded image. Silently ignores images
 * that are not ours (seed photos served from `/public`) - a failed cleanup must
 * never block the database change that triggered it.
 */
export async function deleteGalleryImage(imagePath: string): Promise<void> {
  if (imagePath.startsWith(`/${LOCAL_UPLOAD_DIR}/`) && canUseLocalUploads()) {
    const { rm } = await import("node:fs/promises");
    const path = await import("node:path");
    await rm(path.join(process.cwd(), "public", imagePath), { force: true });
    return;
  }

  if (!isStorageConfigured() || !imagePath.startsWith(`${MEDIA_ROUTE}${GALLERY_PREFIX}`)) {
    return;
  }

  try {
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: getBucketName(),
        Key: decodeURIComponent(imagePath.slice(MEDIA_ROUTE.length)),
      }),
    );
  } catch (error) {
    console.error("deleteGalleryImage: remove failed", error);
  }
}
