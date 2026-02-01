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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useRef, useState } from "react";

interface ReadingProgressTrackerProps {
  comicId: number;
  chapterId: number;
  totalPages: number;
  currentPage?: number;
  scrollPercentage?: number;
  mode: "vertical" | "horizontal";
  onRestore?: (pageIndex: number) => void;
}

export function ReadingProgressTracker({
  comicId,
  chapterId,
  totalPages,
  currentPage = 0,
  scrollPercentage = 0,
  mode,
  onRestore,
}: ReadingProgressTrackerProps) {
  const { toast } = useToast();
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<{
    pageIndex: number;
    percentage: number;
  } | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const saveTimerRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<{ page: number; scroll: number }>({ page: 0, scroll: 0 });

  // Load existing progress on mount
  useEffect(() => {
    loadProgress();
  }, [comicId, chapterId]);

  const loadProgress = async () => {
    try {
      // TODO: Fetch reading progress from API
      // For now, check localStorage as fallback
      const key = `progress-${comicId}-${chapterId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        // Only show resume dialog if there's significant progress
        if (data.pageIndex > 0 || data.percentage > 10) {
          setSavedProgress(data);
          setShowResumeDialog(true);
        }
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  };

  const saveProgress = useCallback(
    async (pageIndex: number, percentage: number, immediate = false) => {
      // Don't save if values haven't changed significantly
      const pageChanged = pageIndex !== lastSaveRef.current.page;
      const scrollChanged = Math.abs(percentage - lastSaveRef.current.scroll) > 5;

      if (!immediate && !pageChanged && !scrollChanged) {
        return;
      }

      lastSaveRef.current = { page: pageIndex, scroll: percentage };

      try {
        // Save to localStorage immediately
        const key = `progress-${comicId}-${chapterId}`;
        localStorage.setItem(key, JSON.stringify({ pageIndex, percentage, timestamp: Date.now() }));

        // TODO: Save to database via API
        // await saveReadingProgressAction({
        //   comicId,
        //   chapterId,
        //   currentImageIndex: pageIndex,
        //   scrollPercentage: percentage,
        //   progressPercent: Math.round((pageIndex / totalPages) * 100),
        // });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    },
    [comicId, chapterId, totalPages]
  );

  // Debounced save - triggers 30s after last interaction
  const debouncedSave = useCallback(
    (pageIndex: number, percentage: number) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        saveProgress(pageIndex, percentage, false);
      }, 30000); // 30 seconds
    },
    [saveProgress]
  );

  // Track progress changes
  useEffect(() => {
    const progress =
      mode === "horizontal" ? Math.round((currentPage / totalPages) * 100) : scrollPercentage;

    setCurrentProgress(progress);

    // Debounced save
    debouncedSave(currentPage, scrollPercentage);

    // Save immediately on page change in horizontal mode
    if (mode === "horizontal") {
      saveProgress(currentPage, scrollPercentage, true);
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [currentPage, scrollPercentage, mode, totalPages, debouncedSave, saveProgress]);

  // Save on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress(currentPage, scrollPercentage, true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentPage, scrollPercentage, saveProgress]);

  // Handle resume
  const handleResume = () => {
    if (savedProgress && onRestore) {
      onRestore(savedProgress.pageIndex);
      toast({
        title: "Progress restored",
        description: `Resumed from page ${savedProgress.pageIndex + 1}`,
      });
    }
    setShowResumeDialog(false);
  };

  const handleStartFromBeginning = () => {
    setShowResumeDialog(false);
  };

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1">
        <Progress value={currentProgress} className="h-full rounded-none" />
      </div>

      {/* Resume dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume Reading?</DialogTitle>
            <DialogDescription>
              You were last on page {savedProgress ? savedProgress.pageIndex + 1 : 1} of{" "}
              {totalPages}. Would you like to continue from where you left off?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleStartFromBeginning}>
              Start from Beginning
            </Button>
            <Button onClick={handleResume}>Resume Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
