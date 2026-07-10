import { NextResponse } from "next/server";
import { z } from "zod";

import { inquirySchema } from "@/lib/validations";

/**
 * POST /api/inquiries
 *
 * Phase 1 stub: validates the payload with Zod and echoes success.
 * Persisting to the database (Prisma) and sending the notification email
 * (Resend) are wired up in the next phase.
 */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Neplatné telo požiadavky (očakáva sa JSON)." },
      { status: 400 },
    );
  }

  const result = inquirySchema.safeParse(body);

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

  // TODO (phase 2): persist `result.data` via Prisma and send the notification
  // email via Resend.

  return NextResponse.json({ success: true }, { status: 201 });
}
