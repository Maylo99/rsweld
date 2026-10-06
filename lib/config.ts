/**
 * Runtime feature detection. The site is built to run with an empty `.env`
 * (seed content, no persistence), so every integration is probed rather than
 * assumed - see the "graceful degradation" section in CLAUDE.md.
 */

export function isDatabaseConfigured(): boolean {
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
