import Script from "next/script";

import { CookieBanner } from "@/components/analytics/cookie-banner";
import { GA_MEASUREMENT_ID, gaBootstrapScript } from "@/lib/analytics";

/**
 * GA4 + Consent Mode v2 + cookie banner. Rendered by the public layouts only
 * (`app/(site)/layout.tsx`, `app/not-found.tsx`), not by `/admin`.
 *
 * The plain inline script runs during HTML parsing, so the consent defaults
 * are always queued before gtag.js (loaded after hydration) reads the queue.
 *
 * Client-side navigation: GA4 enhanced measurement ("page changes based on
 * browser history events", on by default) sends page_view on pushState - no
 * manual page_view here, or every navigation would be counted twice.
 */
export function GoogleAnalytics() {
  return (
    <>
      <script id="ga-bootstrap" dangerouslySetInnerHTML={{ __html: gaBootstrapScript() }} />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <CookieBanner />
    </>
  );
}
