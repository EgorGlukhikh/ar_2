"use client";

import { ArrowRight, PlayCircle, ShieldCheck, Tv } from "lucide-react";
import Link from "next/link";

import { LandingCourseCarousel } from "./landing-course-carousel";

import {
  MetricChip,
  PublicButton,
  SectionLead,
  publicBadgeClassName,
  publicCardClassName,
  publicGradientCardClassName,
  publicIconBoxClassName,
} from "@/components/marketing/public-primitives";
import { MotionReveal } from "@/components/marketing/motion-reveal";
import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";
import {
  audienceCards,
  roleCopy,
  trustPoints,
} from "@shared/public-home/copy";
import type { PublicHomePayload } from "@shared/public-home/types";

function Copy({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatPublicCopy(value)}</span>;
}

function ProductPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
      <article className={publicGradientCardClassName}>
        <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-white/68">
          <Copy value="Что получает студент" />
        </p>
        <h2 className="mt-4 max-w-[13ch] text-[32px] font-semibold leading-10 tracking-[-0.02em] text-white">
          <Copy value="Курс, материалы, задания и прогресс живут в одном интерфейсе." />
        </h2>

        <div className="mt-6 grid gap-3">
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
              className="rounded-[16px] border border-white/15 bg-white/10 px-4 py-4"
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

      <div className="grid gap-4">
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
    </div>
  );
}

