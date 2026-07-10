"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inquiryFormSchema, type InquiryFormValues } from "@/lib/validations";

import { useInquirySubmit } from "./use-inquiry-submit";

export function ContactForm() {
  const { isSubmitting, submitInquiry } = useInquirySubmit();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const { errors } = form.formState;

  async function onSubmit(values: InquiryFormValues) {
    await submitInquiry(values, {
      type: "contact",
      setError: form.setError,
      onSuccess: () => form.reset(),
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="contact-name">Meno a priezvisko</FieldLabel>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="contact-email">E-mail</FieldLabel>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field data-invalid={Boolean(errors.message)}>
          <FieldLabel htmlFor="contact-message">Správa</FieldLabel>
          <Textarea
            id="contact-message"
            rows={5}
            placeholder="S čím vám môžeme pomôcť?"
            aria-invalid={Boolean(errors.message)}
            {...form.register("message")}
          />
          <FieldError errors={errors.message ? [errors.message] : undefined} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="justify-self-start">
          {isSubmitting ? (
            <Loader2Icon className="animate-spin" aria-hidden />
          ) : (
            <SendIcon aria-hidden />
          )}
          Odoslať správu
        </Button>
      </FieldGroup>
    </form>
  );
}
