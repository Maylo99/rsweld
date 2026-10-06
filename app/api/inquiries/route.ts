import { NextResponse } from "next/server";
import { z } from "zod";

import { sendInquiryNotification } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase";
import {
  inquirySchema,
  isAcceptedAttachment,
  MAX_ATTACHMENT_BYTES,
  type InquiryInput,
} from "@/lib/validations";

export const runtime = "nodejs";

const INQUIRIES_BUCKET = "inquiries";
/** Signed URL lifetime for the attachment link in the notification email. */
const ATTACHMENT_URL_EXPIRES_SECONDS = 60 * 60 * 24 * 7; // 7 days

type ParsedRequest = {
  fields: unknown;
  file: File | null;
};

async function parseRequest(request: Request): Promise<ParsedRequest | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    return {
      fields: {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") ?? undefined,
        message: formData.get("message"),
        type: formData.get("type"),
      },
      file: file instanceof File && file.size > 0 ? file : null,
    };
  }

  try {
    return { fields: await request.json(), file: null };
  } catch {
    return null;
  }
}

/** Uploads the attachment to Supabase Storage; returns null when not configured or on failure. */
async function uploadAttachment(
  file: File,
): Promise<{ path: string; signedUrl: string | null } | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("uploadAttachment: Supabase not configured, skipping attachment upload.");
    return null;
  }

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${sanitizedName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(INQUIRIES_BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream" });

    if (uploadError) {
      console.error("uploadAttachment: upload failed", uploadError);
      return null;
    }

    const { data: signed } = await supabaseAdmin.storage
      .from(INQUIRIES_BUCKET)
      .createSignedUrl(path, ATTACHMENT_URL_EXPIRES_SECONDS);

    return { path, signedUrl: signed?.signedUrl ?? null };
  } catch (error) {
    console.error("uploadAttachment: unexpected error", error);
    return null;
  }
}

/** Persists the inquiry; returns false when the DB is not configured. Throws on real DB errors. */
async function persistInquiry(inquiry: InquiryInput, filePath: string | null): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.warn("persistInquiry: DATABASE_URL not configured, skipping persistence.");
    return false;
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.inquiry.create({
    data: {
      type: inquiry.type === "quote" ? "QUOTE" : "CONTACT",
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone || null,
      message: inquiry.message,
      filePath,
    },
  });
  return true;
}

/**
 * POST /api/inquiries
 *
 * Accepts JSON or multipart/form-data (quote form with optional attachment).
 * Validates with Zod, persists via Prisma and notifies via Resend - the
 * latter two degrade gracefully while credentials are not yet provisioned.
 */
export async function POST(request: Request) {
  const parsed = await parseRequest(request);

  if (!parsed) {
    return NextResponse.json(
      { success: false, error: "Neplatné telo požiadavky." },
      { status: 400 },
    );
  }

  const result = inquirySchema.safeParse(parsed.fields);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validácia zlyhala.",
        fieldErrors: z.flattenError(result.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  // Validate the attachment (optional, quote requests only).
  if (parsed.file) {
    if (parsed.file.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json(
        { success: false, error: "Súbor je príliš veľký (maximum 10 MB)." },
        { status: 422 },
      );
    }
    if (!isAcceptedAttachment(parsed.file.name)) {
      return NextResponse.json(
        { success: false, error: "Nepodporovaný typ súboru." },
        { status: 422 },
      );
    }
  }

  const attachment = parsed.file ? await uploadAttachment(parsed.file) : null;

  try {
    await persistInquiry(result.data, attachment?.path ?? null);
  } catch (error) {
    console.error("POST /api/inquiries: failed to persist inquiry", error);
    return NextResponse.json(
      { success: false, error: "Dopyt sa nepodarilo uložiť. Skúste to prosím neskôr." },
      { status: 500 },
    );
  }

  await sendInquiryNotification(result.data, {
    attachmentUrl: attachment?.signedUrl ?? undefined,
    attachmentName: parsed.file?.name,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
