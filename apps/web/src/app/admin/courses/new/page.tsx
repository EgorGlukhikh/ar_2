import { CourseStatus } from "@academy/db";

import { createCourse } from "@/features/admin/course-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewCoursePage() {
  return (
    <section className="space-y-6">
      <header className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          New Course
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Создать курс
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-[var(--muted)]">
          После создания курса ты сразу попадешь в детальную страницу, где можно
          добавить модули, уроки и доступы для студентов.
        </p>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" placeholder="osnovy-rieltorskogo-biznesa" />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Короткое описание программы, ценности курса и формата прохождения."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select id="status" name="status" defaultValue={CourseStatus.DRAFT}>
              {Object.values(CourseStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="submit">Создать курс</Button>
        </div>
      </form>
    </section>
  );
}
