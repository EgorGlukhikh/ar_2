import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-[var(--radius-lg)] border shadow-[var(--shadow-sm)]",
  {
    variants: {
      variant: {
        default: "border-[var(--border)] bg-[var(--surface)]",
        alt: "border-[var(--border)] bg-[var(--surface-alt)]",
        strong: "border-[var(--border)] bg-[var(--surface-strong)]",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "lg",
    },
  },
);

type CardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    as?: "div" | "article" | "section";
  };

export function Card({
  as: Tag = "div",
  className,
  variant,
  padding,
  ...props
}: CardProps) {
  return <Tag className={cn(cardVariants({ variant, padding }), className)} {...props} />;
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[24px] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--foreground)]",
        className,
      )}
      {...props}
    >
      {children as ReactNode}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-7 text-[var(--muted)]", className)} {...props}>
      {children as ReactNode}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}
