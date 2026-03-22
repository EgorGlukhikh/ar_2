import { MediaSourceType } from "@academy/db";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordLessonTelemetry } from "@/features/analytics/service";
import { requireLearningViewer } from "@/lib/viewer";

const telemetrySchema = z.object({
  clientSessionId: z.string().trim().min(8),
  courseId: z.string().trim().min(1),
  lessonId: z.string().trim().min(1),
  eventType: z.string().trim().min(1),
  entryPath: z.string().trim().optional(),
  hadVideo: z.boolean().optional(),
  sourceType: z.nativeEnum(MediaSourceType).nullable().optional(),
  playerState: z.string().trim().optional().nullable(),
  visibilityState: z.string().trim().optional().nullable(),
  positionSeconds: z.number().finite().optional().nullable(),
  durationSeconds: z.number().finite().optional().nullable(),
  exitReason: z.string().trim().optional().nullable(),
  payload: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const viewer = await requireLearningViewer();
    const json = await request.json();
    const parsed = telemetrySchema.parse(json);

    await recordLessonTelemetry(viewer, parsed);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Telemetry event failed.",
      },
      { status: 400 },
    );
  }
}

