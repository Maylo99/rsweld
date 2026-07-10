import { Resend } from "resend";

import { siteConfig } from "@/lib/site";
import type { InquiryInput } from "@/lib/validations";

/**
 * Sends the inquiry notification to the owner's inbox via Resend.
 * No-ops (with a warning) when RESEND_API_KEY is not configured, so the
 * API stays functional before credentials are provisioned.
 */
export async function sendInquiryNotification(
  inquiry: InquiryInput,
  options: { attachmentUrl?: string; attachmentName?: string } = {},
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.NOTIFICATION_EMAIL;

  if (!apiKey || !from || !to) {
    console.warn(
      "sendInquiryNotification: RESEND_API_KEY / RESEND_FROM_EMAIL / NOTIFICATION_EMAIL not configured, skipping email.",
    );
    return;
  }

  const resend = new Resend(apiKey);

  // Visible email content is Slovak (read by the owner).
  const typeLabel = inquiry.type === "quote" ? "Cenová ponuka" : "Kontakt";
  const lines = [
    `Typ: ${typeLabel}`,
    `Meno: ${inquiry.name}`,
    `E-mail: ${inquiry.email}`,
    inquiry.phone ? `Telefón: ${inquiry.phone}` : null,
    "",
    "Správa:",
    inquiry.message,
    "",
    options.attachmentUrl
      ? `Príloha: ${options.attachmentName ?? "súbor"} — ${options.attachmentUrl}`
      : null,
  ].filter((line): line is string => line !== null);

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: inquiry.email,
    subject: `Nový dopyt z webu ${siteConfig.name} — ${typeLabel}`,
    text: lines.join("\n"),
  });

  if (error) {
    // Surface but don't fail the request — the inquiry is already persisted.
    console.error("sendInquiryNotification: Resend returned an error", error);
  }
}
