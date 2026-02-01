"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, Star, X } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  comicId: number;
  initialRating?: number;
  initialReview?: string;
  showReview?: boolean;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number, review?: string) => void;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function StarRating({
  comicId,
  initialRating = 0,
  initialReview = "",
  showReview = true,
  size = "md",
  interactive = true,
  onRatingChange,
}: StarRatingProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(initialReview);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayRating = hoverRating || rating;

  const handleStarClick = (value: number) => {
    if (!interactive) return;

    if (value === rating) {
      // Clicking same star removes rating
      setRating(0);
      handleSave(0, "");
    } else {
      setRating(value);
      if (showReview) {
        setShowDialog(true);
      } else {
        handleSave(value, "");
      }
    }
  };

  const handleSave = async (newRating: number, newReview: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/comics/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comicId,
          rating: newRating,
          review: newReview || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to save rating",
          variant: "destructive",
        });
        setRating(initialRating);
        return;
      }

      toast({
        title: newRating === 0 ? "Rating Removed" : "Rating Saved",
        description:
          newRating === 0
            ? "Your rating has been removed"
            : `You rated this comic ${newRating} stars`,
      });

      setReview(newReview);
      onRatingChange?.(newRating, newReview);
      setShowDialog(false);
    } catch (error) {
      console.error("Rating save error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setRating(initialRating);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogSave = () => {
    handleSave(rating, review);
  };

  const handleDialogCancel = () => {
    setRating(initialRating);
    setReview(initialReview);
    setShowDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= displayRating;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleStarClick(value)}
              onMouseEnter={() => interactive && setHoverRating(value)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              disabled={!interactive || loading}
              className={cn(
                "transition-all duration-150",
                interactive && "cursor-pointer hover:scale-110",
                !interactive && "cursor-default"
              )}
              aria-label={`Rate ${value} stars`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-slate-300",
                  interactive && "hover:text-yellow-300"
                )}
              />
            </button>
          );
        })}
        {rating > 0 && interactive && (
          <button
            type="button"
            onClick={() => handleStarClick(0)}
            className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Remove rating"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Review Dialog */}
      {showReview && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate This Comic</DialogTitle>
              <DialogDescription>
                You rated this comic {rating} {rating === 1 ? "star" : "stars"}. Add an optional
                review below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Star Display */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={cn(
                      "h-8 w-8",
                      value <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-slate-300"
                    )}
                  />
                ))}
              </div>

              {/* Review Textarea */}
              <div className="space-y-2">
                <Label htmlFor="review">Review (Optional)</Label>
                <Textarea
                  id="review"
                  placeholder="Share your thoughts about this comic..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 text-right">{review.length}/1000 characters</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleDialogSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Rating"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
