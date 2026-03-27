"use client";

import { BookOpen, GraduationCap, PlayCircle, ShieldCheck, Tv } from "lucide-react";

import { SiteIllustration } from "@/components/illustrations/site-illustration";
import {
  CardGrid,
  GridSection,
  PageGrid,
  SectionLead as LayoutSectionLead,
  SectionShell,
  SectionVisual,
} from "@/components/layout/page-grid";
import { MotionReveal } from "@/components/marketing/motion-reveal";
import {
  MetricChip,
  PublicButton,
  publicBadgeClassName,
  publicCardClassName,
  publicGradientCardClassName,
  publicIconBoxClassName,
} from "@/components/marketing/public-primitives";
import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";
import { audienceCards, roleCopy, trustPoints } from "@shared/public-home/copy";
import type { PublicHomePayload } from "@shared/public-home/types";

import { LandingCourseCarousel } from "./landing-course-carousel";

function Copy({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatPublicCopy(value)}</span>;
}

function programsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} программа`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} программы`;
  }

  return `${count} программ`;
}

function ProductPreview() {
  return (
    <PageGrid className="items-stretch">
      <article className={cn(publicGradientCardClassName, "xl:col-span-7")}>
        <p className="text-[12px] font-semibold uppercase leading-4 tracking-[0.18em] text-white/68">
          <Copy value="Что получает студент" />
        </p>
        <h2 className="mt-4 max-w-[15ch] text-[clamp(2rem,3.1vw,2.6rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-white">
          <Copy value="Курс, материалы, задания и прогресс живут в одном интерфейсе." />
        </h2>

        <div className="mt-7 grid gap-3">
          {[
            {
              title: "Маршрут обучения",
              text: "Каталог, карточка курса, уроки и прогресс читаются без лишнего служебного шума.",
            },
            {
              title: "Наполнение урока",
              text: "Видео, текст, файлы и задания остаются внутри урока и не теряются по дороге.",
            },
            {
              title: "Следующий шаг",
              text: "После выбора программы сразу понятно, что делать дальше и как перейти к учебе.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-md)] border border-white/15 bg-white/10 px-4 py-4"
            >
              <p className="text-sm font-semibold text-white">
                <Copy value={item.title} />
              </p>
              <p className="mt-2 text-sm leading-6 text-white/84">
                <Copy value={item.text} />
              </p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4 xl:col-span-5">
        <article className={publicCardClassName}>
          <div className={publicIconBoxClassName}>
            <PlayCircle className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
            <Copy value="Курс в записи" />
          </h3>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            <Copy value="Видео, текст, файлы и тесты. Ученик проходит программу в своем темпе и возвращается к урокам, когда нужно." />
          </p>
        </article>

        <article className={publicCardClassName}>
          <div className={publicIconBoxClassName}>
            <Tv className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
            <Copy value="Онлайн-поток" />
          </h3>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            <Copy value="Занятия по расписанию, а после эфира запись, материалы и домашка остаются в том же уроке." />
          </p>
        </article>
      </div>
    </PageGrid>
  );
}

export function LandingExperience({
  publishedCourses,
  courses,
}: PublicHomePayload) {
  return (
    <div className="space-y-16 md:space-y-20 lg:space-y-[var(--section-gap)]">
      <MotionReveal variant="soft" immediate>
        <header className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[rgba(255,255,255,0.92)] px-6 py-6 shadow-[var(--shadow-sm)] backdrop-blur md:px-8 md:py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--foreground)] text-sm font-semibold text-white">
                AR
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  <Copy value="Академия риэлторов" />
                </p>
                <p className="max-w-[560px] text-sm leading-6 text-[var(--muted)]">
                  <Copy value="Курсы по недвижимости для новичков, агентов и команд, которым нужен понятный учебный маршрут." />
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <PublicButton href="/sign-in" tone="secondary">
                <Copy value="Войти" />
              </PublicButton>
              <PublicButton href="/catalog">
                <Copy value="Подобрать курс" />
              </PublicButton>
            </div>
          </div>
        </header>
      </MotionReveal>

      <GridSection>
        <PageGrid className="items-start">
          <MotionReveal variant="left" immediate delay={80} className="space-y-8 xl:col-span-6">
            <div className={publicBadgeClassName}>
              <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
              <Copy value="Обучение по недвижимости в одном понятном месте" />
            </div>

            <div className="space-y-6">
              <h1 className="max-w-[12ch] text-[clamp(2.55rem,5.4vw,4.6rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-[var(--foreground)]">
                <Copy value="Закрывай сделки увереннее и учись без хаоса." />
              </h1>
              <p className="max-w-[var(--content-max)] text-[17px] leading-8 text-[var(--muted)]">
                <Copy value="Короткие практичные программы для риэлторов: записи, онлайн-потоки, задания, шаблоны и материалы в каждом уроке. Открыл курс, понял маршрут, пошел применять в работе." />
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <div className="space-y-3">
                <PublicButton href="/catalog" className="w-full justify-center sm:w-auto">
                  <Copy value="Выбрать курс" />
                </PublicButton>
                <p className="max-w-[260px] text-sm leading-6 text-[var(--muted)]">
                  <Copy value="Есть бесплатные программы. Каталог можно посмотреть без регистрации." />
                </p>
              </div>

              <div className="space-y-3">
                <PublicButton
                  href="/sign-in?role=author"
                  tone="secondary"
                  className="w-full justify-center sm:w-auto"
                >
                  <Copy value="Для преподавателя" />
                </PublicButton>
                <p className="max-w-[260px] text-sm leading-6 text-[var(--muted)]">
                  <Copy value="Отдельный вход для автора и команды курса." />
                </p>
              </div>
            </div>

            <CardGrid columns="3">
              <MetricChip label="В каталоге" value={programsLabel(publishedCourses)} />
              <MetricChip label="Форматы" value="Записи и онлайн-потоки" />
              <MetricChip label="Внутри" value="Уроки, материалы и задания" />
            </CardGrid>
          </MotionReveal>

          <MotionReveal variant="right" immediate delay={140} className="xl:col-span-6">
            <SectionVisual>
              <ProductPreview />
            </SectionVisual>
          </MotionReveal>
        </PageGrid>
      </GridSection>

      <SectionShell>
        <CardGrid columns="4">
          {trustPoints.map((item, index) => (
            <MotionReveal key={item} variant="up" delay={index * 70}>
              <article className="flex h-full items-start gap-3 rounded-[var(--radius-md)] bg-[var(--surface-alt)] p-4">
                <div className={cn(publicIconBoxClassName, "h-10 w-10 rounded-[var(--icon-radius-sm)]")}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  <Copy value={item} />
                </p>
              </article>
            </MotionReveal>
          ))}
        </CardGrid>
      </SectionShell>

      <GridSection id="value">
        <PageGrid className="items-start">
          <div className="xl:col-span-4">
            <LayoutSectionLead
              eyebrow="Для кого"
              title="Один продукт для старта в профессии, прокачки навыка и запуска своей программы"
              description="Человек должен сразу узнать свой сценарий: начать с базы, быстро закрыть пробел перед сделкой или собрать собственный курс."
            />
          </div>

          <div className="xl:col-span-8">
            <div className="grid gap-6 md:grid-cols-2">
              {audienceCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <MotionReveal key={card.title} variant="up" delay={index * 90}>
                    <article className={cn(publicCardClassName, "h-full")}>
                      <div className={publicIconBoxClassName}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                        <Copy value={card.eyebrow} />
                      </p>
                      <h3 className="mt-3 max-w-[18ch] text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                        <Copy value={card.title} />
                      </h3>
                      <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                        <Copy value={card.text} />
                      </p>
                    </article>
                  </MotionReveal>
                );
              })}

              <MotionReveal variant="scale" delay={240}>
                <SiteIllustration
                  kind="onlineLearning"
                  alt="Иллюстрация учебной платформы"
                  className="h-full"
                  imageClassName="scale-[0.98]"
                />
              </MotionReveal>
            </div>
          </div>
        </PageGrid>
      </GridSection>

      <SectionShell id="flow" className="bg-[var(--surface-alt)]">
        <div className="space-y-10">
          <LayoutSectionLead
            eyebrow="Как это работает"
            title="Выбираешь программу, проходишь уроки и применяешь в сделке"
            description="Маршрут читается за несколько секунд: курс, уроки, задание, результат."
          />

          <CardGrid columns="3">
            {roleCopy.learn.steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <MotionReveal key={step.title} variant="up" delay={index * 90}>
                  <article className={cn(publicCardClassName, "h-full")}>
                    <div className="flex items-center justify-between gap-4">
                      <div className={publicIconBoxClassName}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-[var(--muted)]">0{index + 1}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold leading-7 text-[var(--foreground)]">
                      <Copy value={step.title} />
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                      <Copy value={step.text} />
                    </p>
                  </article>
                </MotionReveal>
              );
            })}
          </CardGrid>
        </div>
      </SectionShell>

      <GridSection>
        <PageGrid className="items-start">
          <div className="xl:col-span-4">
            <LayoutSectionLead
              eyebrow="Учебный кабинет"
              title="Весь маршрут виден с первого экрана и не требует объяснений"
              description="После покупки курс открывается в личном кабинете: уроки по порядку, материалы к каждому занятию, задания и прогресс без внешних ссылок и чатов."
            />
          </div>

          <div className="xl:col-span-8">
            <PageGrid className="items-stretch">
              <MotionReveal variant="up" className="xl:col-span-7">
                <article className={publicGradientCardClassName}>
                  <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-white/68">
                    <Copy value="Кабинет студента" />
                  </p>
                  <h3 className="mt-4 max-w-[14ch] text-[clamp(1.8rem,3vw,2.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                    <Copy value="Открыл курс — сразу ясно, что делать дальше" />
                  </h3>
                  <div className="mt-6 grid gap-3">
                    {[
                      {
                        title: "Уроки по порядку",
                        text: "Структура курса видна сразу: текущий урок, пройденные занятия и то, что впереди.",
                      },
                      {
                        title: "Материалы внутри урока",
                        text: "Видео, текст, файлы и задание живут в одном месте и не теряются.",
                      },
                      {
                        title: "Домашнее задание",
                        text: "Куратор получает сдачу, возвращает с комментарием или принимает. Статус всегда виден студенту.",
                      },
                    ].map((step) => (
                      <div
                        key={step.title}
                        className="rounded-[var(--radius-md)] border border-white/15 bg-white/10 px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-white">
                          <Copy value={step.title} />
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/84">
                          <Copy value={step.text} />
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <PublicButton href="/catalog">
                      <Copy value="Выбрать курс" />
                    </PublicButton>
                  </div>
                </article>
              </MotionReveal>

              <div className="grid gap-4 xl:col-span-5">
                <MotionReveal variant="scale" delay={80}>
                  <SiteIllustration
                    kind="bookReading"
                    alt="Иллюстрация учебного кабинета"
                    className="h-full"
                  />
                </MotionReveal>
                <MotionReveal variant="up" delay={120}>
                  <article className={publicCardClassName}>
                    <div className={publicIconBoxClassName}>
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold leading-7 text-[var(--foreground)]">
                      <Copy value="Прогресс по программе" />
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                      <Copy value="Кабинет показывает, какой модуль сейчас и что нужно сделать до перехода к следующему блоку." />
                    </p>
                  </article>
                </MotionReveal>
              </div>
            </PageGrid>
          </div>
        </PageGrid>
      </GridSection>

      <GridSection id="courses">
        <PageGrid className="items-end">
          <div className="xl:col-span-4">
            <LayoutSectionLead
              eyebrow="Каталог"
              title="Выбирай программу под задачу сделки"
              description="В карточке курса сразу видно формат, объем, цену и чему научишься. Если программ больше трех, подборку можно листать кнопками."
            />
          </div>
          <div className="xl:col-span-8">
            <SectionShell className="bg-[var(--surface-alt)]">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  "Карточка курса сразу показывает формат, цену и уровень входа.",
                  "Узкие карточки не используются: если места мало, сетка упрощается.",
                  "Переход к программе читается как следующий шаг, а не как вторичный линк.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--foreground)]"
                  >
                    <Copy value={item} />
                  </div>
                ))}
              </div>
            </SectionShell>
          </div>
        </PageGrid>

        <LandingCourseCarousel courses={courses} />
      </GridSection>

      <MotionReveal variant="scale" delay={80}>
        <section className="rounded-[28px] bg-[#1e285d] bg-[image:var(--brand-gradient)] bg-cover bg-center px-6 py-8 text-white shadow-[var(--shadow-brand)] md:px-8 md:py-12">
          <PageGrid className="items-end">
            <div className="xl:col-span-8">
              <LayoutSectionLead
                eyebrow="Готовы начать?"
                title="Выбери курс и начни с шага, который нужен тебе сейчас"
                description="Открой каталог, посмотри форматы и начни с программы, которая даст понятный результат уже в ближайшей сделке."
                light
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:col-span-4 xl:justify-end">
              <PublicButton href="/catalog" className="justify-center">
                <Copy value="Перейти в каталог" />
              </PublicButton>
              <PublicButton href="/sign-in?role=author" tone="ghost" className="justify-center">
                <Copy value="Для преподавателя" />
              </PublicButton>
            </div>
          </PageGrid>
        </section>
      </MotionReveal>
    </div>
  );
}