export function LandingExperience({
  publishedCourses,
  courses,
}: PublicHomePayload) {
  const authorCopy = roleCopy.author;

  return (
    <div className="space-y-16 md:space-y-20 lg:space-y-24">
      <MotionReveal variant="soft" immediate>
        <header className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.92)] px-5 py-5 shadow-[var(--shadow-sm)] backdrop-blur md:px-6 md:py-5">
          <div className="flex min-h-20 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--foreground)] text-sm font-semibold text-white">
                AR
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  <Copy value="Академия риэлторов" />
                </p>
                <p className="max-w-[540px] text-sm leading-6 text-[var(--muted)]">
                  <Copy value="Курсы по недвижимости для новичков, агентов и команд, которым нужен понятный учебный маршрут." />
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <nav className="hidden flex-wrap gap-6 text-base text-[var(--muted)] md:flex">
                <Link href="#value" className="transition hover:text-[var(--foreground)]">
                  <Copy value="Для кого" />
                </Link>
                <Link href="#flow" className="transition hover:text-[var(--foreground)]">
                  <Copy value="Как это работает" />
                </Link>
                <Link href="#courses" className="transition hover:text-[var(--foreground)]">
                  <Copy value="Курсы" />
                </Link>
              </nav>

              <div className="flex flex-wrap gap-3">
                <PublicButton href="/sign-in" tone="secondary">
                  <Copy value="Войти" />
                </PublicButton>
                <PublicButton href="/catalog">
                  <Copy value="Подобрать курс" />
                </PublicButton>
              </div>
            </div>
          </div>
        </header>
      </MotionReveal>

      <section className="grid gap-8 xl:grid-cols-2 xl:items-center">
        <MotionReveal variant="left" immediate delay={80} className="space-y-8">
          <div className={publicBadgeClassName}>
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
            <Copy value="Обучение по недвижимости в одном понятном месте" />
          </div>

          <div className="space-y-5">
            <h1 className="max-w-[11ch] text-[clamp(2.15rem,5vw,3.35rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--foreground)]">
              <Copy value="Закрывай сделки увереннее и учись без хаоса." />
            </h1>
            <p className="max-w-[560px] text-[16px] leading-7 text-[var(--muted)]">
              <Copy value="Короткие практичные программы для риэлторов: записи, онлайн-потоки, задания, шаблоны и материалы в каждом уроке. Открыл курс, понял маршрут, пошел применять в работе." />
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
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

          <div className="grid gap-4 md:grid-cols-3">
            <MetricChip label="В каталоге" value={`${publishedCourses} программы`} />
            <MetricChip label="Форматы" value="Записи и онлайн-потоки" />
            <MetricChip label="Внутри" value="Уроки, материалы и задания" />
          </div>
        </MotionReveal>

        <MotionReveal variant="right" immediate delay={140}>
          <ProductPreview />
        </MotionReveal>
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] md:p-8">
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustPoints.map((item, index) => (
            <MotionReveal key={item} variant="up" delay={index * 70}>
              <article className="flex items-start gap-3 rounded-[16px] bg-[var(--surface-strong)] p-4">
                <div className={cn(publicIconBoxClassName, "h-10 w-10 rounded-[var(--icon-radius-sm)]")}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  <Copy value={item} />
                </p>
              </article>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section id="value" className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
        <SectionLead
          eyebrow="Для кого"
          title="Один продукт для старта в профессии, прокачки навыка и запуска своей программы"
          text="Человек должен сразу узнать свой сценарий: начать с базы, быстро закрыть пробел перед сделкой или собрать собственный курс."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {audienceCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <MotionReveal key={card.title} variant="up" delay={index * 90} className="h-full">
                <article className={cn(publicCardClassName, "h-full")}>
                  <div className={publicIconBoxClassName}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--muted)]">
                    <Copy value={card.eyebrow} />
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[var(--foreground)]">
                    <Copy value={card.title} />
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                    <Copy value={card.text} />
                  </p>
                </article>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      <section
        id="flow"
        className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 shadow-[var(--shadow-sm)] md:p-8"
      >
        <div className="space-y-8">
          <SectionLead
            eyebrow="Как это работает"
            title="Выбираешь программу, проходишь уроки и применяешь в сделке"
            text="Маршрут читается за несколько секунд: курс, уроки, задание, результат."
          />

          <div className="grid gap-5 xl:grid-cols-[1fr_auto_1fr_auto_1fr] xl:items-stretch">
            {roleCopy.learn.steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <MotionReveal key={step.title} variant="up" delay={index * 90} className="contents">
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

                  {index < roleCopy.learn.steps.length - 1 ? (
                    <div className="hidden items-center justify-center xl:flex">
                      <div className="flex w-20 items-center gap-2 text-[var(--primary)]">
                        <div className="h-px flex-1 bg-[var(--primary)]/35" />
                        <ArrowRight className="h-4 w-4" />
                        <div className="h-px flex-1 bg-[var(--primary)]/35" />
                      </div>
                    </div>
                  ) : null}
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
        <SectionLead
          eyebrow="Для преподавателя"
          title="Собери программу как продукт, а не как папку со ссылками"
          text="Для автора и команды курса есть отдельный контур: структура программы, уроки, задания, студенты и база знаний по работе с курсом."
        />

        <MotionReveal variant="up">
          <article className={publicGradientCardClassName}>
            <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-white/68">
              <Copy value="Контур автора" />
            </p>
            <h3 className="mt-4 max-w-[14ch] text-[30px] font-semibold leading-9 tracking-[-0.02em] text-white">
              <Copy value={authorCopy.title} />
            </h3>
            <div className="mt-6 grid gap-3">
              {authorCopy.steps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-[16px] border border-white/15 bg-white/10 px-4 py-4"
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
              <PublicButton href="/sign-in?role=author" tone="secondary">
                <Copy value="Открыть кабинет автора" />
              </PublicButton>
            </div>
          </article>
        </MotionReveal>
      </section>

      <section id="courses" className="space-y-8">
        <SectionLead
          eyebrow="Каталог"
          title="Выбирай программу под задачу сделки"
          text="В карточке курса сразу видно формат, объем, цену и чему научишься. Если программ больше трех, подборку можно листать кнопками."
        />

        <LandingCourseCarousel courses={courses} />
      </section>

      <MotionReveal variant="scale" delay={80}>
        <section className="rounded-[28px] bg-[#1e285d] bg-[image:var(--brand-gradient)] bg-cover bg-center px-6 py-8 text-white shadow-[var(--shadow-brand)] md:px-8 md:py-12">
          <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
            <SectionLead
              eyebrow="Готовы начать?"
              title="Выбери курс и начни с шага, который нужен тебе сейчас"
              text="Открой каталог, посмотри форматы и начни с программы, которая даст понятный результат уже в ближайшей сделке."
              light
            />

            <div className="flex flex-col gap-3 sm:flex-row xl:items-end">
              <PublicButton href="/catalog" className="min-w-[220px]">
                <Copy value="Перейти в каталог" />
              </PublicButton>
              <PublicButton href="/sign-in?role=author" tone="ghost" className="min-w-[220px]">
                <Copy value="Для преподавателя" />
              </PublicButton>
            </div>
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
