import { auth } from "@academy/auth";
import { prisma } from "@academy/db";
import { NextResponse } from "next/server";

import { parseRangeHeader } from "@/lib/media-range";
import { isElevatedUserRole } from "@/lib/user";

type RouteContext = {
  params: Promise<{
    fileId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await context.params;

  const file = await prisma.lessonAudioFile.findUnique({
    where: {
      id: fileId,
    },
    select: {
      data: true,
      filename: true,
      mimeType: true,
      sizeInBytes: true,
      lesson: {
        select: {
          module: {
            select: {
              courseId: true,
            },
          },
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const canAccess = isElevatedUserRole(session.user.role)
    ? true
    : Boolean(
        await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: file.lesson.module.courseId,
            },
          },
          select: {
            id: true,
          },
        }),
      );

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rangeHeader = request.headers.get("range");
  const mimeType = file.mimeType || "audio/mpeg";
  const sizeInBytes = file.sizeInBytes;

  if (rangeHeader) {
    const parsedRange = parseRangeHeader(rangeHeader, sizeInBytes);

    if (!parsedRange) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${sizeInBytes}`,
        },
      });
    }

    const chunk = file.data.subarray(parsedRange.start, parsedRange.end + 1);

    return new NextResponse(chunk, {
      status: 206,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(chunk.length),
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${parsedRange.start}-${parsedRange.end}/${sizeInBytes}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  return new NextResponse(file.data, {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(sizeInBytes),
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
