"use client";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  alt: string;
  caption?: string;
  className?: string;
  height?: number;
  quality?: "high" | "low" | "medium";
  src: string;
  width?: number;
}

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 25;

export const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt,
  width,
  height,
  className,
  caption,
  quality = "medium",
}) => {
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"height" | "none" | "width">("width");
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Store zoom in localStorage
  useEffect(() => {
    const storedZoom = localStorage.getItem("reader-zoom");
    if (storedZoom) {
      const zoomValue = parseInt(storedZoom, 10);
      if (zoomValue >= ZOOM_MIN && zoomValue <= ZOOM_MAX) {
        // Initialize zoom from localStorage (one-time on mount)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setZoom(zoomValue);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("reader-zoom", zoom.toString());
  }, [zoom]);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
    setFitMode("none");
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
    setFitMode("none");
  }, []);

  // Reset zoom
  const handleResetZoom = useCallback(() => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
    setFitMode("width");
  }, []);

  // Toggle fit mode
  const toggleFitMode = useCallback(() => {
    if (fitMode === "width") {
      setFitMode("height");
    } else if (fitMode === "height") {
      setFitMode("none");
      setZoom(100);
    } else {
      setFitMode("width");
    }
    setPosition({ x: 0, y: 0 });
  }, [fitMode]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 100) {
        setIsPanning(true);
        setStartPosition({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [zoom, position]
  );

  // Handle mouse move for panning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPosition({
          x: e.clientX - startPosition.x,
          y: e.clientY - startPosition.y,
        });
      }
    },
    [isPanning, startPosition]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle double tap to zoom
  const handleDoubleClick = useCallback(() => {
    if (zoom === 100) {
      setZoom(150);
      setFitMode("none");
    } else {
      handleResetZoom();
    }
  }, [zoom, handleResetZoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if focused on input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          handleResetZoom();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  // Touch gestures for mobile
  const touchStartRef = useRef<{ distance: number; x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch2!.clientX - touch1!.clientX, touch2!.clientY - touch1!.clientY);
        touchStartRef.current = {
          distance,
          x: (touch1!.clientX + touch2!.clientX) / 2,
          y: (touch1!.clientY + touch2!.clientY) / 2,
        };
      } else if (e.touches.length === 1 && zoom > 100) {
        const touch = e.touches[0];
        setIsPanning(true);
        setStartPosition({
          x: touch!.clientX - position.x,
          y: touch!.clientY - position.y,
        });
      }
    },
    [zoom, position]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && touchStartRef.current) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch2!.clientX - touch1!.clientX, touch2!.clientY - touch1!.clientY);
        const delta = distance - touchStartRef.current.distance;
        const newZoom = Math.min(Math.max(zoom + delta / 5, ZOOM_MIN), ZOOM_MAX);
        setZoom(Math.round(newZoom));
        setFitMode("none");
        touchStartRef.current.distance = distance;
      } else if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        const touch = e.touches[0];
        setPosition({
          x: touch!.clientX - startPosition.x,
          y: touch!.clientY - startPosition.y,
        });
      }
    },
    [zoom, isPanning, startPosition]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    setIsPanning(false);
  }, []);

  const getImageTransform = () => {
    let transform = `scale(${zoom / 100})`;
    if (zoom > 100) {
      transform += ` translate(${position.x}px, ${position.y}px)`;
    }
    return transform;
  };

  const getImageQuality = () => {
    switch (quality) {
      case "low":
        return 50;
      case "medium":
        return 75;
      case "high":
        return 95;
      default:
        return 75;
    }
  };

  return (
    <div
      className={cn("bg-background relative overflow-hidden", className)}
      data-testid="image-viewer"
      ref={containerRef}
    >
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2" data-testid="zoom-controls">
        <Button onClick={handleZoomIn} size="icon" title="Zoom in (+)" variant="secondary">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button onClick={handleZoomOut} size="icon" title="Zoom out (-)" variant="secondary">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button onClick={toggleFitMode} size="icon" title="Toggle fit mode" variant="secondary">
          {fitMode === "none" ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
        <div className="bg-secondary rounded px-2 py-1 text-center text-xs font-medium">{zoom}%</div>
      </div>

      {/* Image container */}
      <div
        className={cn(
          "flex h-full min-h-100 w-full cursor-grab items-center justify-center",
          isPanning && "cursor-grabbing",
          zoom > 100 && "cursor-move"
        )}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        ref={imageRef}
      >
        <div
          className={cn(
            fitMode === "width" && "h-auto w-full",
            fitMode === "height" && "h-full w-auto",
            fitMode === "none" && "max-h-full max-w-full"
          )}
          style={{
            transform: getImageTransform(),
            transition: isPanning ? "none" : "transform 0.2s ease-out",
          }}
        >
          <Image
            alt={alt}
            className="max-w-full rounded object-contain shadow select-none"
            draggable={false}
            height={height || 1800}
            priority
            quality={getImageQuality()}
            src={src}
            width={width || 1200}
          />
        </div>
      </div>

      {caption && <figcaption className="text-muted-foreground mt-2 text-center text-sm">{caption}</figcaption>}
    </div>
  );
};
