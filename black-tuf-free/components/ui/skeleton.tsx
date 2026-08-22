import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-md bg-muted", className)} {...props} />
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
