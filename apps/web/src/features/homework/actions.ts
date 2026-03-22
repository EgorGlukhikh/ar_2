"use server";

import {
  EnrollmentStatus,
  HomeworkSubmissionStatus,
  prisma,
} from "@academy/db";
import { revalidatePath } from "next/cache";
import { USER_ROLES } from "@academy/shared";
import { z } from "zod";

import { requireRoleAccess } from "@/lib/admin";
import { isElevatedUserRole, requireStudentOrElevatedUser } from "@/lib/user";

const MAX_HOMEWORK_FILE_BYTES = 10 * 1024 * 1024;

const submitHomeworkSchema = z.object({
  assignmentId: z.string().trim().min(1),
  courseId: z.string().trim().min(1),
  lessonId: z.string().trim().min(1),
  submissionText: z.string().trim().optional(),
  submissionUrl: z.string().trim().optional(),
});

const reviewHomeworkSchema = z.object({
  submissionId: z.string().trim().min(1),
  actionType: z.enum(["approve", "revision", "in_review"]),
  feedback: z.string().trim().optional(),
});

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateHomeworkRoutes(courseId: string, lessonId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath("/admin/homework");
  revalidatePath("/learning");
  revalidatePath(`/learning/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/content`);
  revalidatePath(`/admin/courses/${courseId}/access`);

  if (lessonId) {
    revalidatePath(`/learning/courses/${courseId}?lessonId=${lessonId}`);
  }
}

async function buildSubmissionSnapshot(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  submissionId: string,
  submissionText?: string | null,
  submissionUrl?: string | null,
) {
  const files = await tx.homeworkSubmissionFile.findMany({
    where: {
      submissionId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      sizeInBytes: true,
      createdAt: true,
    },
  });

  return {
    submissionText: submissionText ?? null,
    submissionUrl: submissionUrl ?? null,
    files,
  };
}

export async function submitHomework(formData: FormData) {
  const user = await requireStudentOrElevatedUser();

  const parsed = submitHomeworkSchema.parse({
    assignmentId: getTrimmedValue(formData, "assignmentId"),
    courseId: getTrimmedValue(formData, "courseId"),
    lessonId: getTrimmedValue(formData, "lessonId"),
    submissionText: getTrimmedValue(formData, "submissionText") || undefined,
    submissionUrl: getTrimmedValue(formData, "submissionUrl") || undefined,
  });

  const fileInput = formData.get("submissionFile");
  const submissionFile =
    fileInput instanceof File && fileInput.size > 0 ? fileInput : null;

  const assignment = await prisma.homeworkAssignment.findUnique({
    where: {
      id: parsed.assignmentId,
    },
    include: {
      lesson: {
        select: {
          id: true,
          module: {
            select: {
              courseId: true,
            },
          },
        },
      },
    },
  });

  if (!assignment || assignment.lesson.id !== parsed.lessonId) {
    throw new Error("Домашняя работа не найдена.");
  }

  if (assignment.lesson.module.courseId !== parsed.courseId) {
    throw new Error("Домашняя работа относится к другому курсу.");
  }

  if (!isElevatedUserRole(user.role)) {
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
      throw new Error("У тебя нет доступа к этому курсу.");
    }
  }

  if (!assignment.allowTextSubmission && parsed.submissionText) {
    throw new Error("Текстовый ответ в этом задании отключен.");
  }

  if (!assignment.allowLinkSubmission && parsed.submissionUrl) {
    throw new Error("Ссылка в этом задании отключена.");
  }

  if (!assignment.allowFileUpload && submissionFile) {
    throw new Error("Загрузка файла в этом задании отключена.");
  }

  if (submissionFile && submissionFile.size > MAX_HOMEWORK_FILE_BYTES) {
    throw new Error("Файл домашней работы должен быть не больше 10 МБ.");
  }

  if (!parsed.submissionText && !parsed.submissionUrl && !submissionFile) {
    throw new Error("Добавь текст, ссылку или файл для сдачи домашней работы.");
  }

  const now = new Date();
  const nextStatus = assignment.requiresCuratorReview
    ? HomeworkSubmissionStatus.SUBMITTED
    : HomeworkSubmissionStatus.APPROVED;

  await prisma.$transaction(async (tx) => {
    const submission = await tx.homeworkSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: user.id,
        },
      },
      create: {
        assignmentId: assignment.id,
        studentId: user.id,
        status: nextStatus,
        submissionText: parsed.submissionText,
        submissionUrl: parsed.submissionUrl,
        feedback: null,
        submittedAt: now,
        reviewedAt: nextStatus === HomeworkSubmissionStatus.APPROVED ? now : null,
        approvedAt: nextStatus === HomeworkSubmissionStatus.APPROVED ? now : null,
        revisionRequestedAt: null,
      },
      update: {
        status: nextStatus,
        submissionText: parsed.submissionText,
        submissionUrl: parsed.submissionUrl,
        feedback: null,
        reviewerId: null,
        submittedAt: now,
        reviewedAt: nextStatus === HomeworkSubmissionStatus.APPROVED ? now : null,
        approvedAt: nextStatus === HomeworkSubmissionStatus.APPROVED ? now : null,
        revisionRequestedAt: null,
      },
    });

    if (submissionFile) {
      await tx.homeworkSubmissionFile.deleteMany({
        where: {
          submissionId: submission.id,
        },
      });

      await tx.homeworkSubmissionFile.create({
        data: {
          submissionId: submission.id,
          filename: submissionFile.name,
          mimeType: submissionFile.type || null,
          sizeInBytes: submissionFile.size,
          data: Buffer.from(await submissionFile.arrayBuffer()),
        },
      });
    }

    const snapshot = await buildSubmissionSnapshot(
      tx,
      submission.id,
      parsed.submissionText,
      parsed.submissionUrl,
    );

    await tx.homeworkReview.create({
      data: {
        assignmentId: assignment.id,
        studentId: user.id,
        submission: snapshot,
        status: nextStatus === HomeworkSubmissionStatus.APPROVED ? "approved" : "submitted",
      },
    });

    if (nextStatus === HomeworkSubmissionStatus.APPROVED) {
      await tx.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: parsed.lessonId,
          },
        },
        create: {
          userId: user.id,
          lessonId: parsed.lessonId,
          completedAt: now,
          lastPositionSeconds: 0,
        },
        update: {
          completedAt: now,
        },
      });
    }
  });

  revalidateHomeworkRoutes(parsed.courseId, parsed.lessonId);
}

