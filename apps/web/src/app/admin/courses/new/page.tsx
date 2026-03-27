import { BookOpenText, CalendarClock, Eye, PlayCircle, Sparkles, Tv } from "lucide-react";
import { CourseDeliveryFormat, CourseStatus } from "@academy/db";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCourse } from "@/features/admin/course-actions";
import { requireCourseCreator } from "@/lib/admin";
import { courseStatusLabelMap } from "@/lib/labels";
import { TIMEZONE_OPTIONS } from "@/lib/timezones";

export default async function NewCoursePage() {
  await requireCourseCreator();

  return (
    <section className="space-y-6">
      <header className="grid gap-6 rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm xl:grid-cols-[1.08fr_0.92fr] xl:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Новый курс
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
            Создать курс
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--muted)]">
            Сначала фиксируем базу: кому курс нужен, в каком формате идет обучение и как
            называется программа. После сохранения откроется программа курса.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <BookOpenText className="h-5 w-5 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                Запись и материалы
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Классический курс: видео, тексты, файлы, задания и тесты.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <Tv className="h-5 w-5 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                Онлайн-поток
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Занятия живут как вебинары по МСК, а после встречи в уроке остается запись.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                Следующий шаг
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                После создания можно собрать модули, уроки, эфиры и материалы.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(160deg,_#eef3ff_0%,_#f8fbff_55%,_#ffffff_100%)] p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-sm">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                <PlayCircle className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Для ученика</p>
                <p className="text-sm text-[var(--muted)]">
                  Важно сразу понимать, он придет в записи или в живой поток.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-sm">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                <CalendarClock className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Для автора</p>
                <p className="text-sm text-[var(--muted)]">
                  Формат курса подсказывает, будут ли уроки обычными или привязанными ко времени.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-sm">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3">
                <Eye className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Публикация</p>
                <p className="text-sm text-[var(--muted)]">
                  Ссылка на курс сформируется автоматически по названию в латинице.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <form
        action={createCourse}
        className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm xl:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Название курса</Label>
            <Input
              id="title"
              name="title"
              placeholder="Например, Первая сделка в недвижимости"
              required
            />
            <p className="text-sm leading-6 text-[var(--muted)]">
              По этому названию система сама соберет человекочитаемый `slug` в латинице.
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
              Начни с черновика, чтобы собрать программу и материалы без спешки.
            </p>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Коротко опиши, для кого курс, какой результат он дает и в каком формате проходит обучение."
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryFormat">Формат курса</Label>
            <Select
              id="deliveryFormat"
              name="deliveryFormat"
              defaultValue={CourseDeliveryFormat.CLASSIC}
            >
              <option value={CourseDeliveryFormat.CLASSIC}>
                Курс в записи и материалах
              </option>
              <option value={CourseDeliveryFormat.LIVE_COHORT}>
                Онлайн-курс с вебинарами
              </option>
            </Select>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Для онлайн-потока уроки можно вести как эфиры, а после сохранять запись и материалы.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduleTimezone">Часовой пояс расписания</Label>
            <Select id="scheduleTimezone" name="scheduleTimezone" defaultValue="Europe/Moscow">
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </Select>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Для вебинарных курсов фиксируем расписание по МСК или другому выбранному поясу.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="structureMode">Структура курса</Label>
            <Select id="structureMode" name="structureMode" defaultValue="modules">
              <option value="modules">Курс делится на модули</option>
              <option value="single_module">Курс идет одним потоком</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstModuleTitle">Название первого модуля</Label>
            <Input
              id="firstModuleTitle"
              name="firstModuleTitle"
              placeholder="Например, Старт или Модуль 1"
            />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Если оставить пустым, для курса без модулей общий раздел получит название курса.
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

