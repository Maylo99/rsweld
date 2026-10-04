"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import type { MutationResult } from "@/app/admin/actions";

/**
 * Runs a gallery Server Action from a client component: tracks pending state
 * and reports the outcome as a toast. The action revalidates the admin, so the
 * page re-renders with fresh data on success — no manual refresh needed.
 */
export function useMutation() {
  const [pending, startTransition] = useTransition();

  function run(
    action: () => Promise<MutationResult>,
    options: { success?: string; onSuccess?: () => void; onError?: () => void } = {},
  ) {
    startTransition(async () => {
      let result: MutationResult;
      try {
        result = await action();
      } catch {
        result = { ok: false, message: "Spojenie zlyhalo. Skontrolujte internet a skúste znova." };
      }

      if (result.ok) {
        if (options.success) toast.success(options.success);
        options.onSuccess?.();
      } else {
        toast.error(result.message);
        options.onError?.();
      }
    });
  }

  return { pending, run };
}
