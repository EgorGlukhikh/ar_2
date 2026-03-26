"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RevealVariant = "up" | "left" | "right" | "scale" | "soft";

type MotionRevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  immediate?: boolean;
};

export function MotionReveal({
  children,
  className,
  variant = "up",
  delay = 0,
  immediate = false,
  style,
  ...props
}: MotionRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [immediate]);

  return (
    <div
      ref={ref}
      className={cn(
        "motion-reveal",
        `motion-reveal-${variant}`,
        isVisible && "motion-reveal-visible",
        className,
      )}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}
