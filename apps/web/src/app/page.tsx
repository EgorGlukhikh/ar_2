import { auth } from "@academy/auth";
import type { LucideIcon } from "lucide-react";
import {
  BadgeRussianRuble,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  GraduationCap,
  LayoutTemplate,
  MonitorPlay,
  PlayCircle,
  Sparkles,
  UploadCloud,
  Users,
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
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";

const useCases: Array<{
  title: string;
  text: string;
  image: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    title: "Учиться",
    text: "Студент проходит программу, открывает уроки по расписанию, смотрит видео и видит понятный маршрут обучения без перегруженного кабинета.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    icon: GraduationCap,
    tone: "from-[#fff1cb]/95 via-[#ffe7bf]/72 to-transparent",
  },
  {
    title: "Публиковать свои курсы",
    text: "Автор собирает структуру, загружает уроки, настраивает цену и выводит программу в каталог как полноценный продукт, а не как список файлов.",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1400&q=80",
    icon: UploadCloud,
    tone: "from-[#dceaff]/95 via-[#c6dbff]/72 to-transparent",
  },
  {
    title: "Проводить вебинары",
    text: "Запуски, эфиры, встречи с группой и продажа записи после события живут рядом с курсами и не требуют отдельного сервиса для каждого сценария.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    icon: Clapperboard,
    tone: "from-[#ffe2da]/95 via-[#ffd0c4]/70 to-transparent",
  },
];

const featuredCourses = [
  {
    title: "Старт в профессии риэлтора",
    meta: "12 уроков • практика с клиентом",
    price: "4 900 ₽",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Сильные продажи объектов",
    meta: "9 уроков • скрипты и переговоры",
    price: "7 500 ₽",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Система агентства",
    meta: "15 уроков • управление и команда",
    price: "12 000 ₽",
    image:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80",
  },
];

const creatorPoints = [
  "Собирать программу и уроки без помощи разработчика.",
  "Управлять ценой, каталогом и доступами к курсу из одного контура.",
  "Приглашать авторов, кураторов и менеджеров по продажам по ролям.",
];

const webinarPoints = [
  "Страница эфира с описанием, датой и ролями доступа.",
  "Материалы до и после эфира: конспекты, файлы и запись.",
  "Продажа доступа к записи после завершения события.",
];

const buildFlow = [
  {
    step: "01",
    title: "Собрать продукт",
    text: "Название, обложка, описание, программа и визуальная упаковка курса.",
  },
  {
    step: "02",
    title: "Запустить продажи",
    text: "Каталог, цена, checkout и выдача доступа после оплаты.",
  },
  {
    step: "03",
    title: "Масштабировать сценарий",
    text: "Авторы, кураторы, вебинары, сопровождение и повторные продажи.",
  },
];

const proofCards = [
  {
    title: "Для команды",
    text: "Админка и учебный кабинет должны ощущаться продолжением бренда, а не служебной панелью отдельно от лендинга.",
  },
  {
    title: "Для автора",
    text: "Важно не просто загрузить уроки, а превратить курс в продукт с ценой, витриной и понятным маршрутом для ученика.",
  },
  {
    title: "Для студента",
    text: "Пользователь должен видеть, что он купил, что уже прошел и куда перейти дальше без лишней когнитивной нагрузки.",
  },
];

const faqItems = [
  {
    question: "Можно ли использовать платформу только как витрину курсов?",
    answer:
      "Да. Каталог, карточки программ, доступы и checkout могут работать как отдельный контур даже без сложных учебных сценариев.",
  },
  {
    question: "Подходит ли платформа под приглашение авторов и кураторов?",
    answer:
      "Да. Архитектура уже разделена по ролям, а следующий слой развития как раз идет в сторону авторов, кураторов и проверки домашних заданий.",
  },
  {
    question: "Можно ли вырасти из курсов в вебинары и запуски?",
    answer:
      "Да. Один из главных замыслов платформы в том, чтобы не плодить отдельные сервисы, а держать курсы, эфиры и продажи в одном продукте.",
  },
  {
    question: "Платежи уже настоящие?",
    answer:
      "Пока checkout работает в demo-режиме для показа сценария. Реальные интеграции будут подключены поверх уже готового платежного слоя.",
  },
];

function SectionShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[38px] border border-white/70 bg-[rgba(255,255,255,0.8)] p-6 shadow-[0_30px_100px_rgba(44,40,84,0.08)] backdrop-blur md:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <header className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2442] text-sm font-semibold text-white">
                  AR
                </div>
                <div>
                  <p className="font-[family:var(--font-landing-display)] text-lg font-semibold">
                    Академия риэлторов
                  </p>
                  <p className="max-w-xs text-sm leading-6 text-[#667087]">
                    Обучение, свои курсы и вебинары внутри одного продукта.
                  </p>
                </div>
              </div>

              <nav className="hidden flex-wrap items-center gap-1 text-sm text-[#5f677c] md:flex">
                {[
                  ["#scenarios", "Возможности"],
                  ["#courses", "Курсы"],
                  ["#creators", "Авторы"],
                  ["#webinars", "Вебинары"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="rounded-full px-4 py-2 transition hover:bg-[#eef2ff] hover:text-[#1c2442]"
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

            <div className="grid gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#dce4fb] bg-white px-4 py-2 text-sm text-[#5f677c] shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#ff825f]" />
                  Одна платформа для обучения, продаж и живых запусков
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-3xl font-[family:var(--font-landing-display)] text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
                    Учиться, публиковать свои курсы и проводить вебинары в одном месте.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-[#596177]">
                    Платформа собирает каталог, checkout, учебный кабинет и авторский
                    контур в одну архитектуру. Это уже не набор экранов, а база для
                    школы, авторских программ и живых эфиров.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href="/catalog">Открыть каталог</PublicButton>
                  <PublicButton href="/sign-in" tone="secondary">
                    Открыть платформу
                  </PublicButton>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricChip label="Формат" value="Курсы + эфиры" />
                  <MetricChip label="Монетизация" value="Каталог + checkout" />
                  <MetricChip label="Роли" value="Админ, автор, студент" />
                </div>
              </div>

              <div className="relative min-h-[460px] lg:min-h-[560px]">
                <div className="absolute inset-0 rounded-[38px] bg-[linear-gradient(145deg,_#2037d2_0%,_#5a71ff_42%,_#ff8f6c_100%)] shadow-[0_45px_100px_rgba(64,76,173,0.34)]" />
                <div className="absolute inset-4 rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-md" />

                <div className="absolute left-1/2 top-1/2 h-[350px] w-[260px] -translate-x-1/2 -translate-y-[53%] overflow-hidden rounded-[32px] border border-white/30 shadow-[0_30px_80px_rgba(18,24,72,0.38)] md:h-[420px] md:w-[320px]">
                  <Image
                    src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80"
                    alt="Автор онлайн-курса"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(28,36,66,0.06)_0%,_rgba(28,36,66,0.76)_100%)]" />
                  <div className="absolute inset-x-4 bottom-4 rounded-[26px] border border-white/15 bg-white/14 p-4 text-white backdrop-blur-md md:inset-x-5 md:bottom-5 md:p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/65">
                      Сценарии платформы
                    </p>
                    <p className="mt-3 font-[family:var(--font-landing-display)] text-3xl font-semibold leading-none md:text-4xl">
                      От лендинга курса до вебинарной комнаты.
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/12 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/65">
                          студенты
                        </p>
                        <p className="mt-2 text-base font-semibold md:text-lg">
                          Личный кабинет
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/12 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/65">
                          авторы
                        </p>
                        <p className="mt-2 text-base font-semibold md:text-lg">
                          Загрузка и продажи
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute left-4 top-6 rounded-[24px] bg-white px-4 py-4 shadow-xl md:left-6 md:top-8">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#eef2ff] p-3">
                      <BookOpenText className="h-5 w-5 text-[#2940dd]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#697088]">Курсы</p>
                      <p className="font-semibold">Программы и траектории</p>
                    </div>
                  </div>
                </div>

                <div className="absolute right-4 top-16 rounded-[24px] bg-[#fff7f1] px-4 py-4 shadow-xl md:right-5 md:top-20">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3">
                      <WalletCards className="h-5 w-5 text-[#ff825f]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#7a6d65]">Продажи</p>
                      <p className="font-semibold">checkout и доступ</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-4 overflow-hidden rounded-[28px] border border-white/20 shadow-2xl md:bottom-10 md:left-6">
                  <Image
                    src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80"
                    alt="Рабочее место для эфира"
                    width={250}
                    height={180}
                    className="h-[150px] w-[190px] object-cover md:h-[170px] md:w-[250px]"
                  />
                </div>

                <div className="absolute bottom-5 right-4 rounded-[22px] bg-[#1c2442] px-4 py-3 text-white shadow-2xl md:bottom-7 md:right-7">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <PlayCircle className="h-4 w-4" />
                    Живой эфир открыт
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-black/5 bg-[linear-gradient(90deg,_#263bd6_0%,_#5970ff_46%,_#ff906f_100%)] p-4 text-white md:grid-cols-4">
              {[
                "Каталог курсов",
                "Кабинет студента",
                "Свои программы",
                "Вебинарные сценарии",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="scenarios" className="mt-16 space-y-8">
          <SectionLead
            eyebrow="Сценарии платформы"
            title="Один продукт под три понятные роли."
            text="Лендинг должен сразу объяснять, что платформой можно пользоваться как ученик, как автор курса и как организатор живых обучающих форматов."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {useCases.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_20px_55px_rgba(28,36,66,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(28,36,66,0.12)]"
                >
                  <div className="relative h-56">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.tone}`} />
                    <div className="absolute left-5 top-5 rounded-2xl bg-white/92 p-3 shadow-sm">
                      <Icon className="h-5 w-5 text-[#1c2442]" />
                    </div>
                  </div>
                  <div className="space-y-3 p-6">
                    <h3 className="text-2xl font-semibold">{item.title}</h3>
                    <p className="text-sm leading-7 text-[#596177]">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <SectionShell className="mt-16">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <SectionLead
                eyebrow="Каталог"
                title="Курс нужно продавать как продукт, а не как набор уроков."
                text="Карточка программы должна объяснять ценность, формат, цену и следующий шаг. Тогда каталог работает как витрина, а не как технический список."
              />

              <div className="space-y-3">
                {[
                  {
                    icon: LayoutTemplate,
                    title: "Визуальная упаковка",
                    text: "Обложка, описание и структура курса считываются мгновенно.",
                  },
                  {
                    icon: BadgeRussianRuble,
                    title: "Покупка доступа",
                    text: "Каталог и checkout ведут к оплате без лишних переходов и путаницы.",
                  },
                  {
                    icon: Users,
                    title: "Понятный маршрут",
                    text: "Пользователь понимает, что покупает и как будет проходить программу.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-[24px] border border-black/5 bg-white p-4 shadow-sm"
                    >
                      <div className="rounded-2xl bg-[#eef2ff] p-3">
                        <Icon className="h-5 w-5 text-[#2940dd]" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm leading-7 text-[#596177]">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div id="courses" className="grid gap-5 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <article
                  key={course.title}
                  className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(28,36,66,0.08)]"
                >
                  <div className="relative h-56">
                    <Image src={course.image} alt={course.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(23,31,80,0.05)_0%,_rgba(23,31,80,0.55)_100%)]" />
                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                      <span className="rounded-full bg-white/16 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                        premium
                      </span>
                      <span className="rounded-full bg-white/16 p-2 text-white backdrop-blur">
                        <BadgeRussianRuble className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="text-xl font-semibold">{course.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#596177]">{course.meta}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-3xl font-semibold">{course.price}</p>
                      <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1c2442]"
                      >
                        В каталог
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell className="mt-16">
          <SectionLead
            eyebrow="Как это растет"
            title="Сначала курс, потом продажи, потом большая учебная экосистема."
            text="У платформы должен быть понятный путь развития. Это важно не только для разработки, но и для того, как сам продукт воспринимается на первом экране."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {buildFlow.map((item) => (
              <article
                key={item.step}
                className="rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(28,36,66,0.06)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#7b8296]">
                  {item.step}
                </p>
                <h3 className="mt-5 text-2xl font-semibold text-[#1c2442]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#596177]">{item.text}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <section className="mt-16 grid gap-6 xl:grid-cols-2">
          <article
            id="creators"
            className="overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(160deg,_#18213d_0%,_#25346d_52%,_#3550ac_100%)] p-6 shadow-[0_36px_110px_rgba(26,32,72,0.2)] md:p-8"
          >
            <SectionLead
              eyebrow="Для авторов"
              title="Загрузить свою программу и превратить ее в продукт."
              text="Автору нужен не просто редактор уроков, а понятный путь от структуры курса до продаж и сопровождения студентов."
              light
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-3">
                {creatorPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/8 p-4"
                  >
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#ffd6be]" />
                    <p className="text-sm leading-7 text-white/82">{item}</p>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[340px] overflow-hidden rounded-[30px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <div className="absolute right-5 top-5 overflow-hidden rounded-[24px] shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"
                    alt="Автор курса"
                    width={220}
                    height={260}
                    className="h-[180px] w-[150px] object-cover md:h-[220px] md:w-[190px]"
                  />
                </div>
                <div className="absolute left-5 top-5 rounded-[24px] bg-white px-4 py-4 text-[#1c2442] shadow-xl">
                  <p className="text-sm text-[#697088]">Кабинет автора</p>
                  <p className="font-semibold">Редактор программы</p>
                </div>
                <div className="absolute bottom-5 left-5 right-5 space-y-3">
                  <div className="rounded-[24px] bg-white p-4 text-[#1c2442] shadow-lg">
                    <p className="font-semibold">Курс: Система агентства</p>
                    <p className="mt-2 text-sm leading-6 text-[#697088]">
                      Модули, уроки, цена, доступы и команда внутри одного сценария.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[22px] bg-white/10 p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                        продажа
                      </p>
                      <p className="mt-2 text-xl font-semibold">Каталог + checkout</p>
                    </div>
                    <div className="rounded-[22px] bg-white/10 p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                        команда
                      </p>
                      <p className="mt-2 text-xl font-semibold">Авторы и кураторы</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <SectionShell className="p-6 md:p-8">
            <div id="webinars">
              <SectionLead
                eyebrow="Вебинары"
                title="Ту же платформу можно использовать как базу для живых эфиров."
                text="Запуски, вебинары, разборы, созвоны с группой и продажа записи после события могут жить рядом с курсами, а не отдельно от них."
              />

              <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.92fr]">
                <div className="overflow-hidden rounded-[30px] border border-black/5 bg-[#f6f7ff] p-4 shadow-sm">
                  <div className="rounded-[26px] bg-[#1c2442] p-5 text-white">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/65">
                          live room
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                          Живой урок + чат + материалы
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <MonitorPlay className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-5 overflow-hidden rounded-[22px]">
                      <Image
                        src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80"
                        alt="Онлайн-вебинар"
                        width={900}
                        height={560}
                        className="h-52 w-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {webinarPoints.map((item) => (
                    <div
                      key={item}
                      className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-[#fff1ea] p-3">
                          <CalendarDays className="h-5 w-5 text-[#ff825f]" />
                        </div>
                        <p className="text-sm leading-7 text-[#596177]">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionShell>
        </section>

        <section className="mt-16 space-y-8">
          <SectionLead
            eyebrow="Почему это важно"
            title="Платформа должна восприниматься как сильный продукт с первого экрана."
            text="И лендинг, и следующие кабинеты должны создавать ощущение цельной академии с амбицией, а не временного MVP."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {proofCards.map((item, index) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(28,36,66,0.08)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#2840db_0%,_#ff8a67_100%)] text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="font-semibold text-[#1c2442]">{item.title}</p>
                </div>
                <p className="mt-5 text-sm leading-7 text-[#596177]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <SectionShell className="mt-16">
          <SectionLead
            eyebrow="FAQ"
            title="Нормальные вопросы до входа в продукт."
            text="Визуал должен вести к доверию, но продавать помогают понятные ответы на реальные вопросы команды, авторов и студентов."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_16px_45px_rgba(28,36,66,0.06)]"
              >
                <h3 className="text-xl font-semibold text-[#1c2442]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#596177]">{item.answer}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <section className="mt-16 rounded-[38px] border border-white/70 bg-[linear-gradient(135deg,_#18213d_0%,_#3146b6_48%,_#ff8f6d_100%)] p-8 text-white shadow-[0_38px_110px_rgba(34,40,88,0.22)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/60">
                Следующий шаг
              </p>
              <h2 className="font-[family:var(--font-landing-display)] text-4xl font-semibold tracking-tight md:text-5xl">
                Платформа уже может стать и школой, и витриной курсов, и базой для
                вебинаров.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/82">
                Дальше можно усиливать упаковку, маркетинг и продуктовые роли, не ломая
                уже собранный фундамент.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <PublicButton href="/catalog">Открыть каталог</PublicButton>
              <PublicButton href="/sign-in" tone="ghost">
                Войти в платформу
              </PublicButton>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
