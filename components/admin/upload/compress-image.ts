/**
 * Downscales a photo in the browser before upload. Phone photos are 3-10 MB;
 * the site never shows them wider than ~1600 px, and Server Actions / Vercel
 * cap request bodies at a few MB. Also bakes in EXIF rotation.
 */
const MAX_EDGE = 2400;
const QUALITY = 0.86;

export class ImageDecodeError extends Error {}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function compressImage(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageDecodeError(
      "Tento formát sa nedá spracovať. Uložte fotku ako JPG alebo PNG a skúste znova.",
    );
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  // Already small and in a web format - upload as-is.
  if (scale === 1 && file.size < 1.5 * 1024 * 1024 && /^image\/(jpeg|png|webp)$/.test(file.type)) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // WebP is smaller; older Safari silently falls back to PNG, so check the type.
  let blob = await canvasToBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg");
  }
  if (!blob) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "fotka";
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
}
