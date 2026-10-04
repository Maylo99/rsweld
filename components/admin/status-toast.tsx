"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Shows the outcome of the last mutation. Server Actions redirect back with a
 * `?stav=` marker (they cannot push a toast themselves); this clears the marker
 * from the URL so a refresh does not repeat the message.
 */
const MESSAGES: Record<string, { text: string; tone: "success" | "error" }> = {
  upravene: { text: "Zmeny boli uložené.", tone: "success" },
  zmazane: { text: "Fotka bola zmazaná.", tone: "success" },
  chyba: { text: "Akciu sa nepodarilo dokončiť.", tone: "error" },
};

export function StatusToast({ status }: { status?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (!status || shown.current === status) {
      return;
    }

    const message = MESSAGES[status];

    if (!message) {
      return;
    }

    shown.current = status;
    if (message.tone === "success") {
      toast.success(message.text);
    } else {
      toast.error(message.text);
    }

    router.replace(pathname, { scroll: false });
  }, [pathname, router, status]);

  return null;
}
