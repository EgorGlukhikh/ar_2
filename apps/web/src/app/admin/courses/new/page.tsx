import { BookOpenText, Eye, Link2, Sparkles, Target } from "lucide-react";
import { CourseStatus } from "@academy/db";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCourse } from "@/features/admin/course-actions";
import { requireCourseCreator } from "@/lib/admin";
import { courseStatusLabelMap } from "@/lib/labels";

export default async function NewCoursePage() {
  await requireCourseCreator();

  return (
    <section className="space-y-6">
      <header className="grid gap-6 rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Новый курс
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
            Создать курс
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--muted)]">
            На этом шаге создается карточка курса. После сохранения ты сразу попадешь во вкладку
            программы, где можно собирать модули и уроки.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <BookOpenText className="h-5 w-5 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                Карточка курса
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Заполняем базовую информацию, которая описывает курс.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <Target className="h-5 w-5 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                Структура
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Сразу решаем, делится ли курс на модули или идет как единый поток уроков.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                Следующий шаг
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                После сохранения откроется программа курса и редактор уроков.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[linear-gradient(160deg,_#eef3ff_0%,_#f8fbff_55%,_#ffffff_100%)] p-6">
          <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-[var(--primary-soft)] blur-2xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                <BookOpenText className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Название и описание
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Чтобы курс было легко найти и понять.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                <Link2 className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Ссылка курса</p>
                <p className="text-sm text-[var(--muted)]">
                  Slug нужен для аккуратного адреса страницы.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                <Eye className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Статус публикации
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Курс можно сначала собрать в черновике, а опубликовать позже.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <form
        action={createCourse}
        className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Название курса</Label>
            <Input
              id="title"
              name="title"
              placeholder="Например, Основы риэлторского бизнеса"
              required
            />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Это основное имя курса. Его увидят администраторы, авторы и студенты.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" placeholder="osnovy-rieltorskogo-biznesa" />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Техническая часть ссылки. Если оставить пустым, система соберет ее автоматически.
            </p>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Коротко опиши результат курса, аудиторию и формат прохождения."
              className="min-h-32"
            />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Помогает быстро понять, для кого курс и какой результат должен получить ученик.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select id="status" name="status" defaultValue={CourseStatus.DRAFT}>
              {Object.values(CourseStatus).map((status) => (
                <option key={status} value={status}>
                  {courseStatusLabelMap[status]}
                </option>
              ))}
            </Select>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Начни с черновика, чтобы спокойно собрать программу, и переведи в опубликованный
              статус, когда курс будет готов.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="structureMode">Структура курса</Label>
            <Select id="structureMode" name="structureMode" defaultValue="modules">
              <option value="modules">Курс делится на модули</option>
              <option value="single_module">Курс идет без модулей</option>
            </Select>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Если курс без модулей, мы сразу создадим общий модуль с уроками внутри.
            </p>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="firstModuleTitle">Название первого модуля</Label>
            <Input
              id="firstModuleTitle"
              name="firstModuleTitle"
              placeholder="Например, Модуль 1 или Основной раздел курса"
            />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Если оставить пустым, для обычного курса первый модуль можно будет добавить позже, а
              для курса без модулей мы назовем общий модуль так же, как сам курс.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="submit">Создать курс</Button>
        </div>
      </form>
    </section>
  );
}
