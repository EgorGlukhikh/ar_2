import * as React from "react";
import { Label as HeadlessLabel } from "@headlessui/react";

import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeadlessLabel
        ref={ref}
        className={cn(
          "text-sm font-medium text-[var(--foreground)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Label.displayName = "Label";

export { Label };
