import { NextResponse } from "next/server";

import { handleResendWebhookEvent } from "@/features/email/service";
import { getEmailProvider } from "@/lib/email/provider";

export async function POST(request: Request) {
  try {
    const provider = getEmailProvider();

    if (provider.name !== "resend" || !provider.verifyWebhook) {
      return NextResponse.json(
        { error: "Resend provider is not enabled." },
        { status: 400 },
      );
    }

    const payload = await request.text();
    const event = await provider.verifyWebhook(payload, {
      id: request.headers.get("svix-id"),
      timestamp: request.headers.get("svix-timestamp"),
      signature: request.headers.get("svix-signature"),
    });

    await handleResendWebhookEvent(
      event as {
        type: string;
        created_at?: string;
        data?: { email_id?: string };
      },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid webhook payload.",
      },
      { status: 400 },
    );
  }
}
