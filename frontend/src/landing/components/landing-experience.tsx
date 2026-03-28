"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Layers,
  LayoutList,
  MonitorPlay,
  PlayCircle,
  ShieldCheck,
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
import { roleCopy, trustPoints } from "@shared/public-home/copy";
import type { PublicHomePayload } from "@shared/public-home/types";

import { LandingCourseCarousel } from "./landing-course-carousel";

function Copy({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatPublicCopy(value)}</span>;
}

function StatCounter({
  target,
  label,
  formatValue,
}: {
  target: number;
  label: string;
  formatValue?: (n: number) => string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 40;
          const duration = 1000;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref}>
      <p className="text-2xl font-bold text-white">
        {formatValue ? formatValue(count) : count}
      </p>
      <p className="mt-1 text-[12px] leading-5 text-white/44">{label}</p>
    </div>
  );
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
      <section className="relative overflow-hidden bg-[var(--foreground)] pb-20 pt-16">
        {/* Aurora orbs */}
        <div className="aurora-orb aurora-orb-1" aria-hidden />
        <div className="aurora-orb aurora-orb-2" aria-hidden />
        <div className="aurora-orb aurora-orb-3" aria-hidden />
        <PageContainer className="relative z-10">
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
                  <StatCounter
                    target={publishedCourses}
                    label="в каталоге"
                    formatValue={programsLabel}
                  />
                  <StatCounter
                    target={2}
                    label="формата обучения"
                  />
                  <StatCounter
                    target={100}
                    label="материалов внутри"
                    formatValue={(n) => `${n}%`}
                  />
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
      {(() => {
        const trustCards = [
          { Icon: ClipboardCheck, text: trustPoints[0] },
          { Icon: Layers,         text: trustPoints[1] },
          { Icon: MonitorPlay,    text: trustPoints[2] },
          { Icon: LayoutList,     text: trustPoints[3] },
        ] as const;
        return (
          <section className="border-b border-[var(--border)] bg-[var(--surface-strong)] py-8 md:py-10">
            <PageContainer>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
                {trustCards.map(({ Icon, text }, index) => (
                  <MotionReveal key={text} variant="up" delay={index * 60} className="h-full">
                    <div className="flex h-full cursor-default flex-col items-center text-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-soft)]">
                        <Icon className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <p className="text-sm leading-6 text-[var(--foreground)]">
                        <Copy value={text} />
                      </p>
                    </div>
                  </MotionReveal>
                ))}
              </div>
            </PageContainer>
          </section>
        );
      })()}

      {/* ─── VALUE BENTO ─────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-20" id="value">
        <PageContainer>
          <div className="space-y-5">
            {/* Top row: 3 large accent cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <MotionReveal variant="up" delay={0}>
                <article className="flex min-h-[220px] cursor-default flex-col rounded-[var(--radius-lg)] border border-white/8 bg-[var(--foreground)] p-6 shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-1.5 hover:scale-[1.03]">
                  <h3 className="text-xl font-semibold leading-7 tracking-[-0.02em] text-white">
                    Войти в профессию без хаоса и месяцев блужданий
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">
                    Структурированный маршрут с первого дня: программа, уроки, шаблоны и задания в нужном порядке.
                  </p>
                </article>
              </MotionReveal>
              <MotionReveal variant="up" delay={80}>
                <article className="flex min-h-[220px] cursor-default flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-strong)] p-6 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1.5 hover:scale-[1.03]">
                  <h3 className="text-xl font-semibold leading-7 tracking-[-0.02em] text-[var(--foreground)]">
                    Закрыть конкретный пробел перед сделкой
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    Короткие программы под задачу. Выбрал тему — прошёл уроки — применил на следующей встрече с клиентом.
                  </p>
                </article>
              </MotionReveal>
              <MotionReveal variant="up" delay={160}>
                <article className="flex min-h-[220px] cursor-default flex-col rounded-[var(--radius-lg)] border border-indigo-500/20 bg-[var(--primary)] p-6 shadow-[var(--shadow-brand)] transition-all duration-200 hover:-translate-y-1.5 hover:scale-[1.03]">
                  <h3 className="text-xl font-semibold leading-7 tracking-[-0.02em] text-white">
                    Запустить свой курс и вести учеников в системе
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    Записываешь программу или открываешь поток — платформа ведёт учеников по урокам и собирает прогресс.
                  </p>
                </article>
              </MotionReveal>
            </div>

            {/* Bottom row: 3 feature cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "Материалы в каждом уроке",
                  text: "Видео, файлы и задания всегда под рукой — не нужно искать по чатам и папкам.",
                },
                {
                  icon: PlayCircle,
                  title: "Запись или живой поток",
                  text: "Выбирай формат под удобный темп: самостоятельно или по расписанию с группой.",
                },
                {
                  icon: GraduationCap,
                  title: "Бесплатный вход в каталог",
                  text: "Часть программ доступна без оплаты — попробуй до покупки.",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <MotionReveal key={item.title} variant="up" delay={index * 80}>
                    <article className={cn(publicCardClassName, "h-full")}>
                      <div className={publicIconBoxClassName}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                        {item.text}
                      </p>
                    </article>
                  </MotionReveal>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ─── FORMATS ───────────────────────────────────────────────── */}
      <section className="bg-[var(--primary-soft)] py-20" id="formats">
        <PageContainer>
          <div className="grid gap-12 xl:grid-cols-2 xl:items-center">
            {/* Left: SectionLead */}
            <SectionLead
              eyebrow="Форматы обучения"
              title="Два формата — один маршрут"
              text="Выбирай самостоятельный темп или живое расписание. В обоих форматах урок содержит всё необходимое: материалы, задание и следующий шаг."
            />

            {/* Right: 2 image cards */}
            <div className="grid grid-cols-2 gap-4">
              <MotionReveal variant="up" delay={80}>
                <article className="group cursor-default overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:scale-[1.03]">
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                      alt="Курс в записи"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold leading-6 text-[var(--foreground)]">
                      Курс в записи
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                      Учишься в своём темпе и возвращаешься к материалам в любое время.
                    </p>
                  </div>
                </article>
              </MotionReveal>
              <MotionReveal variant="up" delay={140}>
                <article className="group cursor-default overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:scale-[1.03]">
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=800&q=80"
                      alt="Онлайн-поток"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold leading-6 text-[var(--foreground)]">
                      Онлайн-поток
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                      Занятия по расписанию. Запись эфира остаётся в уроке после трансляции.
                    </p>
                  </div>
                </article>
              </MotionReveal>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="bg-white py-20" id="how">
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
                      <div className={publicIconBoxClassName}>
                        <Icon className="h-5 w-5" />
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
      <section className="bg-[var(--surface-strong)] py-20" id="courses">
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
      <section className="bg-[var(--surface-strong)] py-20">
        <PageContainer>
          <MotionReveal variant="scale" delay={80}>
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--primary)] px-6 py-16 text-center shadow-[var(--shadow-brand)] md:px-12">

              {/* Декоративные фигуры фона */}
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute -left-6 -top-8 h-28 w-28 rounded-2xl bg-white/8" />
                <div className="absolute -bottom-6 left-20 h-20 w-20 rounded-2xl bg-white/6" />
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-2xl bg-white/8" />
                <div className="absolute bottom-6 right-24 h-14 w-14 rounded-xl bg-white/6" />
              </div>

              {/* Флоатящие карточки — левая сторона */}
              <div className="pointer-events-none absolute left-8 top-1/2 hidden -translate-y-1/2 space-y-3 xl:block" aria-hidden>
                <div className="animate-[float-up_6s_ease-in-out_infinite]">
                  <div className="-rotate-6 rounded-[var(--radius-md)] bg-white px-4 py-3 text-left shadow-[var(--shadow-md)]">
                    <p className="text-[11px] font-medium text-[var(--muted)]">Следующий урок</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">Работа с продавцом</p>
                  </div>
                </div>
                <div className="animate-[float-down_5s_ease-in-out_infinite_-2s]">
                  <div className="rotate-3 rounded-[var(--radius-md)] bg-white px-4 py-3 text-left shadow-[var(--shadow-md)]">
                    <p className="text-2xl font-bold text-[var(--primary)]">75%</p>
                    <p className="text-[11px] font-medium text-[var(--muted)]">Пройдено</p>
                  </div>
                </div>
              </div>

              {/* Центр */}
              <div className="relative mx-auto max-w-[480px] space-y-6">
                <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                  <Copy value="Выбери курс и начни с шага, который нужен тебе сейчас" />
                </h2>
                <p className="text-[16px] leading-7 text-white/72">
                  <Copy value="Открой каталог, посмотри форматы и начни с программы, которая даст понятный результат уже в ближайшей сделке." />
                </p>
                <div className="flex justify-center">
                  <PublicButton href="/catalog" tone="secondary">
                    <Copy value="Перейти в каталог" />
                  </PublicButton>
                </div>
              </div>

              {/* Флоатящие карточки — правая сторона */}
              <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 space-y-3 xl:block" aria-hidden>
                <div className="animate-[float-down_7s_ease-in-out_infinite_-3s]">
                  <div className="rotate-6 rounded-[var(--radius-md)] bg-white px-4 py-3 text-left shadow-[var(--shadow-md)]">
                    <p className="text-2xl font-bold text-[var(--foreground)]">{programsLabel(publishedCourses)}</p>
                    <p className="text-[11px] font-medium text-[var(--muted)]">в каталоге</p>
                  </div>
                </div>
                <div className="animate-[float-up_5.5s_ease-in-out_infinite_-1s]">
                  <div className="-rotate-3 rounded-[var(--radius-md)] bg-white px-4 py-3 text-left shadow-[var(--shadow-md)]">
                    <p className="text-[11px] font-medium text-[var(--muted)]">Средний прогресс</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">+15% за неделю</p>
                  </div>
                </div>
              </div>

            </div>
          </MotionReveal>
        </PageContainer>
      </section>

    </div>
  );
}
