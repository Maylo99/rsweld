import { z } from "zod";

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

/** Client-side form schema — `type` is fixed per form, not user input. */
export const inquiryFormSchema = inquirySchema.omit({ type: true });

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

/** Attachment constraints for quote requests (drawings, photos). */
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
