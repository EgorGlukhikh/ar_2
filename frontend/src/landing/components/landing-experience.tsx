"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Layers,
  LayoutList,
  MonitorPlay,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

import { AcademyMark } from "@/components/brand/academy-mark";
import { MotionReveal } from "@/components/marketing/motion-reveal";
import {
  PublicButton,
  publicCardClassName,
  publicGradientCardClassName,
  publicIconBoxClassName,
  SectionLead,
} from "@/components/marketing/public-primitives";
import { PageContainer } from "@/components/layout/page-grid";
import { Button } from "@/components/ui/button";
import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";
import { audienceCards, roleCopy, trustPoints } from "@shared/public-home/copy";
import type { PublicHomePayload } from "@shared/public-home/types";

import { LandingCourseCarousel } from "./landing-course-carousel";

function Copy({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatPublicCopy(value)}</span>;
}

function StatCounter({
  target,
  label,
  formatValue,
  valueLabel,
}: {
  target: number;
  label: string;
  formatValue?: (n: number) => string;
  valueLabel?: string;
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
    <div ref={ref} className="min-w-0">
      <p className="text-[1.7rem] font-bold leading-none text-white sm:text-2xl">
        {formatValue ? formatValue(count) : count}
      </p>
      {valueLabel ? (
        <p className="mt-1 text-sm font-semibold text-white/88">{valueLabel}</p>
      ) : null}
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

function programWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "программа";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "программы";
  return "программ";
}

const heroAmbientMarkClasses = [
  "hero-mark-1",
  "hero-mark-2",
  "hero-mark-3",
  "hero-mark-4",
  "hero-mark-5",
  "hero-mark-6",
  "hero-mark-7",
  "hero-mark-8",
  "hero-mark-9",
  "hero-mark-10",
] as const;

const valueAmbientMarkClasses = [
  "value-mark-1",
  "value-mark-2",
  "value-mark-3",
  "value-mark-4",
  "value-mark-5",
  "value-mark-6",
  "value-mark-7",
  "value-mark-8",
] as const;

export function LandingExperience({
  publishedCourses,
  courses,
  viewerName,
}: PublicHomePayload & {
  viewerName?: string | null;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const valueRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const supportsInteractivePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (
      !hero ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !supportsInteractivePointer
    ) {
      return;
    }

    let frame = 0;
    let targetX = 50;
    let targetY = 38;
    let currentX = 50;
    let currentY = 38;

    const updatePointer = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      hero.style.setProperty("--hero-pointer-x", `${currentX.toFixed(2)}%`);
      hero.style.setProperty("--hero-pointer-y", `${currentY.toFixed(2)}%`);
      frame = window.requestAnimationFrame(updatePointer);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
    };

    const handlePointerLeave = () => {
      targetX = 50;
      targetY = 38;
    };

    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);
    frame = window.requestAnimationFrame(updatePointer);

    return () => {
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const sections = [heroRef.current, valueRef.current].filter(Boolean) as HTMLElement[];
    const supportsInteractivePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (
      sections.length === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !supportsInteractivePointer
    ) {
      return;
    }

    const cleanups = sections.map((section) => {
      const marks = Array.from(
        section.querySelectorAll<HTMLElement>("[data-floating-mark]"),
      );

      if (marks.length === 0) {
        return () => undefined;
      }

      let frame = 0;
      let pointerX = -9999;
      let pointerY = -9999;
      let active = false;
      const markStates = new Map(
        marks.map((mark) => [
          mark,
          {
            currentX: 0,
            currentY: 0,
          },
        ]),
      );

      const updateMarks = () => {
        marks.forEach((mark) => {
          const rect = mark.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dx = centerX - pointerX;
          const dy = centerY - pointerY;
          const distance = Math.hypot(dx, dy);
          const radius = Math.max(170, rect.width * 1.6);
          const state = markStates.get(mark);

          if (!state) {
            return;
          }

          let targetOffsetX = 0;
          let targetOffsetY = 0;

          if (active && distance < radius && distance !== 0) {
            const strength = (1 - distance / radius) ** 1.15;
            const maxOffset = Math.min(42, rect.width * 0.34);
            targetOffsetX = (dx / distance) * maxOffset * strength;
            targetOffsetY = (dy / distance) * maxOffset * strength;
          }

          state.currentX += (targetOffsetX - state.currentX) * 0.05;
          state.currentY += (targetOffsetY - state.currentY) * 0.05;

          if (Math.abs(state.currentX) < 0.05) {
            state.currentX = 0;
          }

          if (Math.abs(state.currentY) < 0.05) {
            state.currentY = 0;
          }

          mark.style.setProperty("--mark-repel-x", `${state.currentX.toFixed(2)}px`);
          mark.style.setProperty("--mark-repel-y", `${state.currentY.toFixed(2)}px`);
        });

        frame = window.requestAnimationFrame(updateMarks);
      };

      const handlePointerMove = (event: PointerEvent) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        active = true;
      };

      const handlePointerLeave = () => {
        active = false;
        pointerX = -9999;
        pointerY = -9999;
      };

      section.addEventListener("pointermove", handlePointerMove);
      section.addEventListener("pointerleave", handlePointerLeave);
      frame = window.requestAnimationFrame(updateMarks);

      return () => {
        section.removeEventListener("pointermove", handlePointerMove);
        section.removeEventListener("pointerleave", handlePointerLeave);
        window.cancelAnimationFrame(frame);
        marks.forEach((mark) => {
          mark.style.removeProperty("--mark-repel-x");
          mark.style.removeProperty("--mark-repel-y");
        });
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <div>

      {/* ─── STICKY HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/96 backdrop-blur-sm">
        <PageContainer className="flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--foreground)] text-white">
              <AcademyMark className="w-5" title="Академия риэлторов" />
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

          <div className="flex shrink-0 items-center gap-4 md:gap-5">
            {viewerName ? (
              <Link
                href="/learning/profile#profile-settings"
                className="text-sm font-semibold text-[var(--foreground)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--primary)] hover:decoration-[var(--primary)]"
              >
                {`Привет, ${viewerName}.`}
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Войти
              </Link>
            )}
            <Button asChild size="sm">
              <Link href="/catalog">
              Подобрать курс
              </Link>
            </Button>
          </div>
        </PageContainer>
      </header>

      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="hero-stage relative overflow-hidden bg-[var(--foreground)] pb-20 pt-16"
      >
        <div className="hero-ambient hero-ambient-gradient" aria-hidden />
        <div className="hero-ambient hero-ambient-spotlight" aria-hidden />
        <div className="hero-ambient hero-ambient-grid" aria-hidden />
        <div className="hero-floating-marks" aria-hidden>
          {heroAmbientMarkClasses.map((className) => (
            <span key={className} className={cn("hero-mark-shell", className)} data-floating-mark>
              <AcademyMark className="ambient-mark-glyph w-full" />
            </span>
          ))}
        </div>
        <PageContainer className="relative z-10">
          <MotionReveal variant="soft" immediate>
            <div className="grid gap-12 xl:grid-cols-2 xl:items-center">

              {/* Left: text */}
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <Copy value={roleCopy.learn.eyebrow} />
                </span>

                <h1 className="max-w-[14ch] text-[clamp(2.6rem,5.8vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-white">
                  <Copy value={roleCopy.learn.title} />
                </h1>

                <p className="max-w-[44ch] text-[17px] leading-8 text-white/64">
                  <Copy value={roleCopy.learn.text} />
                </p>

                <div className="flex flex-wrap gap-3">
                  <PublicButton href={roleCopy.learn.primaryHref}>
                    <Copy value={roleCopy.learn.primaryLabel} />
                  </PublicButton>
                  <PublicButton href={roleCopy.learn.secondaryHref} tone="ghost">
                    <Copy value={roleCopy.learn.secondaryLabel} />
                  </PublicButton>
                </div>

                <div className="grid gap-3 border-t border-white/10 pt-5 text-sm leading-6 text-white/62 sm:grid-cols-2">
                  <p className="max-w-[28ch]">
                    <Copy value={roleCopy.learn.primaryHint} />
                  </p>
                  <p className="max-w-[28ch]">
                    <Copy value={roleCopy.learn.secondaryHint} />
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-8 text-center sm:gap-4 sm:text-left">
                  <StatCounter
                    target={publishedCourses}
                    label="в каталоге"
                    valueLabel={programWord(publishedCourses)}
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
              <MotionReveal
                variant="right"
                immediate
                delay={120}
                className="mx-auto w-full min-w-0 max-w-[360px] self-center sm:max-w-[560px] xl:mx-0 xl:justify-self-end"
              >
                <div className={cn(publicGradientCardClassName, "mx-auto w-full min-w-0 px-5 sm:px-7")}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    <Copy value={roleCopy.learn.heroCardEyebrow} />
                  </p>
                  <h2 className="mt-4 max-w-[22ch] text-2xl font-semibold leading-[1.08] tracking-[-0.02em] text-white">
                    <Copy value={roleCopy.learn.heroCardTitle} />
                  </h2>
                  <div className="mt-6 grid gap-3">
                    {roleCopy.learn.heroCardPoints.map((item) => (
                      <div
                        key={item}
                        className="rounded-[var(--radius-md)] border border-white/12 bg-white/8 px-4 py-3"
                      >
                        <p className="text-sm leading-6 text-white/78">
                          <Copy value={item} />
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <PublicButton href="/catalog" tone="ghost">
                      <Copy value={roleCopy.learn.heroCardCta} />
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
          <section className="border-b border-[var(--border)] bg-[var(--surface-strong)] py-12 md:py-14">
            <PageContainer className="grid place-items-center">
              <div className="grid w-full max-w-[1080px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trustCards.map(({ Icon, text }, index) => (
                  <MotionReveal key={text} variant="up" delay={index * 60} className="h-full">
                    <div className="flex min-h-[188px] h-full cursor-default flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 text-center shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-soft)]">
                        <Icon className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <p className="max-w-[22ch] text-sm leading-6 text-[var(--foreground)]">
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
      <section
        ref={valueRef}
        className="value-stage relative overflow-hidden bg-white pt-16 pb-20"
        id="value"
      >
        <div className="value-floating-marks" aria-hidden>
          {valueAmbientMarkClasses.map((className) => (
            <span key={className} className={cn("value-mark-shell", className)} data-floating-mark>
              <AcademyMark className="ambient-mark-glyph w-full" />
            </span>
          ))}
        </div>
        <PageContainer className="relative z-10">
          <div className="space-y-10">
            <SectionLead
              eyebrow="Кому подойдет платформа"
              title="Учиться, усиливать практику или превращать экспертизу в продукт"
              text="Платформа подходит тем, кто хочет войти в профессию, быстро закрывать рабочие задачи в текущей практике или оформить собственную экспертизу в образовательный продукт."
            />

            {/* Top row: 3 large accent cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {audienceCards.map((item, index) => (
                <MotionReveal key={item.title} variant="up" delay={index * 80}>
                  <article
                    className={cn(
                      "flex min-h-[240px] cursor-default flex-col rounded-[var(--radius-lg)] p-6 transition-all duration-200 hover:-translate-y-1.5 hover:scale-[1.03]",
                      index === 0 &&
                        "border border-white/8 bg-[var(--foreground)] shadow-[var(--shadow-md)]",
                      index === 1 &&
                        "border border-[var(--border)] bg-[var(--surface-strong)] shadow-[var(--shadow-sm)]",
                      index === 2 &&
                        "border border-indigo-500/20 bg-[var(--primary)] shadow-[var(--shadow-brand)]",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.18em]",
                        index === 1 ? "text-[var(--muted)]" : "text-white/60",
                      )}
                    >
                      <Copy value={item.eyebrow} />
                    </p>
                    <h3
                      className={cn(
                        "mt-4 text-xl font-semibold leading-7 tracking-[-0.02em]",
                        index === 1 ? "text-[var(--foreground)]" : "text-white",
                      )}
                    >
                      <Copy value={item.title} />
                    </h3>
                    <p
                      className={cn(
                        "mt-3 text-sm leading-7",
                        index === 1 ? "text-[var(--muted)]" : "text-white/72",
                      )}
                    >
                      <Copy value={item.text} />
                    </p>
                  </article>
                </MotionReveal>
              ))}
            </div>

            {/* Bottom row: 3 feature cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "Материалы и шаблоны внутри урока",
                  text: "Видео, конспекты, файлы, шаблоны и задания находятся там, где ученик их реально использует.",
                },
                {
                  icon: PlayCircle,
                  title: "Запись и поток в одной логике",
                  text: "Можно учиться в своём темпе или идти по расписанию, не меняя платформу и не теряя маршрут.",
                },
                {
                  icon: LayoutList,
                  title: "Эксперт может запустить свой курс",
                  text: "Если у пользователя есть сильная практика, её можно оформить в продукт, опубликовать и продавать на платформе.",
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
              text="Выбирай удобный темп, а не меняй логику обучения. И в записи, и в живом потоке ученик проходит один и тот же понятный маршрут: урок, материалы, задание, следующий шаг."
            />

            {/* Right: 2 image cards */}
            <div className="min-w-0 space-y-4">
              <div className="flex items-center justify-between md:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  <Copy value="Смахни вбок" />
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] animate-[pulse_1.8s_ease-in-out_infinite]">
                  <Copy value="Ещё форматы" />
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="w-full overflow-x-hidden overflow-y-visible py-1">
                <div className="flex items-stretch gap-4 overflow-x-auto overflow-y-visible overscroll-x-contain px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
                  <MotionReveal variant="up" delay={80} className="shrink-0 snap-center md:min-w-0">
                    <article className="group flex h-full min-h-[340px] w-[84%] min-w-[84%] max-w-[340px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:scale-[1.03] sm:max-w-[420px] md:min-h-[356px] md:w-auto md:min-w-0 md:max-w-none">
                      <div className="relative h-44 overflow-hidden rounded-t-[var(--radius-lg)]">
                        <Image
                          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                          alt="Курс в записи"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                      <div className="flex flex-1 flex-col p-5 pb-6">
                        <h3 className="text-base font-semibold leading-6 text-[var(--foreground)]">
                          Курс в записи
                        </h3>
                        <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                          Учишься в своём темпе и возвращаешься к материалам в любое время.
                        </p>
                      </div>
                    </article>
                  </MotionReveal>

                  <MotionReveal variant="up" delay={140} className="shrink-0 snap-center md:min-w-0">
                    <article className="group flex h-full min-h-[340px] w-[84%] min-w-[84%] max-w-[340px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:scale-[1.03] sm:max-w-[420px] md:min-h-[356px] md:w-auto md:min-w-0 md:max-w-none">
                      <div className="relative h-44 overflow-hidden rounded-t-[var(--radius-lg)]">
                        <Image
                          src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=800&q=80"
                          alt="Онлайн-поток"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                      <div className="flex flex-1 flex-col p-5 pb-6">
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
              title={roleCopy.learn.processTitle}
              text={roleCopy.learn.processText}
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
                title="Выбирай программу под текущую задачу, а не по общему описанию"
                text="До покупки видно формат, цену, структуру и чему именно посвящён курс. Это помогает выбирать обучение осознанно, а не на уровне обещаний."
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
                  <Copy value="Выбери программу под свою задачу или преврати свою экспертизу в курс" />
                </h2>
                <p className="text-[16px] leading-7 text-white/72">
                  <Copy value="Можно зайти как ученик, выбрать обучение под текущую задачу и сразу понять маршрут. А если у тебя уже есть сильная практика, её можно упаковать в курс и вывести в каталог." />
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <PublicButton href="/catalog" tone="secondary">
                    <Copy value="Перейти в каталог" />
                  </PublicButton>
                  <PublicButton href="/sign-in?role=author" tone="ghost">
                    <Copy value="Разместить свой курс" />
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
