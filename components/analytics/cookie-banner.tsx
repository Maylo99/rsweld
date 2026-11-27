"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  CONSENT_STORAGE_KEY,
  type ConsentChoice,
  OPEN_CONSENT_EVENT,
  readConsent,
  saveConsent,
} from "@/lib/analytics";

const CONSENT_CHANGE_EVENT = "rsweld:consent-change";

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  };
}

/** "unknown" on the server and during hydration - the banner stays hidden. */
function useStoredConsent(): ConsentChoice | null | "unknown" {
  return useSyncExternalStore(subscribe, readConsent, () => "unknown");
}

/**
 * Cookie consent banner (no third-party service). Shown until the visitor
 * accepts or declines; the footer's "Nastavenia cookies" link reopens it.
 * Both choices are equally prominent buttons (GDPR).
 */
export function CookieBanner() {
  const consent = useStoredConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  if (consent === "unknown" || (consent !== null && !reopened)) {
    return null;
  }

  function choose(choice: ConsentChoice) {
    saveConsent(choice);
    setReopened(false);
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }

  return (
    <>
      {/* Mobile: lets the page end scroll clear of the fixed banner. */}
      <div aria-hidden className="h-32 sm:hidden" />
      <section
        aria-labelledby="cookie-banner-title"
        className="bg-background text-foreground fixed inset-x-0 bottom-0 z-50 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-sm sm:rounded-xl sm:border sm:p-4"
      >
        <h2 id="cookie-banner-title" className="sr-only text-sm font-semibold sm:not-sr-only">
          Cookies
        </h2>
        <p className="text-muted-foreground text-sm leading-snug sm:mt-1 sm:leading-relaxed">
          Používame cookies na meranie návštevnosti a vyhodnocovanie reklám. Môžete ich prijať alebo
          odmietnuť.
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3">
          <Button onClick={() => choose("denied")}>Odmietnuť</Button>
          <Button onClick={() => choose("granted")}>Prijať všetko</Button>
        </div>
      </section>
    </>
  );
}

/** Footer link that reopens the banner. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
    >
      Nastavenia cookies
    </button>
  );
}
