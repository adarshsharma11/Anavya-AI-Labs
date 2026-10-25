"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type StarRatingProps = {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly size?: "md" | "lg";
  readonly labelledBy?: string;
};

const SIZES = {
  md: "h-7 w-7",
  lg: "h-9 w-9",
} as const;

export function StarRating({
  value,
  onChange,
  size = "md",
  labelledBy,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="flex items-center justify-center gap-2"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= active;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="rounded-md p-0.5 text-primary/35 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={cn(SIZES[size], filled && "fill-primary text-primary")}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
