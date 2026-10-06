"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PaperclipIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ACCEPTED_ATTACHMENT_EXTENSIONS,
  inquiryFormSchema,
  isAcceptedAttachment,
  MAX_ATTACHMENT_BYTES,
  type InquiryFormValues,
  type InquiryType,
} from "@/lib/validations";

import { useInquirySubmit } from "./use-inquiry-submit";

/** The two intents the single site form covers; copy adapts to the choice. */
const inquiryTypes: Record<
  InquiryType,
  { label: string; messageLabel: string; placeholder: string; hint?: string }
> = {
  quote: {
    label: "Cenová ponuka",
    messageLabel: "Popis zákazky",
    placeholder: "Čo potrebujete vyrobiť? Rozmery, materiál, termín…",
    hint: "Čím viac detailov, tým presnejšia bude cenová ponuka.",
  },
  contact: {
    label: "Otázka",
    messageLabel: "Správa",
    placeholder: "S čím vám môžeme pomôcť?",
  },
};

/*
 * The site's only inquiry form (contact + quote request). Quote is the
 * default - it is what almost every visitor comes for.
 */
export function InquiryForm() {
  const { isSubmitting, submitInquiry } = useInquirySubmit();
  const [type, setType] = useState<InquiryType>("quote");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  // Bumping the key remounts (and thereby clears) the uncontrolled file input.
  const [fileInputKey, setFileInputKey] = useState(0);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const { errors } = form.formState;
  const copy = inquiryTypes[type];

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
      type,
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
        <FieldSet>
          <FieldLegend variant="label">S čím sa na nás obraciate?</FieldLegend>
          <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
            {(Object.keys(inquiryTypes) as InquiryType[]).map((value) => (
              <label
                key={value}
                className="border-border has-checked:border-primary has-checked:bg-accent has-checked:text-accent-foreground has-focus-visible:ring-ring/50 flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors has-focus-visible:ring-3"
              >
                <input
                  type="radio"
                  name="inquiry-type"
                  value={value}
                  checked={type === value}
                  onChange={() => setType(value)}
                  className="sr-only"
                />
                {inquiryTypes[value].label}
              </label>
            ))}
          </div>
        </FieldSet>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="inquiry-name">Meno a priezvisko</FieldLabel>
            <Input
              id="inquiry-name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="inquiry-email">E-mail</FieldLabel>
            <Input
              id="inquiry-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...form.register("email")}
            />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="inquiry-phone">Telefón (nepovinné)</FieldLabel>
          <Input
            id="inquiry-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...form.register("phone")}
          />
          <FieldError errors={errors.phone ? [errors.phone] : undefined} />
        </Field>

        <Field data-invalid={Boolean(errors.message)}>
          <FieldLabel htmlFor="inquiry-message">{copy.messageLabel}</FieldLabel>
          <Textarea
            id="inquiry-message"
            rows={6}
            placeholder={copy.placeholder}
            aria-invalid={Boolean(errors.message)}
            {...form.register("message")}
          />
          {copy.hint ? <FieldDescription>{copy.hint}</FieldDescription> : null}
          <FieldError errors={errors.message ? [errors.message] : undefined} />
        </Field>

        <Field data-invalid={Boolean(fileError)}>
          <FieldLabel htmlFor="inquiry-file">
            <PaperclipIcon className="size-4" aria-hidden />
            Výkres alebo fotka (nepovinné)
          </FieldLabel>
          <Input
            id="inquiry-file"
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
          {type === "quote" ? "Odoslať dopyt" : "Odoslať správu"}
        </Button>
      </FieldGroup>
    </form>
  );
}
