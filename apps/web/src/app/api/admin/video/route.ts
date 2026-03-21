import { auth } from "@academy/auth";
import { USER_ROLES } from "@academy/shared";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  attachLessonEmbedVideo,
  clearLessonVideo,
  finalizeManagedVideoUpload,
  importLessonVideoFromUrl,
  prepareManagedVideoUpload,
  refreshLessonVideoAsset,
} from "@/features/admin/video-service";

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createUploadSession"),
    lessonId: z.string().trim().min(1),
    filename: z.string().trim().min(1),
    mimeType: z.string().trim().min(1),
    sizeInBytes: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("finalizeUpload"),
    assetId: z.string().trim().min(1),
  }),
  z.object({
    action: z.literal("importFromUrl"),
    lessonId: z.string().trim().min(1),
    sourceUrl: z.string().trim().url(),
  }),
  z.object({
    action: z.literal("attachEmbed"),
    lessonId: z.string().trim().min(1),
    sourceType: z.enum(["RUTUBE_EMBED", "EXTERNAL_EMBED"]),
    videoUrl: z.string().trim().url(),
  }),
  z.object({
    action: z.literal("clearVideo"),
    lessonId: z.string().trim().min(1),
  }),
  z.object({
    action: z.literal("refreshAsset"),
    assetId: z.string().trim().min(1),
  }),
]);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = requestSchema.parse(await request.json());

    switch (payload.action) {
      case "createUploadSession": {
        const result = await prepareManagedVideoUpload({
          lessonId: payload.lessonId,
          filename: payload.filename,
          mimeType: payload.mimeType,
          sizeInBytes: payload.sizeInBytes,
          ownerId: session.user.id,
        });

        return NextResponse.json({ ok: true, result });
      }
      case "finalizeUpload": {
        const result = await finalizeManagedVideoUpload({
          assetId: payload.assetId,
          ownerId: session.user.id,
        });

        return NextResponse.json({ ok: true, result });
      }
      case "importFromUrl": {
        const result = await importLessonVideoFromUrl({
          lessonId: payload.lessonId,
          sourceUrl: payload.sourceUrl,
          ownerId: session.user.id,
        });

        return NextResponse.json({ ok: true, result });
      }
      case "attachEmbed": {
        const result = await attachLessonEmbedVideo({
          lessonId: payload.lessonId,
          sourceType: payload.sourceType,
          videoUrl: payload.videoUrl,
        });

        return NextResponse.json({ ok: true, result });
      }
      case "clearVideo": {
        await clearLessonVideo({
          lessonId: payload.lessonId,
        });

        return NextResponse.json({ ok: true });
      }
      case "refreshAsset": {
        const result = await refreshLessonVideoAsset({
          assetId: payload.assetId,
        });

        return NextResponse.json({ ok: true, result });
      }
    }
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid request."
        : error instanceof Error
          ? error.message
          : "Unexpected error.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
