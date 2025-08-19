import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export function StarRating({ rating, onRatingChange, size = "md", readonly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleClick = (newRating: number) => {
    if (!readonly) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (newRating: number) => {
    if (!readonly) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "transition-colors",
              !readonly && "hover:scale-110 transform transition-transform",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground",
                !readonly && "hover:text-yellow-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}