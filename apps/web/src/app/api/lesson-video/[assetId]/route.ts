import { auth } from "@academy/auth";
import { prisma } from "@academy/db";
import { NextResponse } from "next/server";

import { isElevatedUserRole } from "@/lib/user";

type RouteContext = {
  params: Promise<{
    assetId: string;
  }>;
};

function parseRangeHeader(rangeHeader: string, sizeInBytes: number) {
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/i);

  if (!match) {
    return null;
  }

  const [, startRaw, endRaw] = match;
  const hasStart = startRaw !== "";
  const hasEnd = endRaw !== "";

  if (!hasStart && !hasEnd) {
    return null;
  }

  let start = hasStart ? Number.parseInt(startRaw, 10) : NaN;
  let end = hasEnd ? Number.parseInt(endRaw, 10) : NaN;

  if (!hasStart) {
    const suffixLength = end;

    if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
      return null;
    }

    start = Math.max(sizeInBytes - suffixLength, 0);
    end = sizeInBytes - 1;
  } else {
    if (!Number.isFinite(start) || start < 0 || start >= sizeInBytes) {
      return null;
    }

    if (!hasEnd || !Number.isFinite(end)) {
      end = sizeInBytes - 1;
    }
  }

  if (end < start) {
    return null;
  }

  end = Math.min(end, sizeInBytes - 1);

  return { start, end };
}

export async function GET(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await context.params;

  const asset = await prisma.videoAsset.findUnique({
    where: {
      id: assetId,
    },
    select: {
      fileData: true,
      originalFilename: true,
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

  if (!asset || !asset.fileData || !asset.sizeInBytes) {
    return NextResponse.json({ error: "Video file not found" }, { status: 404 });
  }

  const canAccess = isElevatedUserRole(session.user.role)
    ? true
    : Boolean(
        await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: asset.lesson.module.courseId,
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
  const mimeType = asset.mimeType || "video/mp4";
  const filename = asset.originalFilename || `lesson-video-${assetId}`;
  const sizeInBytes = asset.sizeInBytes;

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

    const chunk = asset.fileData.subarray(parsedRange.start, parsedRange.end + 1);

    return new NextResponse(chunk, {
      status: 206,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(chunk.length),
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${parsedRange.start}-${parsedRange.end}/${sizeInBytes}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  return new NextResponse(asset.fileData, {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(sizeInBytes),
      "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
