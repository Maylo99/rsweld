/**
 * Runtime feature detection. The site is built to run with an empty `.env`
 * (seed content, no persistence), so every integration is probed rather than
 * assumed — see the "graceful degradation" section in CLAUDE.md.
 */

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function isStorageConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
