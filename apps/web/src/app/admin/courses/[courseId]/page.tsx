import Link from "next/link";
import {
  CalendarClock,
  FileText,
  ShieldAlert,
  Sparkles,
  Tv,
} from "lucide-react";

import { TIMEZONE_OPTIONS } from "@/lib/timezones";
import { notFound } from "next/navigation";

import { CourseDeliveryFormat, CourseStatus, prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteCourse, updateCourse } from "@/features/admin/course-actions";
import { canEditCourseContent } from "@/lib/admin";
import { courseStatusLabelMap } from "@/lib/labels";
import { requireAdminViewer } from "@/lib/viewer";

type CourseSettingsPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

const deliveryFormatLabelMap: Record<CourseDeliveryFormat, string> = {
  CLASSIC: "Курс в записи и материалах",
  LIVE_COHORT: "Онлайн-курс с вебинарами",
};

export default async function CourseSettingsPage({
  params,
}: CourseSettingsPageProps) {
  const viewer = await requireAdminViewer();
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      status: true,
      deliveryFormat: true,
      scheduleTimezone: true,
      coverUrl: true,
      authorId: true,
    },
  });

  if (!course) {
    notFound();
  }

  if (!canEditCourseContent({ ...viewer.user, role: viewer.actualRole }, course.authorId)) {
    notFound();
  }

  const isAdmin = viewer.effectiveRole === USER_ROLES.ADMIN;
  const authors = isAdmin
    ? await prisma.user.findMany({
        where: {
          role: USER_ROLES.AUTHOR,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
    : [];

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <form
        action={updateCourse}
        className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="courseId" value={course.id} />
        {!isAdmin ? <input type="hidden" name="status" value={course.status} /> : null}

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Карточка курса
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Основная информация
          </h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Здесь задаются понятные для ученика и автора вещи: название курса, формат обучения,
            описание и автоматически собранный адрес страницы.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-[var(--primary)]" />
              <p className="text-sm font-semibold text-[var(--foreground)]">Карточка курса</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Название, описание и адрес страницы.
            </p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 shrink-0 text-[var(--primary)]" />
              <p className="text-sm font-semibold text-[var(--foreground)]">Формат обучения</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Записи и материалы или живой поток с вебинарами.
            </p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 shrink-0 text-[var(--primary)]" />
              <p className="text-sm font-semibold text-[var(--foreground)]">Публикация</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Статус публикации и продажи остаются у администратора.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="title">Название курса</Label>
            <Input id="title" name="title" defaultValue={course.title} required />
          </div>

          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Автоматический адрес
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">/{course.slug}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Пересчитывается автоматически из названия курса в латинице.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={course.description ?? ""}
              className="min-h-36"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverUrl">Обложка курса (URL изображения)</Label>
            <Input
              id="coverUrl"
              name="coverUrl"
              defaultValue={course.coverUrl ?? ""}
              placeholder="https://images.unsplash.com/photo-..."
            />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Вставь ссылку на изображение. Рекомендуемое соотношение 16:9. Отображается в шапке курса и каталоге.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deliveryFormat">Формат курса</Label>
              <Select id="deliveryFormat" name="deliveryFormat" defaultValue={course.deliveryFormat}>
                {Object.entries(deliveryFormatLabelMap).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleTimezone">Часовой пояс расписания</Label>
              <Select
                id="scheduleTimezone"
                name="scheduleTimezone"
                defaultValue={course.scheduleTimezone}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {isAdmin ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Статус публикации</Label>
                <Select id="status" name="status" defaultValue={course.status}>
                  {Object.values(CourseStatus).map((status) => (
                    <option key={status} value={status}>
                      {courseStatusLabelMap[status]}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorId">Автор курса</Label>
                <Select id="authorId" name="authorId" defaultValue={course.authorId ?? ""}>
                  <option value="">Не назначен</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name ? `${author.name} · ${author.email}` : author.email}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="submit">Сохранить изменения</Button>
          <Button asChild variant="outline">
            <Link href={`/admin/courses/${course.id}/content`}>Открыть программу</Link>
          </Button>
          {isAdmin ? (
            <Button asChild variant="outline">
              <Link href={`/admin/courses/${course.id}/access`}>Доступ и продажи</Link>
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-6">
        <article className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Что дальше
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Следующий рабочий шаг
          </h2>

          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
            <p>1. Проверь карточку и описание курса.</p>
            <p>2. Открой программу и собери модули, уроки, эфиры, записи и материалы.</p>
            <p>
              3. Формат курса сейчас:{" "}
              <span className="font-medium text-[var(--foreground)]">
                {deliveryFormatLabelMap[course.deliveryFormat]}
              </span>
              .
            </p>
            {course.deliveryFormat === CourseDeliveryFormat.LIVE_COHORT ? (
              <p className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                Вебинарные занятия фиксируются по выбранному часовому поясу. После эфира в уроке
                можно оставить запись и материалы.
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild>
              <Link href={`/admin/courses/${course.id}/content`}>Перейти к наполнению</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/learning/courses/${course.id}`}>Открыть как студент</Link>
            </Button>
          </div>
        </article>

        <article className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="inline-flex rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
            <CalendarClock className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
            Текущий формат курса
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {course.deliveryFormat === CourseDeliveryFormat.LIVE_COHORT
              ? "Курс идет как поток с онлайн-встречами. Для уроков можно использовать эфиры, а потом добавлять запись и материалы."
              : "Курс идет как классическая программа: видео, тексты, файлы, тесты и домашние задания."}
          </p>
        </article>

        {isAdmin ? (
          <form
            action={deleteCourse}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm"
          >
            <input type="hidden" name="courseId" value={course.id} />

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Опасная зона
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Удаление курса
            </h2>
            <div className="mt-4 inline-flex rounded-2xl bg-red-50 p-3 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Вместе с курсом удалятся модули, уроки, прогресс и доступы студентов. Используй
              этот сценарий только если курс действительно больше не нужен.
            </p>

            <div className="mt-8">
              <Button
                type="submit"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Удалить курс
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
