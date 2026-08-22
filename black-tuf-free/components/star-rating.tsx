"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  onRate?: (value: number) => void;
  label?: string;
}

export function StarRating({
  rating,
  readOnly = false,
  size = "md",
  onRate,
  label,
}: StarRatingProps) {
  const sizeClass = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }[size];

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => {
          const value = i + 1;
          const filled = value <= rating;
          const half = value - 0.5 === rating;
          return (
            <Star
              key={i}
              className={cn(
                sizeClass,
                "cursor-pointer transition-colors",
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : half
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "fill-transparent text-muted",
                !readOnly && "hover:text-yellow-300"
              )}
              onClick={() => !readOnly && onRate?.(value)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function StarRatingSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }[size];
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={cn(sizeClass, "rounded bg-muted")} />
      ))}
    </div>
  );
}
