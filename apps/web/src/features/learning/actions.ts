"use server";

import { EnrollmentStatus, prisma } from "@academy/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStudentOrElevatedUser } from "@/lib/user";

const lessonProgressSchema = z.object({
  lessonId: z.string().trim().min(1),
  courseId: z.string().trim().min(1),
  completed: z.boolean(),
});

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function toggleLessonCompletion(formData: FormData) {
  const user = await requireStudentOrElevatedUser();

  const parsed = lessonProgressSchema.parse({
    lessonId: getTrimmedValue(formData, "lessonId"),
    courseId: getTrimmedValue(formData, "courseId"),
    completed: getTrimmedValue(formData, "completed") === "true",
  });

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: parsed.courseId,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!enrollment || enrollment.status === EnrollmentStatus.CANCELED) {
    throw new Error("Enrollment not found.");
  }

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: parsed.lessonId,
      },
    },
    create: {
      userId: user.id,
      lessonId: parsed.lessonId,
      completedAt: parsed.completed ? new Date() : null,
      lastPositionSeconds: 0,
    },
    update: {
      completedAt: parsed.completed ? new Date() : null,
    },
  });

  revalidatePath("/learning");
  revalidatePath(`/learning/courses/${parsed.courseId}`);
}
