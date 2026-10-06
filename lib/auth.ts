/**
 * Single-user admin authentication.
 *
 * There is exactly one administrator and the credentials live in the
 * environment (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) - no user table, no password
 * reset flow. A successful login mints an HMAC-signed session token that is
 * stored in an HttpOnly cookie.
 *
 * This module must stay free of `next/headers` and Node-only APIs: it is
 * imported by `middleware.ts`, which runs on the edge runtime. Cookie handling
 * lives in `lib/auth-server.ts`.
 */

export const SESSION_COOKIE = "rsweld_admin_session";

/** Session lifetime. The cookie and the signed payload expire together. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const ADMIN_LOGIN_PATH = "/admin/prihlasenie";
export const ADMIN_HOME_PATH = "/admin";

export type AdminSession = {
  email: string;
  /** Expiry as a Unix timestamp in seconds. */
  expiresAt: number;
};

/**
 * Returns the configured credentials, or null when the admin area is not set
 * up. Deliberately no fallback password: a deployment without `ADMIN_PASSWORD`
 * has the admin area disabled rather than a well-known default.
 */
export function getAdminCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || !process.env.AUTH_SECRET) {
    return null;
  }

  return { email, password };
}

export function isAdminConfigured(): boolean {
  return getAdminCredentials() !== null;
}

const encoder = new TextEncoder();

async function getSigningKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set.");
  }

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

/**
 * Compares two secrets without leaking their contents through timing. Both
 * values are HMAC'd with a per-call random key, so the comparison runs over
 * fixed-length digests regardless of input length.
 */
export async function safeCompare(a: string, b: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    crypto.getRandomValues(new Uint8Array(32)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const [digestA, digestB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);

  const bytesA = new Uint8Array(digestA);
  const bytesB = new Uint8Array(digestB);
  let difference = 0;
  for (let index = 0; index < bytesA.length; index += 1) {
    difference |= bytesA[index] ^ bytesB[index];
  }
  return difference === 0;
}

/** Verifies a login attempt against the configured credentials. */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const credentials = getAdminCredentials();

  if (!credentials) {
    return false;
  }

  // Both comparisons always run so a wrong e-mail is not faster than a wrong password.
  const emailMatches = await safeCompare(email.trim().toLowerCase(), credentials.email);
  const passwordMatches = await safeCompare(password, credentials.password);

  return emailMatches && passwordMatches;
}

/** Mints a signed `<payload>.<signature>` session token. */
export async function createSessionToken(email: string): Promise<string> {
  const session: AdminSession = {
    email,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const payload = toBase64Url(encoder.encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getSigningKey(),
    encoder.encode(payload),
  );

  return `${payload}.${toBase64Url(signature)}`;
}

/** Returns the session carried by a token, or null when invalid or expired. */
export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  try {
    const isValid = await crypto.subtle.verify(
      "HMAC",
      await getSigningKey(),
      fromBase64Url(signature),
      encoder.encode(payload),
    );

    if (!isValid) {
      return null;
    }

    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as AdminSession;

    if (typeof session.expiresAt !== "number" || session.expiresAt * 1000 < Date.now()) {
      return null;
    }

    // A rotated e-mail (or removed configuration) invalidates existing sessions.
    if (session.email !== getAdminCredentials()?.email) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
