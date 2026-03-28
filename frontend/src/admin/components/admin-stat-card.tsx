"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { systemCardClassName } from "@/components/system/system-ui";
import { cn } from "@/lib/utils";

/** Разбирает строку вида "5" или "0.00 ₽" и возвращает целевое число для анимации. */
function parseAnimTarget(value: string): number | null {
  const trimmed = value.trim();
  // Анимируем только чистые целые числа больше нуля
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return n > 0 ? n : null;
  }
  return null;
}

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  accentColor = "var(--primary)",
  accentBg = "var(--primary-soft)",
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  href?: string | null;
  accentColor?: string;
  accentBg?: string;
}) {
  const target = parseAnimTarget(value);
  const [count, setCount] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!target) return;
    const el = divRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 30;
          const duration = 800;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const eased = 1 - Math.pow(1 - step / steps, 3);
            setCount(Math.round(eased * target));
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const displayValue = target !== null ? String(count) : value;

  const cardClassName = cn(
    systemCardClassName,
    "p-5 transition-all duration-200",
    href && "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
  );

  const content = (
    <div ref={divRef}>
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--icon-radius)]"
          style={{ backgroundColor: accentBg }}
        >
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {label}
        </p>
      </div>

      <p
        className="mt-5 text-[32px] font-semibold tracking-[-0.03em]"
        style={{ color: accentColor }}
      >
        {displayValue}
      </p>

      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{hint}</p>

      {href && (
        <p className="mt-4 text-xs font-semibold" style={{ color: accentColor }}>
          Подробнее →
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={cn(cardClassName, "block")}>
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
