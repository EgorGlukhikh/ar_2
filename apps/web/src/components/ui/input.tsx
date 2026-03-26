import * as React from "react";
import { Input as HeadlessInput } from "@headlessui/react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <HeadlessInput
        ref={ref}
        type={type}
        className={cn(
          "flex h-[var(--control-height)] w-full rounded-[var(--control-radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--focus)]",
          className,
        )}
        style={{ colorScheme: "light" }}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
