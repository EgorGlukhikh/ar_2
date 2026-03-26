import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-[var(--control-height)] w-full appearance-none rounded-[var(--control-radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 pr-11 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(79,70,229,0.14)]",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
