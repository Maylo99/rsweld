import { z } from "zod";

import { PLACEMENTS } from "@/lib/types";

/**
 * Validation for inquiries submitted from the site (contact form + quote
 * request). Visible error messages are Slovak (site content).
 */
export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Zadajte meno (aspoň 2 znaky)." })
    .max(120, { message: "Meno je príliš dlhé." }),
  email: z.email({ message: "Zadajte platný e-mail." }).max(200),
  phone: z
    .string()
    .trim()
    .max(40, { message: "Telefónne číslo je príliš dlhé." })
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, { message: "Správa musí mať aspoň 10 znakov." })
    .max(5000, { message: "Správa je príliš dlhá." }),
  type: z.enum(["contact", "quote"]),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryType = InquiryInput["type"];

/** Client-side form schema - `type` comes from the form's type switch, not a text field. */
export const inquiryFormSchema = inquirySchema.omit({ type: true });

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

/** Attachment constraints for inquiries (drawings, photos). */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB

export const ACCEPTED_ATTACHMENT_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".dwg",
  ".dxf",
  ".step",
  ".stp",
] as const;

export function isAcceptedAttachment(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ACCEPTED_ATTACHMENT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

/* -------------------------------------------------------------------------- */
/*  Admin                                                                      */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z.email({ message: "Zadajte platný e-mail." }).max(200),
  password: z.string().min(1, { message: "Zadajte heslo." }).max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Tag name as typed by the administrator. */
export const tagNameSchema = z
  .string()
  .trim()
  .min(2, { message: "Názov tagu musí mať aspoň 2 znaky." })
  .max(40, { message: "Názov tagu je príliš dlhý (max. 40 znakov)." });

/** Photo fields the administrator edits (upload and edit share them). */
export const photoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Zadajte názov (aspoň 2 znaky)." })
    .max(120, { message: "Názov je príliš dlhý (max. 120 znakov)." }),
  description: z
    .string()
    .trim()
    .max(1000, { message: "Popis je príliš dlhý (max. 1000 znakov)." })
    .optional()
    .or(z.literal("")),
  // Optional in the form - falls back to the title, which is descriptive.
  imageAlt: z
    .string()
    .trim()
    .max(200, { message: "Popis fotky je príliš dlhý (max. 200 znakov)." })
    .optional()
    .or(z.literal("")),
  tagIds: z.array(z.string().min(1)).max(50),
  newTags: z.array(tagNameSchema).max(20),
  placements: z.array(z.enum(PLACEMENTS)),
});

export type PhotoInput = z.infer<typeof photoSchema>;

/**
 * Gallery image constraints (admin upload). Photos are downscaled in the
 * browser before upload (`components/admin/upload/compress-image.ts`), so the
 * server limit only has to cover the compressed file - and must stay below the
 * Server Action body limit in `next.config.ts` and Vercel's 4.5 MB cap.
 */
export const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** `accept` attribute for the upload input. */
export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");

export function isAcceptedImage(file: File): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);
}
