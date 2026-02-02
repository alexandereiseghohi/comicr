"use client";
import { useCallback, useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  className?: string;
  direction?: "left" | "right";
  items: {
    id?: number | string;
    image?: string;
    name?: string;
    quote?: string;
    title?: string;
  }[];
  pauseOnHover?: boolean;
  speed?: "fast" | "normal" | "slow";
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const hasAnimated = useRef(false);

  const getDirection = useCallback(() => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  }, [direction]);

  const getSpeed = useCallback(() => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  }, [speed]);

  // Use useLayoutEffect with direct DOM manipulation to avoid setState warnings
  useLayoutEffect(() => {
    if (hasAnimated.current) return;
    if (!containerRef.current || !scrollerRef.current) return;

    const scrollerContent = Array.from(scrollerRef.current.children);
    for (const item of scrollerContent) {
      const duplicatedItem = item.cloneNode(true);
      scrollerRef.current?.appendChild(duplicatedItem);
    }

    getDirection();
    getSpeed();
    hasAnimated.current = true;
    // Directly add animation class to DOM instead of using setState
    scrollerRef.current.classList.add("animate-scroll");
  }, [getDirection, getSpeed]);

  return (
    <div
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden mask-[linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
      ref={containerRef}
    >
      <ul
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        ref={scrollerRef}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-87.5 max-w-full shrink-0 rounded-2xl border border-b-0 border-slate-700 px-8 py-6 md:w-112.5"
            key={item.id || item.name || idx}
            style={{
              background: "linear-gradient(180deg, var(--slate-800), var(--slate-900)",
            }}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              />
              {item.image && (
                <div className="relative z-20 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={item.name || "Card image"}
                    className="h-40 w-full rounded-lg object-cover"
                    src={item.image}
                  />
                </div>
              )}
              {item.quote && (
                <span className="relative z-20 text-sm leading-[1.6] font-normal text-gray-100">{item.quote}</span>
              )}
              <div className="relative z-20 mt-6 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  <span className="text-sm leading-[1.6] font-normal text-gray-400">{item.name}</span>
                  <span className="text-sm leading-[1.6] font-normal text-gray-400">{item.title}</span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
