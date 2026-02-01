"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImageViewerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  caption?: string;
  quality?: "low" | "medium" | "high";
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
  const [fitMode, setFitMode] = useState<"width" | "height" | "none">("width");
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
        const distance = Math.hypot(
          touch2!.clientX - touch1!.clientX,
          touch2!.clientY - touch1!.clientY
        );
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
        const distance = Math.hypot(
          touch2!.clientX - touch1!.clientX,
          touch2!.clientY - touch1!.clientY
        );
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
    <div ref={containerRef} className={cn("relative overflow-hidden bg-background", className)}>
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button size="icon" variant="secondary" onClick={handleZoomIn} title="Zoom in (+)">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={handleZoomOut} title="Zoom out (-)">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={toggleFitMode} title="Toggle fit mode">
          {fitMode === "none" ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
        </Button>
        <div className="bg-secondary px-2 py-1 rounded text-xs font-medium text-center">
          {zoom}%
        </div>
      </div>

      {/* Image container */}
      <div
        ref={imageRef}
        className={cn(
          "w-full h-full flex items-center justify-center cursor-grab min-h-100",
          isPanning && "cursor-grabbing",
          zoom > 100 && "cursor-move"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: getImageTransform(),
            transition: isPanning ? "none" : "transform 0.2s ease-out",
          }}
          className={cn(
            fitMode === "width" && "w-full h-auto",
            fitMode === "height" && "h-full w-auto",
            fitMode === "none" && "max-w-full max-h-full"
          )}
        >
          <Image
            src={src}
            alt={alt}
            width={width || 1200}
            height={height || 1800}
            quality={getImageQuality()}
            className="rounded shadow max-w-full object-contain select-none"
            draggable={false}
            priority
          />
        </div>
      </div>

      {caption && (
        <figcaption className="text-sm text-center mt-2 text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </div>
  );
};
