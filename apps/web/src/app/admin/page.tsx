import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Users,
} from "lucide-react";

import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CourseThumb,
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceStatCard,
} from "@/components/workspace/workspace-primitives";
import { getStudentAnalyticsSummary } from "@/features/analytics/service";
import { requireAdminUser } from "@/lib/admin";
import { courseStatusLabelMap, courseStatusVariantMap } from "@/lib/labels";

export default async function AdminPage() {
  await requireAdminUser();

  const [
    courseCount,
    studentCount,
    enrollmentCount,
    progressCount,
    recentCourses,
    analyticsSummary,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({
      where: {
        role: USER_ROLES.STUDENT,
      },
    }),
    prisma.enrollment.count(),
    prisma.lessonProgress.count(),
    prisma.course.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 4,
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
        modules: {
          select: {
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
    }),
    getStudentAnalyticsSummary(),
  ]);

  const stats = [
    {
      label: "Курсы",
      value: courseCount,
      hint: "Черновики, опубликованные программы и архив платформы.",
      icon: BookOpen,
    },
    {
      label: "Студенты",
      value: studentCount,
      hint: "Пользователи с доступом в обучение и личный кабинет.",
      icon: GraduationCap,
    },
    {
      label: "Зачисления",
      value: enrollmentCount,
      hint: "Выданные доступы к курсам и живые сценарии прохождения.",
      icon: Users,
    },
    {
      label: "Активности",
      value: progressCount,
      hint: "Зафиксированные прохождения уроков внутри курсов.",
      icon: LineChart,
    },
  ];

  return (
    <section className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Рабочий центр"
        title="Управление академией"
        description="Здесь команда создает курсы, собирает программу, назначает доступы, проверяет путь студента и контролирует, как продукт выглядит внутри платформы."
        meta={
          <div className="rounded-full bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Активных разделов: 5
          </div>
        }
        actions={
          <>
            <Button asChild>
              <Link href="/admin/courses/new">Создать курс</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/courses">Открыть все курсы</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <WorkspaceStatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <WorkspacePanel
          eyebrow="Последние обновления"
          title="Быстрый вход в работу с контентом"
          description="Открывай нужный курс сразу в рабочий раздел, а не через длинный маршрут."
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/courses">Все курсы</Link>
            </Button>
          }
        >
          {recentCourses.length === 0 ? (
            <WorkspaceEmptyState
              title="Пока нет ни одного курса"
              description="Создай первую программу. После этого здесь появятся рабочие карточки с быстрым переходом к структуре курса и доступам."
              action={
                <Button asChild>
                  <Link href="/admin/courses/new">Создать первый курс</Link>
                </Button>
              }
              className="border-[var(--border)] bg-[var(--surface)] shadow-none"
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {recentCourses.map((course) => {
                const lessonCount = course.modules.reduce(
                  (sum, module) => sum + module._count.lessons,
                  0,
                );

                return (
                  <article
                    key={course.id}
                    className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                  >
                    <div className="p-4">
                      <CourseThumb title={course.title} subtitle={`/${course.slug}`} compact />
                    </div>

                    <div className="space-y-4 px-5 pb-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={courseStatusVariantMap[course.status]}>
                          {courseStatusLabelMap[course.status]}
                        </Badge>
                        <Badge variant="neutral">Модулей {course._count.modules}</Badge>
                        <Badge variant="neutral">Уроков {lessonCount}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button asChild size="sm">
                          <Link href={`/admin/courses/${course.id}/content`}>Программа</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/courses/${course.id}/access`}>Доступы и продажи</Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </WorkspacePanel>

        <div className="space-y-6">
          <WorkspacePanel
            eyebrow="Навигация по продукту"
            title="Что уже можно показывать команде"
            description="Этот слой уже годится для наполнения курсами и передачи дизайнерам на следующий проход."
          >
            <div className="grid gap-3">
              {[
                "Лендинг, каталог и вход выглядят как единый публичный продукт.",
                "Редактор курса разделен на настройки, программу и доступы.",
                "Один урок поддерживает текст, видео и прикрепленный материал.",
                "Демо-оплата выдает доступ и проводит пользователя в обучение.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-[var(--muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Быстрые переходы"
            title="Проверка продукта целиком"
            description="Эти ссылки позволяют быстро пройти путь пользователя от витрины до учебного кабинета."
          >
            <div className="grid gap-3">
              <Button asChild variant="outline" className="justify-between">
                <Link href="/">
                  Главная платформа
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/catalog">
                  Каталог курсов
                  <BookOpen className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between">
                <Link href="/learning">
                  Учебный кабинет
                  <GraduationCap className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Аналитика студентов"
            title="Кто зашел в урок и где остановился"
            description="Поведенческий слой уже включен: система фиксирует открытия уроков, сигналы проигрывания и точку выхода студента."
            actions={
              <Button asChild variant="outline">
                <Link href="/admin/analytics">Открыть аналитику</Link>
              </Button>
            }
          >
            <div className="grid gap-3">
              {[
                `Всего зафиксированных сессий: ${analyticsSummary.totalSessions}.`,
                `Активных студентов за 7 дней: ${analyticsSummary.activeStudents}.`,
                `Сессий с ранним выходом: ${analyticsSummary.stalledSessions}.`,
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-[var(--muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </section>
  );
}
