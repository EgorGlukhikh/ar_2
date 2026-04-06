import { BookOpenText, Sparkles, Tv } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SystemInfoItem, systemIconTileClassName } from "@/components/system/system-ui";
import {
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/workspace/workspace-primitives";
import { createCourse } from "@/features/admin/course-actions";
import { CourseCreationOnboarding } from "@/features/admin/components/course-creation-onboarding";
import { requireCourseCreator } from "@/lib/admin";
import { TIMEZONE_OPTIONS } from "@/lib/timezones";

const COURSE_STATUS_DRAFT = "DRAFT";
const COURSE_DELIVERY_FORMAT_CLASSIC = "CLASSIC";
const COURSE_DELIVERY_FORMAT_LIVE_COHORT = "LIVE_COHORT";

const setupNotes = [
  {
    title: "Запись и материалы",
    description: "Классический курс: видео, тексты, файлы, задания и тесты.",
    icon: BookOpenText,
  },
  {
    title: "Онлайн-поток",
    description: "Занятия живут как вебинары по МСК, а после встречи в уроке остаётся запись.",
    icon: Tv,
  },
  {
    title: "Следующий шаг",
    description: "После создания можно собрать модули, уроки, эфиры и материалы.",
    icon: Sparkles,
  },
] as const;

export default async function NewCoursePage() {
  await requireCourseCreator();

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Новый курс"
        title="Создать курс"
        description="Сначала фиксируем базу: кому курс нужен, в каком формате идёт обучение и как называется программа. После сохранения откроется программа курса."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {setupNotes.map(({ title, description, icon: Icon }) => (
          <WorkspacePanel key={title} className="p-5">
            <div className={systemIconTileClassName}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 space-y-2">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
              <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          </WorkspacePanel>
        ))}
      </div>

      <CourseCreationOnboarding />

      <WorkspacePanel
        eyebrow="Параметры курса"
        title="Стартовые настройки"
        description="Курс создаётся как черновик. Когда программа будет готова, статус можно поменять уже в настройках курса."
      >
        <form action={createCourse}>
          <input type="hidden" name="status" value={COURSE_STATUS_DRAFT} />

          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <SystemInfoItem
              label="Для ученика"
              value="Важно сразу понимать, придёт он в записи или в живой поток."
            />
            <SystemInfoItem
              label="Для автора"
              value="Формат курса подсказывает, будут ли уроки обычными или привязанными ко времени."
            />
            <SystemInfoItem
              label="Публикация"
              value="Новый курс сохранится как черновик, а опубликовать его можно позже."
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div id="course-title-field" className="space-y-2">
              <Label htmlFor="title">Название курса</Label>
              <Input
                id="title"
                name="title"
                placeholder="Например, Первая сделка в недвижимости"
                required
              />
              <p className="text-sm leading-6 text-[var(--muted)]">
                По этому названию система сама соберёт человекочитаемый <code>slug</code> в
                латинице.
              </p>
            </div>

            <div id="course-topic-field" className="space-y-2">
              <Label htmlFor="topic">Тема курса</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="Например, Переговоры, безопасность, документы"
              />
              <p className="text-sm leading-6 text-[var(--muted)]">
                Тема помогает команде быстрее находить похожие программы в каталоге.
              </p>
            </div>

            <div id="course-description-field" className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Коротко опиши, для кого курс, какой результат он даёт и в каком формате проходит обучение."
                className="min-h-32"
              />
            </div>

            <div id="course-delivery-format-field" className="space-y-2">
              <Label htmlFor="deliveryFormat">Формат курса</Label>
              <Select
                id="deliveryFormat"
                name="deliveryFormat"
                defaultValue={COURSE_DELIVERY_FORMAT_CLASSIC}
              >
                <option value={COURSE_DELIVERY_FORMAT_CLASSIC}>Курс в записи и материалах</option>
                <option value={COURSE_DELIVERY_FORMAT_LIVE_COHORT}>
                  Онлайн-курс с вебинарами
                </option>
              </Select>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Для онлайн-потока уроки можно вести как эфиры, а после сохранять запись и
                материалы.
              </p>
            </div>

            <div id="course-tags-field" className="space-y-2">
              <Label htmlFor="tags">Теги</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="равный доступ, конфиденциальность, показы"
              />
              <p className="text-sm leading-6 text-[var(--muted)]">
                Пиши через запятую. Теги нужны для фильтров, группировки и будущей навигации.
              </p>
            </div>

            <div id="course-timezone-field" className="space-y-2">
              <Label htmlFor="scheduleTimezone">Часовой пояс расписания</Label>
              <Select id="scheduleTimezone" name="scheduleTimezone" defaultValue="Europe/Moscow">
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </Select>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Для вебинарных курсов фиксируем расписание по МСК или другому выбранному поясу.
              </p>
            </div>

            <div id="course-structure-mode-field" className="space-y-2">
              <Label htmlFor="structureMode">Структура курса</Label>
              <Select id="structureMode" name="structureMode" defaultValue="modules">
                <option value="modules">Курс делится на модули</option>
                <option value="single_module">Курс идёт одним потоком</option>
              </Select>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Для линейного сценария подойдёт один поток. Если внутри курса есть подтемы и
                уровни, лучше сразу раскладывать программу по модулям.
              </p>
            </div>

            <div id="course-first-module-field" className="space-y-2">
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
      </WorkspacePanel>
    </section>
  );
}
