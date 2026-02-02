"use client"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import React from "react";

import { cn } from "@/lib/utils";

export const Spotlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950",
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
};

export const SpotlightNew = ({
  className,
  fill,
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-1 h-[169%] w-[138%] opacity-0 lg:w-[84%]",
        className,
      )}
      fill="none"
      viewBox="0 0 3787 2842"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          fill={fill || "white"}
          fillOpacity="0.21"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
        />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="2840.26"
          id="filter"
          width="3785.16"
          x="0.860352"
          y="0.838989"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            in="SourceGraphic"
            in2="BackgroundImageFix"
            mode="normal"
            result="shape"
          />
          <feGaussianBlur
            result="effect1_foregroundBlur_1065_8"
            stdDeviation="151"
          />
        </filter>
      </defs>
    </svg>
  );
};

export const SpotlightPreview = () => {
  return (
    <div className="relative flex h-160 w-full overflow-hidden rounded-md bg-black/96 antialiased md:items-center md:justify-center">
      <SpotlightNew
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
        <h1 className="bg-opacity-50 bg-linear-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
          Spotlight <br /> is the new trend.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
          Spotlight effect is a great way to draw attention to a specific part
          of the page. Here, we are drawing the attention towards the text
          section of the page. I don&apos;t know why but I ran out of things to
          write.
        </p>
      </div>
    </div>
  );
};
