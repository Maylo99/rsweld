"use client";

import { useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import type { InquiryFormValues } from "@/lib/validations";

type SubmitOptions = {
  type: "contact" | "quote";
  file?: File | null;
  setError: UseFormSetError<InquiryFormValues>;
  onSuccess: () => void;
};

/**
 * Shared submit logic for both inquiry forms: posts multipart form data,
 * maps server field errors back onto the form, drives toasts.
 */
export function useInquirySubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitInquiry(values: InquiryFormValues, options: SubmitOptions) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("type", options.type);
      formData.set("name", values.name);
      formData.set("email", values.email);
      formData.set("phone", values.phone ?? "");
      formData.set("message", values.message);
      if (options.file) {
        formData.set("file", options.file);
      }

      const response = await fetch("/api/inquiries", { method: "POST", body: formData });
      const payload: {
        success?: boolean;
        error?: string;
        fieldErrors?: Partial<Record<keyof InquiryFormValues, string[]>>;
      } = await response.json().catch(() => ({}));

      if (response.ok && payload.success) {
        toast.success("Ďakujeme za správu!", {
          description: "Ozveme sa vám čo najskôr — zvyčajne do 2–3 pracovných dní.",
        });
        options.onSuccess();
        return;
      }

      if (payload.fieldErrors) {
        for (const [field, messages] of Object.entries(payload.fieldErrors)) {
          if (messages?.[0]) {
            options.setError(field as keyof InquiryFormValues, { message: messages[0] });
          }
        }
      }

      toast.error("Správu sa nepodarilo odoslať.", {
        description: payload.error ?? "Skúste to prosím znova alebo nám zavolajte.",
      });
    } catch (error) {
      console.error("submitInquiry failed", error);
      toast.error("Správu sa nepodarilo odoslať.", {
        description: "Skontrolujte pripojenie a skúste to znova, alebo nám zavolajte.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, submitInquiry };
}
