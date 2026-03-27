import { CourseDeliveryFormat, LessonType, prisma } from "@academy/db";
import { getTimezoneLabel } from "@/lib/timezones";
import { Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CourseStructureTree } from "@/components/admin/course-structure-tree";
import { EditableHomeworkRulesCard } from "@/components/admin/editable-homework-rules-card";
import { EditableLessonSettingsCard } from "@/components/admin/editable-lesson-settings-card";
import { EditableModulePanel } from "@/components/admin/editable-module-panel";
import { LessonBlockStudio } from "@/components/admin/lesson-block-studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  repositionLesson,
  repositionModule,
  updateLesson,
  updateModule,
} from "@/features/admin/course-actions";
import {
  resolveLessonBlocks,
  type LessonBlock,
  type PersistedLessonBlockRecord,
} from "@/lib/lesson-content";
import { canEditCourseContent, requireWorkspaceUser } from "@/lib/admin";

type CourseContentPageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams?: Promise<{
    moduleId?: string;
    lessonId?: string;
  }>;
};

type LessonBlockStoreRecord = PersistedLessonBlockRecord & {
  lessonId: string;
};

function getLessonBlocks(lesson: {
  type: LessonType;
  content: unknown;
  lessonBlocks?: {
    blockKey: string;
    type: "TEXT" | "VIDEO" | "FILE" | "HOMEWORK";
    position: number;
    title: string;
    body: string | null;
    url: string | null;
    note: string | null;
    submissionHint: string | null;
  }[];
  videoAsset: unknown;
  videoSourceType: unknown;
  videoUrl: unknown;
  videoPlaybackId: unknown;
}): LessonBlock[] {
  const extractedBlocks = resolveLessonBlocks({
    content: lesson.content,
    lessonBlocks: lesson.lessonBlocks,
  });

  if (extractedBlocks.length > 0) {
    return extractedBlocks;
  }

  if (lesson.videoAsset || lesson.videoSourceType || lesson.videoUrl || lesson.videoPlaybackId) {
    return [
      {
        id: "legacy-video",
        type: "VIDEO",
        title: "Видео",
        body: "",
      },
    ];
  }

  if (lesson.type === LessonType.HOMEWORK) {
    return [
      {
        id: "legacy-homework",
        type: "HOMEWORK",
        title: "Домашняя работа",
        body: "",
        submissionHint: "",
        questions: [],
      },
    ];
  }

  return [];
}

function EmptyStudio({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-sm)]">
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </article>
  );
}

