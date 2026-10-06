import { GetObjectCommand, S3ServiceException } from "@aws-sdk/client-s3";

import { isStorageConfigured } from "@/lib/config";
import { GALLERY_PREFIX, getBucketName, getS3Client } from "@/lib/s3";

export const runtime = "nodejs";

/**
 * GET /media/gallery/<file>
 *
 * Railway Buckets are private, so gallery images are streamed through this
 * route. Only the `gallery/` prefix is exposed - inquiry attachments stay
 * private. Object keys are unique per upload, so responses are cached as
 * immutable (browser, CDN and the next/image optimizer).
 */
export async function GET(request: Request, { params }: RouteContext<"/media/[...key]">) {
  const { key: segments } = await params;
  const key = segments.map((segment) => decodeURIComponent(segment)).join("/");

  if (!key.startsWith(GALLERY_PREFIX) || segments.some((s) => s === ".." || s === ".")) {
    return new Response("Not found", { status: 404 });
  }

  if (!isStorageConfigured()) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const object = await getS3Client().send(
      new GetObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        IfNoneMatch: request.headers.get("if-none-match") ?? undefined,
      }),
    );

    if (!object.Body) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers({
      "content-type": object.ContentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    });
    if (object.ContentLength !== undefined) {
      headers.set("content-length", String(object.ContentLength));
    }
    if (object.ETag) {
      headers.set("etag", object.ETag);
    }

    return new Response(object.Body.transformToWebStream(), { status: 200, headers });
  } catch (error) {
    const status = error instanceof S3ServiceException ? error.$metadata.httpStatusCode : undefined;

    if (status === 304) {
      return new Response(null, { status: 304 });
    }
    if (status === 404 || (error instanceof S3ServiceException && error.name === "NoSuchKey")) {
      return new Response("Not found", { status: 404 });
    }

    console.error("GET /media: failed to read object", error);
    return new Response("Storage error", { status: 502 });
  }
}
