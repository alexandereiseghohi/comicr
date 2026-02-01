"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  AlignJustify,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  HelpCircle,
  Maximize,
  Minimize,
  Settings,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageViewer } from "./ImageViewer";

interface ChapterReaderProps {
  title: string;
  pages: string[];
  onPageChange?: (pageIndex: number) => void;
  onComplete?: () => void;
  initialPage?: number;
  quality?: "low" | "medium" | "high";
  backgroundMode?: "white" | "dark" | "sepia";
  readingMode?: "vertical" | "horizontal";
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  title,
  pages,
  onPageChange,
  onComplete,
  initialPage = 0,
  quality = "medium",
  backgroundMode: propBackgroundMode,
  readingMode: propReadingMode,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // State  const [currentPage, setCurrentPage] = useState(initialPage);
  const [mode, setMode] = useState<"vertical" | "horizontal">(
    propReadingMode || (isMobile ? "vertical" : "vertical")
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isAutoHide, setIsAutoHide] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls in full-screen
  const resetAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }

    if (isFullScreen) {
      setIsAutoHide(false);
      autoHideTimerRef.current = setTimeout(() => {
        setIsAutoHide(true);
      }, 3000);
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (isFullScreen) {
      resetAutoHideTimer();
    }
    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
    };
  }, [isFullScreen, resetAutoHideTimer]);

  // Page navigation
  const goToPage = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < pages.length) {
        setCurrentPage(pageIndex);
        onPageChange?.(pageIndex);

        if (pageIndex === pages.length - 1) {
          onComplete?.();
        }
      }
    },
    [pages.length, onPageChange, onComplete]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const jumpToPercentage = useCallback(
    (percentage: number) => {
      const pageIndex = Math.floor((pages.length * percentage) / 100);
      goToPage(pageIndex);
    },
    [pages.length, goToPage]
  );

  // Full-screen mode
  const toggleFullScreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
      // Request landscape lock on mobile
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock("landscape").catch(() => {});
        } catch (error) {
          // Ignore errors
        }
      }
    } else {
      await document.exitFullscreen();
      setIsFullScreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if focused on input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (mode === "horizontal") {
            previousPage();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (mode === "horizontal") {
            nextPage();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (mode === "horizontal") {
            previousPage();
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (mode === "horizontal") {
            nextPage();
          }
          break;
        case " ":
          e.preventDefault();
          if (e.shiftKey) {
            if (mode === "vertical") {
              window.scrollBy(0, -window.innerHeight);
            } else {
              previousPage();
            }
          } else {
            if (mode === "vertical") {
              window.scrollBy(0, window.innerHeight);
            } else {
              nextPage();
            }
          }
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullScreen();
          break;
        case "s":
        case "S":
          e.preventDefault();
          setShowSettings(true);
          break;
        case "Escape":
          if (showSettings) {
            setShowSettings(false);
          } else if (isFullScreen) {
            document.exitFullscreen();
          }
          break;
        case "Home":
          e.preventDefault();
          goToPage(0);
          break;
        case "End":
          e.preventDefault();
          goToPage(pages.length - 1);
          break;
        case "?":
          e.preventDefault();
          setShowHelp(true);
          break;
        default:
          // Number keys 1-9 for jumping to percentages
          if (e.key >= "1" && e.key <= "9") {
            e.preventDefault();
            const percentage = parseInt(e.key) * 10;
            jumpToPercentage(percentage);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    mode,
    currentPage,
    previousPage,
    nextPage,
    toggleFullScreen,
    goToPage,
    jumpToPercentage,
    showSettings,
    isFullScreen,
  ]);

  // Background colors
  const backgroundColors = {
    white: "bg-white",
    dark: "bg-gray-900",
    sepia: "bg-amber-50",
  };

  // Swipe gestures for horizontal mode (mobile)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (mode === "horizontal" && e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0]!.clientX,
          y: e.touches[0]!.clientY,
        };
      }
    },
    [mode]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (mode === "horizontal" && touchStartRef.current && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0]!.clientX - touchStartRef.current.x;
        const deltaY = Math.abs(e.changedTouches[0]!.clientY - touchStartRef.current.y);

        // Only swipe if horizontal movement is greater than vertical
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
          if (deltaX > 0) {
            previousPage();
          } else {
            nextPage();
          }
        }
        touchStartRef.current = null;
      }
    },
    [mode, previousPage, nextPage]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative min-h-screen transition-colors", backgroundColors[background])}
      onMouseMove={resetAutoHideTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Controls */}
      <div
        className={cn(
          "sticky top-0 z-20 bg-background/95 backdrop-blur border-b p-4 flex items-center justify-between gap-4 transition-transform duration-300",
          isAutoHide && "-translate-y-full"
        )}
      >
        <h2 className="text-xl font-bold truncate flex-1">{title}</h2>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMode(mode === "vertical" ? "horizontal" : "vertical")}
            title={`Switch to ${mode === "vertical" ? "horizontal" : "vertical"} mode`}
          >
            {mode === "vertical" ? (
              <AlignJustify className="h-4 w-4" />
            ) : (
              <Grid3x3 className="h-4 w-4" />
            )}
          </Button>

          {/* Settings */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(true)}
            title="Settings (S)"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Help */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowHelp(true)}
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Full screen */}
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullScreen}
            title="Toggle fullscreen (F)"
          >
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Vertical Mode */}
      {mode === "vertical" && (
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-2">
          {pages.map((src, idx) => (
            <div key={idx} className="relative">
              <ImageViewer
                src={src}
                alt={`Page ${idx + 1} of ${title}`}
                quality={quality}
                className="mb-2"
              />
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Mode */}
      {mode === "horizontal" && (
        <div className="flex items-center justify-center min-h-[calc(100vh-73px)] relative">
          {/* Previous button */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute left-4 z-10 h-12 w-12",
              currentPage === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={previousPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          {/* Current page */}
          <div className="flex-1 flex items-center justify-center p-8">
            <ImageViewer
              src={pages[currentPage] || ""}
              alt={`Page ${currentPage + 1} of ${title}`}
              quality={quality}
              className="max-h-[calc(100vh-100px)]"
            />
          </div>

          {/* Next button */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute right-4 z-10 h-12 w-12",
              currentPage === pages.length - 1 && "opacity-50 cursor-not-allowed"
            )}
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Page indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            {currentPage + 1} / {pages.length}
          </div>
        </div>
      )}

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Navigate and control the reader with these shortcuts
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <p className="font-medium">← / →</p>
              <p className="text-sm text-muted-foreground">Previous / Next page</p>
            </div>
            <div>
              <p className="font-medium">Space</p>
              <p className="text-sm text-muted-foreground">Page down / Next page</p>
            </div>
            <div>
              <p className="font-medium">Shift + Space</p>
              <p className="text-sm text-muted-foreground">Page up / Previous page</p>
            </div>
            <div>
              <p className="font-medium">F</p>
              <p className="text-sm text-muted-foreground">Toggle fullscreen</p>
            </div>
            <div>
              <p className="font-medium">S</p>
              <p className="text-sm text-muted-foreground">Open settings</p>
            </div>
            <div>
              <p className="font-medium">1-9</p>
              <p className="text-sm text-muted-foreground">Jump to 10%-90%</p>
            </div>
            <div>
              <p className="font-medium">Home / End</p>
              <p className="text-sm text-muted-foreground">First / Last page</p>
            </div>
            <div>
              <p className="font-medium">+/-</p>
              <p className="text-sm text-muted-foreground">Zoom in / out</p>
            </div>
            <div>
              <p className="font-medium">0</p>
              <p className="text-sm text-muted-foreground">Reset zoom</p>
            </div>
            <div>
              <p className="font-medium">ESC</p>
              <p className="text-sm text-muted-foreground">Exit fullscreen / Close dialogs</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