export default async function CourseContentPage({
  params,
  searchParams,
}: CourseContentPageProps) {
  const viewer = await requireWorkspaceUser();
  const { courseId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      authorId: true,
      deliveryFormat: true,
      scheduleTimezone: true,
      modules: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              position: true,
              type: true,
              excerpt: true,
              isPreview: true,
              accessAfterDays: true,
              lessonImageUrl: true,
              content: true,
              videoSourceType: true,
              videoUrl: true,
              videoPlaybackId: true,
              videoAsset: {
                select: {
                  id: true,
                  provider: true,
                  sourceType: true,
                  status: true,
                  originalFilename: true,
                  sourceUrl: true,
                  playerUrl: true,
                  playbackId: true,
                  errorMessage: true,
                },
              },
              homeworkAssignment: {
                select: {
                  id: true,
                  requiresCuratorReview: true,
                  unlockNextModuleOnApproval: true,
                  allowTextSubmission: true,
                  allowLinkSubmission: true,
                  allowFileUpload: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  if (!canEditCourseContent(viewer, course.authorId)) {
    notFound();
  }

  const lessonIds = course.modules.flatMap((moduleItem) =>
    moduleItem.lessons.map((lesson) => lesson.id),
  );
  const lessonBlockPrisma = prisma as typeof prisma & {
    lessonBlock: {
      findMany(args: unknown): Promise<LessonBlockStoreRecord[]>;
    };
  };
  const persistedLessonBlocks =
    lessonIds.length > 0
      ? await lessonBlockPrisma.lessonBlock.findMany({
          where: {
            lessonId: {
              in: lessonIds,
            },
          },
          orderBy: [{ lessonId: "asc" }, { position: "asc" }],
          select: {
            lessonId: true,
            blockKey: true,
            type: true,
            position: true,
            title: true,
            body: true,
            url: true,
            note: true,
            submissionHint: true,
          },
        })
      : [];
  const lessonBlocksByLessonId = new Map<string, (typeof persistedLessonBlocks)[number][]>();

  persistedLessonBlocks.forEach((block) => {
    const blocks = lessonBlocksByLessonId.get(block.lessonId) ?? [];
    blocks.push(block);
    lessonBlocksByLessonId.set(block.lessonId, blocks);
  });

  const lessonOwnerModule =
    course.modules.find((moduleItem) =>
      moduleItem.lessons.some((lesson) => lesson.id === resolvedSearchParams.lessonId),
    ) ?? null;

  const selectedModule =
    lessonOwnerModule ??
    course.modules.find((moduleItem) => moduleItem.id === resolvedSearchParams.moduleId) ??
    course.modules[0] ??
    null;

  const selectedLesson =
    selectedModule?.lessons.find((lesson) => lesson.id === resolvedSearchParams.lessonId) ??
    selectedModule?.lessons[0] ??
    null;

  const selectedLessonBlocks = selectedLesson
    ? getLessonBlocks({
        ...selectedLesson,
        lessonBlocks: lessonBlocksByLessonId.get(selectedLesson.id),
      })
    : [];

  const hasHomeworkBlock = selectedLessonBlocks.some((block) => block.type === "HOMEWORK");
  const defaultLessonType =
    course.deliveryFormat === CourseDeliveryFormat.LIVE_COHORT ? LessonType.LIVE : LessonType.TEXT;
  const courseFormatLabel =
    course.deliveryFormat === CourseDeliveryFormat.LIVE_COHORT
      ? "онлайн-курс с вебинарами"
      : "курс в записи и материалах";

  return (
    <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto">
        <CourseStructureTree
          courseId={course.id}
          courseTitle={course.title}
          modules={course.modules}
          selectedModuleId={selectedModule?.id ?? null}
          selectedLessonId={selectedLesson?.id ?? null}
          createModuleAction={createModule}
          repositionLessonAction={repositionLesson}
          repositionModuleAction={repositionModule}
        />
        {selectedLesson ? (
          <>
            <EditableLessonSettingsCard
              formId="lesson-editor-form"
              title={selectedLesson.title}
              excerpt={selectedLesson.excerpt ?? ""}
              accessAfterDays={selectedLesson.accessAfterDays ?? null}
              isPreview={selectedLesson.isPreview}
              lessonImageUrl={selectedLesson.lessonImageUrl ?? ""}
            />
            {hasHomeworkBlock ? (
              <EditableHomeworkRulesCard
                formId="lesson-editor-form"
                initialState={{
                  requiresCuratorReview:
                    selectedLesson.homeworkAssignment?.requiresCuratorReview ?? true,
                  unlockNextModuleOnApproval:
                    selectedLesson.homeworkAssignment?.unlockNextModuleOnApproval ?? true,
                  allowTextSubmission:
                    selectedLesson.homeworkAssignment?.allowTextSubmission ?? true,
                  allowLinkSubmission:
                    selectedLesson.homeworkAssignment?.allowLinkSubmission ?? true,
                  allowFileUpload:
                    selectedLesson.homeworkAssignment?.allowFileUpload ?? true,
                }}
              />
            ) : null}
          </>
        ) : null}
      </aside>

      <div className="min-w-0 space-y-6">
        {!selectedModule ? (
          <EmptyStudio
            title="Создай первый модуль"
            description="Как только появится модуль, здесь откроется рабочая область курса и редактор уроков."
          />
        ) : (
          <>
            <EditableModulePanel
              courseId={course.id}
              moduleId={selectedModule.id}
              title={selectedModule.title}
              lessonsCount={selectedModule.lessons.length}
              defaultLessonType={defaultLessonType}
              courseFormatLabel={courseFormatLabel}
              updateModuleAction={updateModule}
              createLessonAction={createLesson}
            />

            {course.deliveryFormat === CourseDeliveryFormat.LIVE_COHORT ? (
              <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Формат курса
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  Онлайн-курс с вебинарами
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  Новые шаги программы по умолчанию создаются как вебинарные занятия. Расписание
                  ведем по часовому поясу{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {getTimezoneLabel(course.scheduleTimezone)}
                  </span>
                  , а после эфира в уроке можно оставить запись и материалы.
                </p>
              </article>
            ) : null}

            <div className="flex flex-wrap justify-between gap-3">
              {selectedLesson ? (
                <Button asChild variant="outline">
                  <Link href={`/learning/courses/${course.id}?lessonId=${selectedLesson.id}`}>
                    Проверить как студент
                  </Link>
                </Button>
              ) : (
                <span />
              )}

              <form action={deleteModule}>
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="moduleId" value={selectedModule.id} />
                <Button
                  type="submit"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить модуль
                </Button>
              </form>
            </div>

            {!selectedLesson ? (
              <EmptyStudio
                title={
                  defaultLessonType === LessonType.LIVE
                    ? "Добавь первый вебинар в модуль"
                    : "Добавь первый урок в модуль"
                }
                description={
                  defaultLessonType === LessonType.LIVE
                    ? "Новый шаг сразу создастся как вебинарное занятие. После эфира в урок можно будет добавить запись и материалы."
                    : "Урок откроется здесь же. Внутри можно собрать текст, видео, материалы и задание."
                }
              >
                <form action={createLesson} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <input type="hidden" name="moduleId" value={selectedModule.id} />
                  <input type="hidden" name="type" value={defaultLessonType} />
                  <Input
                    name="title"
                    placeholder={
                      defaultLessonType === LessonType.LIVE
                        ? "Например, Эфир 1: старт потока"
                        : "Например, Вводное занятие"
                    }
                    required
                  />
                  <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" />
                    {defaultLessonType === LessonType.LIVE ? "Добавить вебинар" : "Добавить урок"}
                  </Button>
                </form>
              </EmptyStudio>
            ) : (
              <>
                <form
                  id="lesson-editor-form"
                  action={updateLesson}
                >
                  <input type="hidden" name="lessonId" value={selectedLesson.id} />
                  <input type="hidden" name="moduleId" value={selectedModule.id} />
                  <input type="hidden" name="type" value={selectedLesson.type} />

                  <div className="space-y-6">
                    <article className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
                      <LessonBlockStudio
                        lessonId={selectedLesson.id}
                        initialBlocks={selectedLessonBlocks}
                        initialAsset={selectedLesson.videoAsset}
                        fallbackVideoSourceType={selectedLesson.videoSourceType}
                        fallbackVideoUrl={selectedLesson.videoUrl}
                        fallbackVideoPlaybackId={selectedLesson.videoPlaybackId}
                      />
                    </article>

                    <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-5 shadow-[var(--shadow-sm)]">
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить урок
                      </Button>

                      <Button asChild variant="outline">
                        <Link href={`/learning/courses/${course.id}?lessonId=${selectedLesson.id}`}>
                          Проверить как студент
                        </Link>
                      </Button>
                    </div>
                  </div>
                </form>

                <form action={deleteLesson} className="flex justify-end">
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="lessonId" value={selectedLesson.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить урок
                  </Button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