export async function reviewHomeworkSubmission(formData: FormData) {
  const reviewer = await requireRoleAccess([USER_ROLES.ADMIN, USER_ROLES.CURATOR]);

  const parsed = reviewHomeworkSchema.parse({
    submissionId: getTrimmedValue(formData, "submissionId"),
    actionType: getTrimmedValue(formData, "actionType"),
    feedback: getTrimmedValue(formData, "feedback") || undefined,
  });

  const submission = await prisma.homeworkSubmission.findUnique({
    where: {
      id: parsed.submissionId,
    },
    include: {
      assignment: {
        include: {
          lesson: {
            include: {
              module: {
                select: {
                  courseId: true,
                },
              },
            },
          },
        },
      },
      student: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Сдача домашней работы не найдена.");
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    if (parsed.actionType === "in_review") {
      await tx.homeworkSubmission.update({
        where: {
          id: submission.id,
        },
        data: {
          status: HomeworkSubmissionStatus.IN_REVIEW,
          reviewerId: reviewer.id,
          feedback: parsed.feedback ?? submission.feedback,
        },
      });

      const snapshot = await buildSubmissionSnapshot(
        tx,
        submission.id,
        submission.submissionText,
        submission.submissionUrl,
      );

      await tx.homeworkReview.create({
        data: {
          assignmentId: submission.assignmentId,
          studentId: submission.student.id,
          reviewerId: reviewer.id,
          submission: snapshot,
          feedback: parsed.feedback ?? submission.feedback,
          status: "in_review",
        },
      });
      return;
    }

    const isApproved = parsed.actionType === "approve";

    await tx.homeworkSubmission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: isApproved
          ? HomeworkSubmissionStatus.APPROVED
          : HomeworkSubmissionStatus.REVISION_REQUESTED,
        reviewerId: reviewer.id,
        feedback: parsed.feedback ?? null,
        reviewedAt: now,
        approvedAt: isApproved ? now : null,
        revisionRequestedAt: isApproved ? null : now,
      },
    });

    const snapshot = await buildSubmissionSnapshot(
      tx,
      submission.id,
      submission.submissionText,
      submission.submissionUrl,
    );

    await tx.homeworkReview.create({
      data: {
        assignmentId: submission.assignmentId,
        studentId: submission.student.id,
        reviewerId: reviewer.id,
        submission: snapshot,
        feedback: parsed.feedback ?? null,
        status: isApproved ? "approved" : "revision_requested",
      },
    });

    await tx.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: submission.student.id,
          lessonId: submission.assignment.lesson.id,
        },
      },
      create: {
        userId: submission.student.id,
        lessonId: submission.assignment.lesson.id,
        completedAt: isApproved ? now : null,
        lastPositionSeconds: 0,
      },
      update: {
        completedAt: isApproved ? now : null,
      },
    });
  });

  revalidateHomeworkRoutes(
    submission.assignment.lesson.module.courseId,
    submission.assignment.lesson.id,
  );
}
