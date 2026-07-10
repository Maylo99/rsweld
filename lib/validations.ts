import { z } from "zod";

/**
 * Validation for inquiries submitted from the site (contact form + quote
 * request). Kept generic and decoupled from any DB model — the persistence
 * layer is wired up in the next phase.
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
