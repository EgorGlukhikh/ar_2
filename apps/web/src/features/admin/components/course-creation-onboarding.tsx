"use client";

import { useEffect, useState } from "react";
import { CircleHelp, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "academy.admin.course-create-onboarding.v1.dismissed";
const DESKTOP_BREAKPOINT = 1100;
const CARD_WIDTH = 304;
const CARD_GAP = 22;
const VIEWPORT_GAP = 16;

type HintPlacement = "top" | "right" | "bottom" | "left";

type HintDefinition = {
  targetId: string;
  title: string;
  body: string;
  placement: HintPlacement;
};

type MeasuredHint = HintDefinition & {
  cardStyle: {
    top: number;
    left: number;
  };
  highlightStyle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

const hintDefinitions: HintDefinition[] = [
  {
    targetId: "course-title-field",
    title: "Название",
    body: "Назовите курс понятно и практично, чтобы команда сразу понимала его тему и пользу.",
    placement: "right",
  },
  {
    targetId: "course-description-field",
    title: "Описание",
    body: "Расскажите, чем курс поможет агенту в повседневной работе и к какому результату приведет.",
    placement: "top",
  },
  {
    targetId: "course-delivery-format-field",
    title: "Формат курса",
    body: "Выберите, будет ли это готовый курс в записях или онлайн-встречи с агентами.",
    placement: "bottom",
  },
  {
    targetId: "course-structure-mode-field",
    title: "Структура курса",
    body: "Для цепочки равных уроков подойдет единый поток. Для иерархии и подтем лучше модули.",
    placement: "bottom",
  },
  {
    targetId: "course-timezone-field",
    title: "Часовой пояс",
    body: "Это особенно важно для вебинаров, чтобы расписание и эфиры не съехали по времени.",
    placement: "left",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function resolveCardPosition(
  rect: DOMRect,
  placement: HintPlacement,
  viewportWidth: number,
  viewportHeight: number,
) {
  const centeredTop = rect.top + rect.height / 2 - 88;
  const centeredLeft = rect.left + rect.width / 2 - CARD_WIDTH / 2;

  const positions = {
    top: {
      top: rect.top - 176 - CARD_GAP,
      left: centeredLeft,
    },
    right: {
      top: centeredTop,
      left: rect.right + CARD_GAP,
    },
    bottom: {
      top: rect.bottom + CARD_GAP,
      left: centeredLeft,
    },
    left: {
      top: centeredTop,
      left: rect.left - CARD_WIDTH - CARD_GAP,
    },
  };

  const selected = positions[placement];

  return {
    top: clamp(selected.top, VIEWPORT_GAP, viewportHeight - 176 - VIEWPORT_GAP),
    left: clamp(selected.left, VIEWPORT_GAP, viewportWidth - CARD_WIDTH - VIEWPORT_GAP),
  };
}

export function CourseCreationOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hints, setHints] = useState<MeasuredHint[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    setIsVisible(window.localStorage.getItem(STORAGE_KEY) !== "dismissed");
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }

    const updateViewportMode = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);

    return () => {
      window.removeEventListener("resize", updateViewportMode);
    };
  }, [isReady]);

  useEffect(() => {
    if (!isVisible || !isDesktop || typeof window === "undefined") {
      return;
    }

    const measureHints = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const nextHints = hintDefinitions
        .map((hint) => {
          const target = document.getElementById(hint.targetId);

          if (!target) {
            return null;
          }

          const rect = target.getBoundingClientRect();
          const cardStyle = resolveCardPosition(
            rect,
            hint.placement,
            viewportWidth,
            viewportHeight,
          );

          return {
            ...hint,
            cardStyle,
            highlightStyle: {
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            },
          } satisfies MeasuredHint;
        })
        .filter((hint): hint is MeasuredHint => Boolean(hint));

      setHints(nextHints);
    };

    const frameId = window.requestAnimationFrame(measureHints);
    window.addEventListener("resize", measureHints);
    window.addEventListener("scroll", measureHints, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measureHints);
      window.removeEventListener("scroll", measureHints, true);
    };
  }, [isVisible, isDesktop]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    }

    setIsVisible(false);
  };

  const handleReopen = () => {
    setIsVisible(true);
  };

  return (
    <>
      <div className="flex justify-end">
        {!isVisible && isReady ? (
          <Button type="button" variant="outline" size="sm" onClick={handleReopen}>
            <CircleHelp className="mr-2 h-4 w-4" />
            Показать подсказки
          </Button>
        ) : null}
      </div>

      {isVisible ? (
        <div className="pointer-events-none fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-slate-950/18 backdrop-blur-[1px]" />

          <div className="pointer-events-auto absolute left-1/2 top-5 w-[min(640px,calc(100vw-32px))] -translate-x-1/2">
            <div className="rounded-[28px] border border-white/60 bg-white/96 px-5 py-4 shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      Первый запуск
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                      Небольшая памятка перед созданием курса
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Подсветили ключевые поля, чтобы курс было проще собрать с первого раза.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full px-0"
                  onClick={handleDismiss}
                  aria-label="Закрыть подсказки"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {isDesktop ? (
            <>
              {hints.map((hint) => (
                <div
                  key={`${hint.targetId}-highlight`}
                  className="absolute rounded-[26px] border border-[color:color-mix(in_srgb,var(--primary)_34%,white)] bg-[color:color-mix(in_srgb,var(--primary)_12%,white)] shadow-[0_24px_50px_rgba(79,70,229,0.16)]"
                  style={hint.highlightStyle}
                />
              ))}

              {hints.map((hint) => (
                <article
                  key={hint.targetId}
                  className="pointer-events-auto absolute w-[304px] rounded-[26px] border border-[color:color-mix(in_srgb,var(--primary)_16%,white)] bg-white/98 p-5 shadow-[0_28px_60px_rgba(15,23,42,0.18)]"
                  style={hint.cardStyle}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                    {hint.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{hint.body}</p>
                </article>
              ))}
            </>
          ) : (
            <div className="pointer-events-auto absolute inset-x-4 bottom-4">
              <div className="rounded-[30px] border border-white/70 bg-white/96 p-5 shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
                <div className="space-y-4">
                  {hintDefinitions.map((hint) => (
                    <div
                      key={hint.targetId}
                      className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                        {hint.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{hint.body}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex justify-end">
                  <Button type="button" onClick={handleDismiss}>
                    Понятно
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
