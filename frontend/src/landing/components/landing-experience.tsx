"use client";

import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
  Tv,
} from "lucide-react";

import { MotionReveal } from "@/components/marketing/motion-reveal";
import {
  PublicButton,
  publicCardClassName,
  publicGradientCardClassName,
  publicIconBoxClassName,
  SectionLead,
} from "@/components/marketing/public-primitives";
import { PageContainer } from "@/components/layout/page-grid";
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
  if (mod10 === 1 && mod100 !== 11) return `${count} программа`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} программы`;
  return `${count} программ`;
}

export function LandingExperience({ publishedCourses, courses }: PublicHomePayload) {
  return (
    <div>

      {/* ─── STICKY HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/96 backdrop-blur-sm">
        <PageContainer className="flex h-16 items-center justify-between gap-4 py-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--foreground)] text-xs font-bold text-white">
              AR
            </div>
            <span className="hidden text-sm font-semibold text-[var(--foreground)] sm:block">
              Академия риэлторов
            </span>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/catalog"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Каталог
            </Link>
            <Link
              href="#formats"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Форматы
            </Link>
            <Link
              href="#how"
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Как это работает
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
            >
              Войти
            </Link>
            <PublicButton href="/catalog">
              <Copy value="Подобрать курс" />
            </PublicButton>
          </div>
        </PageContainer>
      </header>

      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="bg-[var(--foreground)] pb-20 pt-16">
        <PageContainer>
          <MotionReveal variant="soft" immediate>
            <div className="grid gap-12 xl:grid-cols-2 xl:items-center">

              {/* Left: text */}
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Обучение по недвижимости
                </span>

                <h1 className="max-w-[14ch] text-[clamp(2.6rem,5.8vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-white">
                  <Copy value="Закрывай сделки увереннее и учись без хаоса." />
                </h1>

                <p className="max-w-[44ch] text-[17px] leading-8 text-white/64">
                  <Copy value="Короткие практичные программы для риэлторов: записи, онлайн-потоки, задания, шаблоны и материалы в каждом уроке. Открыл курс, понял маршрут, пошел применять в работе." />
                </p>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href="/catalog">
                    <Copy value="Выбрать курс" />
                  </PublicButton>
                  <PublicButton href="/sign-in" tone="ghost">
                    <Copy value="Войти в кабинет" />
                  </PublicButton>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                  <div>
                    <p className="text-2xl font-bold text-white">{programsLabel(publishedCourses)}</p>
                    <p className="mt-1 text-[12px] leading-5 text-white/44">в каталоге</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">2</p>
                    <p className="mt-1 text-[12px] leading-5 text-white/44">формата обучения</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">100%</p>
                    <p className="mt-1 text-[12px] leading-5 text-white/44">материалов внутри</p>
                  </div>
                </div>
              </div>

              {/* Right: feature card */}
              <MotionReveal variant="right" immediate delay={120}>
                <div className={cn(publicGradientCardClassName)}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Что получает студент
                  </p>
                  <h2 className="mt-4 max-w-[22ch] text-2xl font-semibold leading-[1.08] tracking-[-0.02em] text-white">
                    <Copy value="Курс, материалы, задания и прогресс — в одном интерфейсе" />
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
                        text: "После выбора программы сразу понятно, что делать дальше и как перейти к учёбе.",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[var(--radius-md)] border border-white/12 bg-white/8 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-white">
                          <Copy value={item.title} />
                        </p>
                        <p className="mt-1 text-sm leading-6 text-white/70">
                          <Copy value={item.text} />
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <PublicButton href="/catalog" tone="ghost">
                      <Copy value="Открыть каталог" />
                    </PublicButton>
                  </div>
                </div>
              </MotionReveal>
            </div>
          </MotionReveal>
        </PageContainer>
      </section>

      {/* ─── TRUST STRIP ───────────────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-white py-10">
        <PageContainer>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((item, index) => (
              <MotionReveal key={item} variant="up" delay={index * 60}>
                <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    <Copy value={item} />
                  </p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ─── FOR WHOM ──────────────────────────────────────────────── */}
      <section className="bg-[var(--surface-alt)] py-20" id="value">
        <PageContainer>
          <div className="space-y-10">
            <SectionLead
              eyebrow="Для кого"
              title="Один продукт для старта, прокачки и запуска своей программы"
              text="Каждый сразу узнаёт свой сценарий: начать с базы, закрыть пробел перед сделкой или собрать собственный курс."
            />
            <div className="grid gap-5 md:grid-cols-3">
              {audienceCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <MotionReveal key={card.title} variant="up" delay={index * 80}>
                    <article className={cn(publicCardClassName, "h-full space-y-4")}>
                      <div className={publicIconBoxClassName}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold leading-7 tracking-[-0.02em] text-[var(--foreground)]">
                          <Copy value={card.title} />
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                          <Copy value={card.text} />
                        </p>
                      </div>
                    </article>
                  </MotionReveal>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ─── FORMATS ───────────────────────────────────────────────── */}
      <section className="bg-white py-20" id="formats">
        <PageContainer>
          <div className="grid gap-12 xl:grid-cols-2 xl:items-center">
            <SectionLead
              eyebrow="Форматы обучения"
              title="Два формата — один маршрут"
              text="Выбирай самостоятельный темп или живое расписание. В обоих форматах урок содержит всё необходимое: материалы, задание и следующий шаг."
            />
            <div className="grid gap-4">
              <MotionReveal variant="up" delay={80}>
                <article className={publicCardClassName}>
                  <div className="flex items-start gap-4">
                    <div className={cn(publicIconBoxClassName, "shrink-0")}>
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-7 text-[var(--foreground)]">
                        Курс в записи
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        Видео, текст, файлы и тесты. Ученик проходит в своём темпе и возвращается к материалам в любое время.
                      </p>
                    </div>
                  </div>
                </article>
              </MotionReveal>
              <MotionReveal variant="up" delay={140}>
                <article className={publicCardClassName}>
                  <div className="flex items-start gap-4">
                    <div className={cn(publicIconBoxClassName, "shrink-0")}>
                      <Tv className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-7 text-[var(--foreground)]">
                        Онлайн-поток
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        Занятия по расписанию. Запись эфира и материалы остаются в уроке после трансляции.
                      </p>
                    </div>
                  </div>
                </article>
              </MotionReveal>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="bg-[var(--surface-alt)] py-20" id="how">
        <PageContainer>
          <div className="space-y-12">
            <SectionLead
              eyebrow="Как это работает"
              title="Выбираешь программу, проходишь уроки и применяешь в сделке"
              text="Маршрут читается за несколько секунд: курс, уроки, задание, результат."
            />
            <div className="grid gap-6 md:grid-cols-3">
              {roleCopy.learn.steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <MotionReveal key={step.title} variant="up" delay={index * 80}>
                    <article className={cn(publicCardClassName, "h-full")}>
                      <div className="flex items-center gap-3">
                        <span className="min-w-[28px] text-[13px] font-bold tabular-nums tracking-wider text-[var(--muted)]">
                          0{index + 1}
                        </span>
                        <div className={publicIconBoxClassName}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold leading-7 text-[var(--foreground)]">
                        <Copy value={step.title} />
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        <Copy value={step.text} />
                      </p>
                    </article>
                  </MotionReveal>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ─── COURSES ───────────────────────────────────────────────── */}
      <section className="bg-white py-20" id="courses">
        <PageContainer>
          <div className="space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionLead
                eyebrow="Каталог"
                title="Выбирай программу под задачу сделки"
                text="В карточке курса сразу видно формат, объём, цену и чему научишься."
              />
              <PublicButton href="/catalog" tone="secondary">
                <Copy value="Все курсы" />
              </PublicButton>
            </div>
            <LandingCourseCarousel courses={courses} />
          </div>
        </PageContainer>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#1e285d] bg-[image:var(--brand-gradient)] py-20">
        <PageContainer>
          <MotionReveal variant="scale" delay={80}>
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-[560px] space-y-4">
                <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                  <Copy value="Выбери курс и начни с шага, который нужен тебе сейчас" />
                </h2>
                <p className="text-[16px] leading-8 text-white/72">
                  <Copy value="Открой каталог, посмотри форматы и начни с программы, которая даст понятный результат уже в ближайшей сделке." />
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <PublicButton href="/catalog">
                  <Copy value="Перейти в каталог" />
                </PublicButton>
              </div>
            </div>
          </MotionReveal>
        </PageContainer>
      </section>

    </div>
  );
}
