"use client";

import Zoom, { type ControlledProps, type UncontrolledProps } from "react-medium-image-zoom";

import { cn } from "@/lib/utils";
import "react-medium-image-zoom/dist/styles.css";

export type ImageZoomProps = UncontrolledProps & {
  backdropClassName?: string;
  className?: string;
  isZoomed?: ControlledProps["isZoomed"];
  onZoomChange?: ControlledProps["onZoomChange"];
};

export const ImageZoom = ({ className, backdropClassName, ...props }: ImageZoomProps) => (
  <div
    className={cn(
      "relative",
      "**:data-rmiz-ghost:pointer-events-none **:data-rmiz-ghost:absolute",
      "**:data-rmiz-btn-zoom:bg-foreground/70 **:data-rmiz-btn-zoom:text-background **:data-rmiz-btn-zoom:m-0 **:data-rmiz-btn-zoom:size-10 **:data-rmiz-btn-zoom:touch-manipulation **:data-rmiz-btn-zoom:appearance-none **:data-rmiz-btn-zoom:rounded-[50%] **:data-rmiz-btn-zoom:border-none **:data-rmiz-btn-zoom:p-2 **:data-rmiz-btn-zoom:outline-offset-2",
      "**:data-rmiz-btn-unzoom:bg-foreground/70 **:data-rmiz-btn-unzoom:text-background **:data-rmiz-btn-unzoom:m-0 **:data-rmiz-btn-unzoom:size-10 **:data-rmiz-btn-unzoom:touch-manipulation **:data-rmiz-btn-unzoom:appearance-none **:data-rmiz-btn-unzoom:rounded-[50%] **:data-rmiz-btn-unzoom:border-none **:data-rmiz-btn-unzoom:p-2 **:data-rmiz-btn-unzoom:outline-offset-2",
      "**:data-rmiz-btn-zoom:not(:focus):not(:active):pointer-events-none **:data-rmiz-btn-zoom:not(:focus):not(:active):absolute **:data-rmiz-btn-zoom:not(:focus):not(:active):size-px **:data-rmiz-btn-zoom:not(:focus):not(:active):overflow-hidden **:data-rmiz-btn-zoom:not(:focus):not(:active):whitespace-nowrap **:data-rmiz-btn-zoom:not(:focus):not(:active):[clip-path:inset(50%)] **:data-rmiz-btn-zoom:not(:focus):not(:active):[clip:rect(0_0_0_0)]",
      "**:data-rmiz-btn-zoom:absolute **:data-rmiz-btn-zoom:start-auto **:data-rmiz-btn-zoom:end-2.5 **:data-rmiz-btn-zoom:top-2.5 **:data-rmiz-btn-zoom:bottom-auto **:data-rmiz-btn-zoom:cursor-zoom-in",
      "**:data-rmiz-btn-unzoom:absolute **:data-rmiz-btn-unzoom:start-auto **:data-rmiz-btn-unzoom:end-5 **:data-rmiz-btn-unzoom:top-5 **:data-rmiz-btn-unzoom:bottom-auto **:data-rmiz-btn-unzoom:z-1 **:data-rmiz-btn-unzoom:cursor-zoom-out",
      "**:data-rmiz-content='found'_img:cursor-zoom-in",
      "**:data-rmiz-content='found'_svg:cursor-zoom-in",
      "**:data-rmiz-content='found'_[role='img']:cursor-zoom-in",
      "**:data-rmiz-content='found'_[data-zoom]:cursor-zoom-in",
      className
    )}
  >
    <Zoom
      classDialog={cn(
        "[&::backdrop]:hidden",
        "[&[open]]:fixed [&[open]]:m-0 [&[open]]:h-dvh [&[open]]:max-h-none [&[open]]:w-dvw [&[open]]:max-w-none [&[open]]:overflow-hidden [&[open]]:border-0 [&[open]]:bg-transparent [&[open]]:p-0",
        "[&_[data-rmiz-modal-overlay]]:absolute [&_[data-rmiz-modal-overlay]]:inset-0 [&_[data-rmiz-modal-overlay]]:transition-all",
        '[&_[data-rmiz-modal-overlay="hidden"]]:bg-transparent',
        '[&_[data-rmiz-modal-overlay="visible"]]:bg-background/80 [&_[data-rmiz-modal-overlay="visible"]]:backdrop-blur-md',
        "[&_[data-rmiz-modal-content]]:relative [&_[data-rmiz-modal-content]]:size-full",
        "[&_[data-rmiz-modal-img]]:absolute [&_[data-rmiz-modal-img]]:origin-top-left [&_[data-rmiz-modal-img]]:cursor-zoom-out [&_[data-rmiz-modal-img]]:transition-transform",
        "motion-reduce:[&_[data-rmiz-modal-img]]:transition-none motion-reduce:[&_[data-rmiz-modal-overlay]]:transition-none",
        backdropClassName
      )}
      {...props}
    />
  </div>
);

// Demo
export function Demo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-8">
      <div className="text-center">
        <ImageZoom>
          <img alt="Sample image" className="max-w-sm rounded-lg shadow-md" src="https://picsum.photos/1200/800" />
        </ImageZoom>
        <p className="text-muted-foreground mt-4 text-sm">Click the image to zoom</p>
      </div>
    </div>
  );
}
