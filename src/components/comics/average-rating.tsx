"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface AverageRatingProps {
  className?: string;
  rating: number;
  showCount?: boolean;
  size?: "lg" | "md" | "sm";
  totalRatings: number;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function AverageRating({
  rating,
  totalRatings,
  size = "md",
  showCount = true,
  className,
}: AverageRatingProps) {
  // Round to one decimal place
  const displayRating = Math.round(rating * 10) / 10;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")}
            key={`full-${i}`}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={cn(sizeClasses[size], "fill-transparent text-yellow-400")} />
            <div className="absolute inset-0 w-1/2 overflow-hidden">
              <Star className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            className={cn(sizeClasses[size], "fill-transparent text-slate-300")}
            key={`empty-${i}`}
          />
        ))}
      </div>

      {/* Rating text */}
      <div className="flex items-center gap-1">
        <span className={cn("font-semibold text-slate-700", textSizeClasses[size])}>
          {displayRating.toFixed(1)}
        </span>
        {showCount && totalRatings > 0 && (
          <span className={cn("text-slate-500", textSizeClasses[size])}>
            ({totalRatings.toLocaleString()})
          </span>
        )}
      </div>
    </div>
  );
}
