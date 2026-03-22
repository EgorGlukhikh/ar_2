import { auth } from "@academy/auth";
import { prisma } from "@academy/db";
import { NextResponse } from "next/server";

import { isElevatedUserRole } from "@/lib/user";

type RouteContext = {
  params: Promise<{
    fileId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await context.params;

  const file = await prisma.homeworkSubmissionFile.findUnique({
    where: {
      id: fileId,
    },
    include: {
      submission: {
        select: {
          studentId: true,
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const canAccess =
    file.submission.studentId === session.user.id || isElevatedUserRole(session.user.role);

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return new NextResponse(file.data, {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Length": String(file.sizeInBytes),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
    },
  });
}
