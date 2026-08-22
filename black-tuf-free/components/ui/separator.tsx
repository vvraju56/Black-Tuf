import * as React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = false, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn(
        "shrink-0 border-0 bg-border",
        orientation === "horizontal"
          ? "h-px w-full"
          : "h-full w-px",
        className
      )}
      {...props}
      aria-orientation={orientation}
      role={decorative ? undefined : "separator"}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
