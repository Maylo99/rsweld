/**
 * Google Analytics 4 with Google Consent Mode v2.
 *
 * Every consent type defaults to `denied` before gtag.js loads, so GA only
 * sends cookieless pings (gcs=G100) until the visitor accepts in the cookie
 * banner. The choice is kept in localStorage and re-applied by the bootstrap
 * script on the next visit, before the first hit.
 */

/** Existing GA4 property (carried over from the old rs-weld.com site). */
export const GA_MEASUREMENT_ID = "G-6NXXJJRL69";

export const CONSENT_STORAGE_KEY = "rsweld_consent";

/** Dispatched on `window` to reopen the cookie banner (footer link). */
export const OPEN_CONSENT_EVENT = "rsweld:open-consent";

export type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Inline script rendered before gtag.js: defines `gtag`, sets the consent
 * defaults, re-applies a stored choice and queues the config call. gtag.js
 * processes the queue in order once it loads.
 */
export function gaBootstrapScript(): string {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
try {
  if (localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}) === 'granted') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
} catch (e) {}
gtag('js', new Date());
gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)});
`;
}

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** Saves the visitor's choice and pushes it to Consent Mode. */
export function saveConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage blocked (private mode) - the choice still applies to this page view.
  }

  window.gtag?.("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });

  if (choice === "denied") {
    removeGaCookies();
  }
}

/** Withdrawing consent should not leave earlier `_ga` cookies behind. */
function removeGaCookies(): void {
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  if (names.length === 0) return;

  // GA sets cookies on the top-most writable domain (e.g. `.rsweld.sk`),
  // so try every parent domain of the current host.
  const labels = window.location.hostname.split(".");
  const domains = labels.map((_, i) => labels.slice(i).join("."));
  const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  for (const name of names) {
    document.cookie = `${name}=; ${expires}`;
    for (const domain of domains) {
      document.cookie = `${name}=; ${expires}; domain=.${domain}`;
    }
  }
}

/** Sends a GA4 event; a no-op when gtag is not on the page (e.g. blocked). */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  window.gtag?.("event", name, params);
}
