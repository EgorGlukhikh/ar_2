import { prisma } from "@academy/db";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    fileId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { fileId } = await context.params;

  const file = await prisma.courseCoverFile.findUnique({
    where: {
      id: fileId,
    },
    select: {
      data: true,
      filename: true,
      mimeType: true,
      sizeInBytes: true,
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(file.data, {
    headers: {
      "Content-Type": file.mimeType || "image/jpeg",
      "Content-Length": String(file.sizeInBytes),
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
