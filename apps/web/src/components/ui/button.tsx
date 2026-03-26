import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[12px] text-base font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,70,229,0.16)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed ring-offset-white [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0 [&_svg]:text-current",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[var(--primary)] text-white shadow-[var(--shadow-brand)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] disabled:bg-[#c7d2fe] disabled:text-white",
        outline:
          "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-strong)] disabled:bg-[#f8fafc] disabled:text-[var(--muted-soft)]",
        ghost:
          "border border-transparent bg-transparent text-[var(--foreground)] hover:bg-[var(--primary-soft)] disabled:text-[var(--muted-soft)]",
      },
      size: {
        default: "h-12 px-5 py-3",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
