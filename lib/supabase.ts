import { createClient } from "@supabase/supabase-js";

/**
 * Supabase clients - currently used only for Storage (reference / gallery
 * images, inquiry attachments). Database access goes through Prisma.
 *
 * Both factories are lazy so importing this module never throws while
 * credentials are not yet provisioned.
 */

/** The public Storage bucket that holds reference / gallery images. */
export const REFERENCES_BUCKET = "references";

/**
 * Public client (anon key). Safe for the browser and for reading public
 * Storage objects / generating public URLs.
 */
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Service-role client. **Server-only** - the service role key bypasses Row
 * Level Security, so never import this into client components. Used for
 * uploads to Storage (inquiry attachments, admin uploads later).
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
