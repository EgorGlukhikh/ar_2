import { auth } from "@academy/auth";
import { CourseStatus, prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";
import {
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  GraduationCap,
  LayoutPanelLeft,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  MetricChip,
  PublicButton,
  SectionLead,
} from "@/components/marketing/public-primitives";
import {
  getPublicCourseCover,
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";

const roleCards = [
  {
    eyebrow: "Автор",
    title: "Собирает и публикует свои программы",
    text: "Курсы, модули, уроки, тесты и материалы живут в одном рабочем контуре без хаоса между сервисами.",
    icon: LayoutPanelLeft,
  },
  {
    eyebrow: "Студент",
    title: "Проходит обучение без лишнего служебного шума",
    text: "Открывает программу, идет по маршруту уроков и видит только учебный путь, а не административные инструменты.",
    icon: GraduationCap,
  },
  {
    eyebrow: "Администратор",
    title: "Управляет системой, доступами и статистикой",
    text: "Видит каталог целиком, контролирует продажи, структуру, аналитику и качество наполнения академии.",
    icon: ShieldCheck,
  },
];

const processSteps = [
  {
    step: "01",
    title: "Собрать курс как продукт",
    text: "Название, программа, материалы, тесты, цена и публикация не разъезжаются по разным кабинетам.",
  },
  {
    step: "02",
    title: "Открыть каталог и продажи",
    text: "Платный и бесплатный доступ живут в одной витрине, поэтому демонстрация для автора выглядит цельно.",
  },
  {
    step: "03",
    title: "Довести студента до результата",
    text: "Учебный кабинет отрезан от лишних системных действий и остается ясным даже на длинных программах.",
  },
];

const qualityPoints = [
  "Единая платформа вместо набора разрозненных экранов.",
  "Роли разделены по логике продукта, а не только по правам.",
  "Курс воспринимается как продаваемый цифровой продукт, а не папка с файлами.",
];

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  const [publishedCourses, authorCount, studentCount, showcaseCourses] = await Promise.all([
    prisma.course.count({
      where: {
        status: CourseStatus.PUBLISHED,
      },
    }),
    prisma.user.count({
      where: {
        role: USER_ROLES.AUTHOR,
      },
    }),
    prisma.user.count({
      where: {
        role: USER_ROLES.STUDENT,
      },
    }),
    prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,_#182036_0%,_#2c4279_100%)] text-sm font-semibold text-white shadow-[0_16px_34px_rgba(24,32,54,0.2)]">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-lg font-semibold text-[#182036]">
                    Академия риэлторов
                  </p>
                  <p className="max-w-sm text-sm leading-6 text-[#5f6982]">
                    LMS-платформа для авторов, команды и студентов в недвижимости.
                  </p>
                </div>
              </div>

              <nav className="hidden flex-wrap items-center gap-1 rounded-full border border-white/80 bg-white/70 p-1 text-sm text-[#5f6982] shadow-[0_12px_30px_rgba(24,32,54,0.05)] md:flex">
                {[
                  ["#roles", "Роли"],
                  ["#courses", "Курсы"],
                  ["#process", "Процесс"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="rounded-full px-4 py-2 transition hover:bg-[#edf2ff] hover:text-[#182036]"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <div className="flex flex-wrap gap-3">
                <PublicButton href="/sign-in" tone="secondary">
                  Войти
                </PublicButton>
                <PublicButton href="/catalog">Смотреть курсы</PublicButton>
              </div>
            </header>

            <section className="grid gap-8 py-10 xl:grid-cols-[minmax(0,1.02fr)_minmax(460px,0.98fr)] xl:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e2d7c8] bg-[rgba(255,250,241,0.92)] px-4 py-2 text-sm font-medium text-[#7a6548] shadow-[0_12px_28px_rgba(24,32,54,0.05)]">
                  <Sparkles className="h-4 w-4 text-[#d27d45]" />
                  Спокойный и взрослый интерфейс для школы по недвижимости
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-[11ch] text-balance font-[family:var(--font-landing-display)] text-[clamp(3.2rem,6vw,6.3rem)] font-semibold leading-[0.9] tracking-tight text-[#182036]">
                    Курсы, роли и обучение внутри одного продукта.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-[#5f6982]">
                    Платформа уже разделяет авторский, учебный и административный контуры:
                    автор создает курсы, студент только учится, администратор управляет
                    системой и смотрит статистику.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href="/catalog">Открыть каталог</PublicButton>
                  <PublicButton href="/sign-in" tone="secondary">
                    Открыть платформу
                  </PublicButton>
                  <PublicButton href="/sign-in" tone="dark">
                    Показать кабинет автора
                  </PublicButton>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricChip label="Публикация" value={`${publishedCourses} программ`} />
                  <MetricChip label="Авторы" value={`${authorCount} аккаунтов`} />
                  <MetricChip label="Студенты" value={`${studentCount} профилей`} />
                </div>
              </div>

              <div className="relative min-h-[560px] overflow-hidden rounded-[38px] bg-[linear-gradient(145deg,_#182036_0%,_#2240a3_54%,_#f08f68_100%)] p-5 shadow-[0_42px_110px_rgba(24,32,54,0.24)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_34%)]" />
                <div className="relative grid h-full gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="flex flex-col justify-between rounded-[30px] border border-white/14 bg-white/10 p-5 text-white backdrop-blur-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/62">
                        Кабинет автора
                      </p>
                      <h2 className="mt-4 max-w-[10ch] font-[family:var(--font-landing-display)] text-4xl font-semibold leading-[0.94]">
                        Создавать курсы без ощущения админки из 2016 года.
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {qualityPoints.map((point) => (
                        <div
                          key={point}
                          className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/8 p-4"
                        >
                          <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#ffd7b5]" />
                          <p className="text-sm leading-7 text-white/84">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[28px] bg-[rgba(255,248,239,0.96)] p-5 text-[#182036] shadow-[0_22px_50px_rgba(24,32,54,0.16)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a6548]">
                        Маршрут продукта
                      </p>
                      <div className="mt-4 space-y-4">
                        {[
                          ["Автор", "Создает и публикует программы"],
                          ["Студент", "Видит только обучение и прогресс"],
                          ["Админ", "Контролирует систему и аналитику"],
                        ].map(([role, text]) => (
                          <div key={role} className="rounded-[22px] border border-[#ebe0d2] bg-white px-4 py-4">
                            <p className="text-sm font-semibold text-[#182036]">{role}</p>
                            <p className="mt-1 text-sm leading-6 text-[#5f6982]">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/14 bg-white/10 p-5 text-white backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/58">
                            Публичный слой
                          </p>
                          <p className="mt-2 text-2xl font-semibold">Каталог и продажи</p>
                        </div>
                        <WalletCards className="h-6 w-6 text-[#ffd7b5]" />
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/80">
                        Витрина должна смотреться как продукт для бизнеса в недвижимости, а не
                        как учебный шаблон.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="roles" className="space-y-8 border-t border-black/5 pt-10">
              <SectionLead
                eyebrow="Роли"
                title="Логика продукта уже разложена по настоящим сценариям."
                text="Автор наполняет программы, студент проходит обучение, администратор управляет системой, доступами и статистикой. Дальше дизайн должен только усиливать эту логику, а не запутывать ее."
              />

              <div className="grid gap-5 lg:grid-cols-3">
                {roleCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article
                      key={card.title}
                      className="rounded-[30px] border border-white/85 bg-[linear-gradient(180deg,_rgba(255,255,255,0.97)_0%,_rgba(249,250,253,0.94)_100%)] p-6 shadow-[0_20px_55px_rgba(24,32,54,0.07)]"
                    >
                      <div className="inline-flex rounded-[18px] bg-[linear-gradient(135deg,_rgba(38,80,216,0.16)_0%,_rgba(79,111,240,0.08)_100%)] p-3">
                        <Icon className="h-5 w-5 text-[#2650d8]" />
                      </div>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#7a6548]">
                        {card.eyebrow}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#182036]">
                        {card.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[#5f6982]">{card.text}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="courses" className="space-y-8 border-t border-black/5 pt-10">
              <SectionLead
                eyebrow="Каталог"
                title="Опубликованные программы должны выглядеть как линейка продуктов."
                text="Ниже уже не декоративные мокапы, а реальные курсы из текущей базы. Это важно: визуальная упаковка должна держаться на настоящем контенте."
              />

              <div className="grid gap-5 lg:grid-cols-3">
                {showcaseCourses.map((course, index) => {
                  const lessonCount = course.modules.reduce(
                    (sum, module) => sum + module.lessons.length,
                    0,
                  );

                  return (
                    <article
                      key={course.id}
                      className="overflow-hidden rounded-[32px] border border-white/85 bg-white shadow-[0_22px_60px_rgba(24,32,54,0.08)]"
                    >
                      <div className="relative h-64">
                        <Image
                          src={getPublicCourseCover(index)}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(24,32,54,0.06)_0%,_rgba(24,32,54,0.7)_100%)]" />
                        <div className="absolute left-5 top-5 rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                          {lessonCount} уроков
                        </div>
                      </div>

                      <div className="space-y-4 p-6">
                        <h3 className="text-[clamp(1.65rem,2.1vw,2.1rem)] font-semibold leading-[1.02] text-[#182036]">
                          {course.title}
                        </h3>
                        <p className="text-sm leading-7 text-[#5f6982]">
                          {course.description || "Описание курса будет добавлено в следующем проходе."}
                        </p>
                        <Link
                          href="/catalog"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#182036] transition hover:text-[#2650d8]"
                        >
                          Открыть карточку курса
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="process" className="grid gap-8 border-t border-black/5 pt-10 xl:grid-cols-[0.86fr_1.14fr]">
              <SectionLead
                eyebrow="Переход"
                title="Дальше продукт нужно не украшать, а дисциплинировать."
                text="Логика уже движется в правильную сторону: block-first уроки, разделение ролей, каталог как витрина. Следующий шаг — довести это до сильного визуального стандарта во всех основных экранах."
              />

              <div className="grid gap-4">
                {processSteps.map((item) => (
                  <article
                    key={item.step}
                    className="rounded-[28px] border border-white/85 bg-[rgba(255,255,255,0.94)] p-5 shadow-[0_16px_44px_rgba(24,32,54,0.06)]"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a6548]">
                          Шаг {item.step}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-[#182036]">
                          {item.title}
                        </h3>
                      </div>
                      <BookOpenText className="h-5 w-5 text-[#2650d8]" />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[#5f6982]">{item.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-[36px] bg-[linear-gradient(145deg,_#182036_0%,_#2240a3_52%,_#f08f68_100%)] p-8 text-white shadow-[0_34px_90px_rgba(24,32,54,0.2)] md:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/58">
                    Следующий шаг
                  </p>
                  <h2 className="font-[family:var(--font-landing-display)] text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl">
                    Показать автору и администратору продукт, который уже выглядит уверенно.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-white/82">
                    Внутри уже есть курсы, роли и учебный путь. Теперь визуальный слой начинает
                    соответствовать логике продукта, а не спорить с ней.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <PublicButton href="/catalog">Перейти в каталог</PublicButton>
                  <PublicButton href="/sign-in" tone="secondary">
                    Войти в платформу
                  </PublicButton>
                  <PublicButton href="/sign-in" tone="ghost">
                    Открыть кабинет автора
                  </PublicButton>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
