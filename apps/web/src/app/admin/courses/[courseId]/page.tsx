import Link from "next/link";
import { FileText, ShieldAlert, Sparkles, SlidersHorizontal } from "lucide-react";

import { CourseStatus, prisma } from "@academy/db";
import { notFound } from "next/navigation";

import { deleteCourse, updateCourse } from "@/features/admin/course-actions";
import { courseStatusLabelMap } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CourseSettingsPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseSettingsPage({
  params,
}: CourseSettingsPageProps) {
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
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <form
        action={updateCourse}
        className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="courseId" value={course.id} />

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Настройки курса
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Основная информация
          </h2>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Здесь меняются карточка курса, slug и статус публикации. Программу
            и уроки редактируй во вкладке «Программа».
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
              Статус определяет, виден курс в каталоге или еще собирается.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              Дальнейшая работа
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Наполнение и доступы вынесены в соседние вкладки.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="title">Название курса</Label>
            <Input id="title" name="title" defaultValue={course.title} required />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Используй понятное рабочее название, по которому курс легко найти
              в админке и каталоге.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={course.slug} />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Аккуратный адрес страницы курса. Его можно менять, если нужен
              более понятный URL.
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
            <p className="text-sm leading-6 text-[var(--muted)]">
              Коротко объясни, для кого курс и к какому результату он ведет.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус публикации</Label>
            <Select id="status" name="status" defaultValue={course.status}>
              {Object.values(CourseStatus).map((status) => (
                <option key={status} value={status}>
                  {courseStatusLabelMap[status]}
                </option>
              ))}
            </Select>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Черновик скрыт от каталога. Опубликованный курс можно продавать и
              выдавать студентам.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="submit">Сохранить изменения</Button>
          <Button asChild variant="outline">
            <Link href={`/admin/courses/${course.id}/content`}>
              Открыть программу
            </Link>
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        <article className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Следующие шаги
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Что обычно делают дальше
          </h2>

          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
            <p>1. Собирают модули и уроки во вкладке «Программа».</p>
            <p>2. Выставляют цену и настраивают доступ во вкладке «Доступ и продажи».</p>
            <p>3. После проверки переводят курс из черновика в опубликованный.</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild>
              <Link href={`/admin/courses/${course.id}/content`}>
                Перейти к наполнению
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/admin/courses/${course.id}/access`}>
                Настроить доступ и цену
              </Link>
            </Button>
          </div>
        </article>

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
      </div>
    </section>
  );
}
