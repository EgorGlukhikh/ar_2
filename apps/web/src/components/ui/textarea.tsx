import * as React from "react";
import { Textarea as HeadlessTextarea } from "@headlessui/react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeadlessTextarea
        ref={ref}
        className={cn(
          "flex min-h-32 w-full rounded-[var(--control-radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--focus)]",
          className,
        )}
        style={{ colorScheme: "light" }}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
