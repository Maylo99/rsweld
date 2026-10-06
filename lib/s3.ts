import { S3Client } from "@aws-sdk/client-s3";

/**
 * S3-compatible object storage (Railway Bucket in production, S3Mock locally -
 * see docker-compose.yml).
 * Holds gallery images (`gallery/` prefix) and inquiry attachments
 * (`inquiries/` prefix) in a single private bucket - Railway Buckets have no
 * public access, so gallery images are proxied through `/media/[...key]` and
 * attachments are shared via presigned URLs.
 *
 * Server-only. The client factory is lazy so importing this module never
 * throws while credentials are not yet provisioned.
 */

/** Object key prefix for gallery images (served publicly via `/media`). */
export const GALLERY_PREFIX = "gallery/";

/** Object key prefix for inquiry attachments (private, presigned links only). */
export const INQUIRIES_PREFIX = "inquiries/";

/** Public URL path under which gallery objects are proxied. */
export const MEDIA_ROUTE = "/media/";

export function getBucketName(): string {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("Missing S3_BUCKET environment variable.");
  }

  return bucket;
}

let client: S3Client | undefined;

export function getS3Client(): S3Client {
  if (client) {
    return client;
  }

  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing S3_ENDPOINT, S3_ACCESS_KEY_ID or S3_SECRET_ACCESS_KEY environment variables.",
    );
  }

  client = new S3Client({
    endpoint,
    region: process.env.S3_REGION || "auto",
    credentials: { accessKeyId, secretAccessKey },
    // Railway uses virtual-hosted-style URLs; local S3Mock and older Railway
    // buckets need path-style.
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    // Newer SDKs add CRC checksums to every request by default, which not
    // every S3-compatible provider accepts - only send them when required.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return client;
}
