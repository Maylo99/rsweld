/**
 * Runtime feature detection. The site is built to run with an empty `.env`
 * (seed content, no persistence), so every integration is probed rather than
 * assumed - see the "graceful degradation" section in CLAUDE.md.
 */

/**
 * During `next build` only `DIRECT_URL` counts: on Railway `DATABASE_URL` is
 * the private-network URL, which is unreachable while building, so without a
 * public `DIRECT_URL` the ISR pages are prerendered from seed data instead of
 * failing on a connection error.
 */
export function isDatabaseConfigured(): boolean {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return Boolean(process.env.DIRECT_URL);
  }

  return Boolean(process.env.DATABASE_URL);
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY,
  );
}

export type SamplePhotosMode = "auto" | "show" | "hide";

/** `SAMPLE_PHOTOS=show|hide` - see `lib/sample-photos.ts`. Anything else = auto. */
export function samplePhotosMode(): SamplePhotosMode {
  const value = process.env.SAMPLE_PHOTOS?.trim().toLowerCase();
  return value === "show" || value === "hide" ? value : "auto";
}
