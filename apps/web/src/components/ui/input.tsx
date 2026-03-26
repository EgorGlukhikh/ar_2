import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-[var(--control-height)] w-full rounded-[var(--control-radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(79,70,229,0.14)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
