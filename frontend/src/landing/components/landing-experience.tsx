"use client";

import { startTransition, useEffect, useState } from "react";
import {
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  Tv,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
import { SiteIllustration } from "@/components/illustrations/site-illustration";
import { formatPublicCopy } from "@/lib/public-copy";
import { cn } from "@/lib/utils";
import {
  audienceCards,
  roleCopy,
  trustPoints,
} from "@shared/public-home/copy";
import type { LandingRole, PublicHomePayload } from "@shared/public-home/types";

type LandingExperienceProps = PublicHomePayload;

function Copy({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatPublicCopy(value)}</span>;
}

function buildUrlWithRole(
  pathname: string,
  searchParams: URLSearchParams,
  role: LandingRole,
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("role", role);
  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

function ProductPreview({ role }: { role: LandingRole }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
      <article className={publicGradientCardClassName}>
        <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.18em] text-white/68">
          <Copy value={role === "author" ? "Витрина продукта" : "Внутри платформы"} />
        </p>
        <h2 className="mt-4 max-w-[13ch] text-[32px] font-semibold leading-10 tracking-[-0.02em] text-white">
          <Copy
            value={
              role === "author"
                ? "Курс собирается как продукт: карточка, уроки, материалы и продажи."
                : "Ученик видит курс, маршрут уроков и все материалы в одном интерфейсе."
            }
          />
        </h2>

        <div className="mt-6 grid gap-3">
          {[
            {
              title: role === "author" ? "Структура курса" : "Маршрут обучения",
              text:
                role === "author"
                  ? "Модули, уроки, задания и видео собираются в одной программе."
                  : "Каталог, карточка курса, уроки и прогресс читаются без лишнего шума.",
            },
            {
              title: role === "author" ? "Форматы" : "Наполнение урока",
              text:
                role === "author"
                  ? "Запись и онлайн-поток живут в единой логике уроков."
                  : "Видео, текст, файлы и задания остаются в уроке и не теряются по ходу курса.",
            },
            {
              title: role === "author" ? "Публикация" : "Следующий шаг",
              text:
                role === "author"
                  ? "Курс получает понятную карточку и публикуется в каталоге."
                  : "После выбора программы сразу понятно, что делать дальше.",
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
        <SiteIllustration
          kind={role === "author" ? "designProcess" : "onlineLearning"}
          alt={
            role === "author"
              ? "Иллюстрация создания и сборки учебной программы"
              : "Иллюстрация онлайн-обучения и учебного процесса"
          }
          priority
          className="p-5"
          imageClassName="scale-[1.04]"
        />

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

/**
 * Purpose: public SaaS-style landing assembled only from frontend concerns.
 * Props:
 * - publishedCourses: count of published courses for hero metrics.
 * - courses: normalized public course cards from backend/shared layer.
 * Usage:
 * - used by app/page.tsx after backend service builds the landing payload.
 */
export function LandingExperience({
  publishedCourses,
  courses,
}: LandingExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<LandingRole>("learn");
  const activeCopy = roleCopy[role];

  useEffect(() => {
    const roleParam = searchParams.get("role");

    if (roleParam === "learn" || roleParam === "author") {
      setRole(roleParam);
      window.localStorage.setItem("academy-landing-role", roleParam);
      return;
    }

    const storedRole = window.localStorage.getItem("academy-landing-role");

    if (storedRole === "learn" || storedRole === "author") {
      setRole(storedRole);
      startTransition(() => {
        router.replace(buildUrlWithRole(pathname, new URLSearchParams(searchParams), storedRole), {
          scroll: false,
        });
      });
    }
  }, [pathname, router, searchParams]);

  function handleRoleChange(nextRole: LandingRole) {
    setRole(nextRole);
    window.localStorage.setItem("academy-landing-role", nextRole);
    startTransition(() => {
      router.replace(buildUrlWithRole(pathname, new URLSearchParams(searchParams), nextRole), {
        scroll: false,
      });
    });
  }

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
                  <Copy value="Платформа с курсами по недвижимости для учеников, агентов и авторов программ." />
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <nav className="hidden flex-wrap gap-6 text-base text-[var(--muted)] md:flex">
                <Link href="#value" className="transition hover:text-[var(--foreground)]">
                  <Copy value="Для кого" />
                </Link>
                <Link href="#flow" className="transition hover:text-[var(--foreground)]">
                  <Copy value="Как работает" />
                </Link>
                <Link href="#courses" className="transition hover:text-[var(--foreground)]">
                  <Copy value="Курсы" />
                </Link>
              </nav>

              <div className="flex flex-wrap gap-3">
                <PublicButton href="/sign-in" tone="secondary">
                  <Copy value="Войти" />
                </PublicButton>
                <PublicButton href={activeCopy.primaryHref}>
                  <Copy value={activeCopy.primaryLabel} />
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
            <Copy value={activeCopy.eyebrow} />
          </div>

          <div className="inline-flex rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-strong)] p-1 shadow-[var(--shadow-sm)]">
            {([
              { value: "learn", label: "Я учусь" },
              { value: "author", label: "Я автор" },
            ] as const).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleRoleChange(item.value)}
                className={cn(
                  "min-h-[calc(var(--control-height)-8px)] rounded-[calc(var(--control-radius)-4px)] px-5 text-sm font-semibold transition duration-200",
                  role === item.value
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-brand)]"
                    : "text-[var(--foreground)] hover:bg-[var(--surface)]",
                )}
              >
                <Copy value={item.label} />
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <h1 className="max-w-[11ch] text-[clamp(2.15rem,5vw,3.35rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--foreground)]">
              <Copy value={activeCopy.title} />
            </h1>
            <p className="max-w-[560px] text-[16px] leading-7 text-[var(--muted)]">
              <Copy value={activeCopy.text} />
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="space-y-3">
              <PublicButton href={activeCopy.primaryHref} className="w-full justify-center sm:w-auto">
                <Copy value={activeCopy.primaryLabel} />
              </PublicButton>
              <p className="max-w-[260px] text-sm leading-6 text-[var(--muted)]">
                <Copy value={activeCopy.primaryHint} />
              </p>
            </div>

            <div className="space-y-3">
              <PublicButton
                href={activeCopy.secondaryHref}
                tone="secondary"
                className="w-full justify-center sm:w-auto"
              >
                <Copy value={activeCopy.secondaryLabel} />
              </PublicButton>
              <p className="max-w-[260px] text-sm leading-6 text-[var(--muted)]">
                <Copy value={activeCopy.secondaryHint} />
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
          <ProductPreview role={role} />
        </MotionReveal>
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] md:p-8">
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustPoints.map((item, index) => (
            <MotionReveal key={item} variant="up" delay={index * 70}>
              <article className="flex items-start gap-3 rounded-[16px] bg-[var(--surface-strong)] p-4">
                <div className={cn(publicIconBoxClassName, "h-10 w-10 rounded-[12px]")}>
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
          text="Здесь не нужно разбираться в сложной схеме платформы. Человек сразу узнает свой сценарий и понимает, куда кликать дальше."
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
            title={activeCopy.processTitle}
            text={activeCopy.processText}
          />

          <div className="grid gap-5 xl:grid-cols-[1fr_auto_1fr_auto_1fr] xl:items-stretch">
            {activeCopy.steps.map((step, index) => {
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

                  {index < activeCopy.steps.length - 1 ? (
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

      <section id="courses" className="space-y-8">
        <SectionLead
          eyebrow="Каталог"
          title="Выбирай программу под задачу сделки"
          text="В карточке курса сразу видно формат, объем, цену и чему научишься. Если программ больше трех, подборки можно листать кнопками без узких колонок и ломки сетки."
        />

        <LandingCourseCarousel courses={courses} />
      </section>

      <MotionReveal variant="scale" delay={80}>
        <section className="rounded-[28px] bg-[#1e285d] bg-[image:var(--brand-gradient)] bg-cover bg-center px-6 py-8 text-white shadow-[var(--shadow-brand)] md:px-8 md:py-12">
          <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
            <SectionLead
              eyebrow="Готовы начать?"
              title="Выбери курс или открой свой кабинет автора"
              text="Открой каталог, посмотри форматы и начни с того шага, который даст результат уже в ближайшей сделке или в запуске собственной программы."
              light
            />

            <div className="flex flex-col gap-3 sm:flex-row xl:items-end">
              <PublicButton href="/catalog" tone="secondary" className="min-w-[220px]">
                <Copy value="Перейти в каталог" />
              </PublicButton>
              <PublicButton href="/sign-in?role=author" tone="ghost" className="min-w-[220px]">
                <Copy value="Стать автором" />
              </PublicButton>
            </div>
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
