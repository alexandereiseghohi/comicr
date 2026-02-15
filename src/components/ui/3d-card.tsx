"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const MouseEnterContext = createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined>(
  undefined
);

export interface CardContainerProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const CardContainer = ({ children, className, containerClassName }: CardContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) {
      return;
    }
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = (_e: React.MouseEvent<HTMLDivElement>) => {
    setIsMouseEntered(true);
    if (!containerRef.current) {
      return;
    }
  };

  const handleMouseLeave = (_e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) {
      return;
    }
    setIsMouseEntered(false);
    containerRef.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn("flex items-center justify-center py-20", containerClassName)}
        style={{
          perspective: "1000px",
        }}
      >
        <div
          className={cn("relative flex items-center justify-center transition-all duration-200 ease-linear", className)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          ref={containerRef}
          role="button"
          style={{
            transformStyle: "preserve-3d",
          }}
          tabIndex={0}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody = ({ children, className }: CardBodyProps) => {
  return <div className={cn("h-96 w-96 transform-3d *:transform-3d", className)}>{children}</div>;
};

export type CardItemProps = {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
} & React.HTMLAttributes<HTMLElement>;

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: CardItemProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    handleAnimations();
  }, [isMouseEntered]);

  const handleAnimations = () => {
    if (!ref.current) {
      return;
    }
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform =
        "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
    }
  };

  return React.createElement(
    Tag,
    {
      ref,
      className: cn("w-fit transition duration-200 ease-linear", className),
      ...rest,
    },
    children
  );
};

export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};

// Demo
export function Demo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <CardContainer containerClassName="py-0">
        <CardBody className="bg-card relative h-auto w-auto rounded-xl border p-6 shadow-xl">
          <CardItem className="text-xl font-bold" translateZ={50}>
            3D Card Effect
          </CardItem>
          <CardItem className="text-muted-foreground mt-2 max-w-sm text-sm" translateZ={60}>
            Hover over this card to see the 3D tilt effect. Elements pop out at different depths.
          </CardItem>
          <CardItem className="mt-4 w-full" translateZ={100}>
            <img alt="Demo" className="h-40 w-full rounded-lg object-cover" src="https://picsum.photos/300/200" />
          </CardItem>
          <div className="mt-4 flex justify-between">
            <CardItem
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
              translateZ={40}
            >
              Learn More
            </CardItem>
            <CardItem className="rounded-lg border px-4 py-2 text-sm font-medium" translateZ={40}>
              Sign Up
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
}
