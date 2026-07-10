"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PaperclipIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ACCEPTED_ATTACHMENT_EXTENSIONS,
  inquiryFormSchema,
  isAcceptedAttachment,
  MAX_ATTACHMENT_BYTES,
  type InquiryFormValues,
} from "@/lib/validations";

import { useInquirySubmit } from "./use-inquiry-submit";

export function QuoteForm() {
  const { isSubmitting, submitInquiry } = useInquirySubmit();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  // Bumping the key remounts (and thereby clears) the uncontrolled file input.
  const [fileInputKey, setFileInputKey] = useState(0);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const { errors } = form.formState;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFileError(null);

    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.size > MAX_ATTACHMENT_BYTES) {
      setFileError("Súbor je príliš veľký (maximum 10 MB).");
      setFile(null);
      return;
    }
    if (!isAcceptedAttachment(selected.name)) {
      setFileError("Nepodporovaný typ súboru.");
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function onSubmit(values: InquiryFormValues) {
    if (fileError) return;
    await submitInquiry(values, {
      type: "quote",
      file,
      setError: form.setError,
      onSuccess: () => {
        form.reset();
        setFile(null);
        setFileInputKey((key) => key + 1);
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="quote-name">Meno a priezvisko</FieldLabel>
            <Input
              id="quote-name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="quote-email">E-mail</FieldLabel>
            <Input
              id="quote-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...form.register("email")}
            />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="quote-phone">Telefón (nepovinné)</FieldLabel>
          <Input
            id="quote-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...form.register("phone")}
          />
          <FieldError errors={errors.phone ? [errors.phone] : undefined} />
        </Field>

        <Field data-invalid={Boolean(errors.message)}>
          <FieldLabel htmlFor="quote-message">Popis zákazky</FieldLabel>
          <Textarea
            id="quote-message"
            rows={6}
            placeholder="Čo potrebujete vyrobiť? Rozmery, materiál, termín…"
            aria-invalid={Boolean(errors.message)}
            {...form.register("message")}
          />
          <FieldDescription>Čím viac detailov, tým presnejšia bude cenová ponuka.</FieldDescription>
          <FieldError errors={errors.message ? [errors.message] : undefined} />
        </Field>

        <Field data-invalid={Boolean(fileError)}>
          <FieldLabel htmlFor="quote-file">
            <PaperclipIcon className="size-4" aria-hidden />
            Výkresová dokumentácia (nepovinné)
          </FieldLabel>
          <Input
            id="quote-file"
            key={fileInputKey}
            type="file"
            accept={ACCEPTED_ATTACHMENT_EXTENSIONS.join(",")}
            onChange={handleFileChange}
          />
          <FieldDescription>
            PDF, obrázok alebo CAD súbor (DWG, DXF, STEP), maximálne 10 MB.
          </FieldDescription>
          {fileError ? <FieldError>{fileError}</FieldError> : null}
        </Field>

        <Button type="submit" size="lg" disabled={isSubmitting} className="justify-self-start">
          {isSubmitting ? (
            <Loader2Icon className="animate-spin" aria-hidden />
          ) : (
            <SendIcon aria-hidden />
          )}
          Odoslať dopyt
        </Button>
      </FieldGroup>
    </form>
  );
}
