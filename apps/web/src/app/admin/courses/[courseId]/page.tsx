import Link from "next/link";
import { FileText, ShieldAlert, Sparkles, SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";

import { CourseStatus, prisma } from "@academy/db";
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
        className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
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
            {isAdmin
              ? "Здесь админ управляет карточкой курса, публикацией и назначением автора. Программу и уроки редактируй во вкладке «Программа»."
              : "Здесь автор заполняет карточку своего курса: название, адрес страницы и описание. Публикация и продажи остаются в контуре администратора."}
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              Карточка курса
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Название и описание видит вся команда платформы.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <SlidersHorizontal className="h-5 w-5 text-[var(--primary)]" />
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              Публикация
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {isAdmin
                ? "Админ решает, готов ли курс к публикации в каталоге."
                : `Текущий статус: ${courseStatusLabelMap[course.status]}. Этим управляет администратор.`}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              Ответственный автор
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {isAdmin
                ? "За автором можно закрепить курс и открыть ему реальный доступ в редактор."
                : "Курс уже закреплен за тобой, поэтому можно спокойно вести карточку и программу дальше."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="title">Название курса</Label>
            <Input id="title" name="title" defaultValue={course.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={course.slug} />
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
        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Следующие шаги
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Что делать дальше
          </h2>

          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
            <p>1. Проверь карточку курса и адрес страницы.</p>
            <p>2. Открой «Программу» и собери модули, уроки и материалы.</p>
            <p>
              3. {isAdmin
                ? "Когда курс готов, настрой доступ и продажи."
                : "Когда программа готова, передай админу курс на публикацию и настройку продаж."}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild>
              <Link href={`/admin/courses/${course.id}/content`}>Перейти к наполнению</Link>
            </Button>
            {isAdmin ? (
              <Button asChild variant="outline">
                <Link href={`/admin/courses/${course.id}/access`}>
                  Настроить доступ и цену
                </Link>
              </Button>
            ) : null}
          </div>
        </article>

        {isAdmin ? (
          <form
            action={deleteCourse}
            className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
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
              Вместе с курсом удалятся модули, уроки, прогресс и доступы студентов.
              Используй этот сценарий только если курс действительно больше не нужен.
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
