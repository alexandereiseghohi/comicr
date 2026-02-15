"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion, type Transition } from "motion/react";
import * as React from "react";
import { Children } from "react";

import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Define types based on components
type TooltipContentProps = React.ComponentProps<typeof TooltipContent>;

// Avatar Container for motion-based interactions
interface AvatarMotionProps {
  children: React.ReactNode;
  tooltipContent?: React.ReactNode;
  tooltipProps?: Partial<TooltipContentProps>;
  transition: Transition;
  translate: number | string;
  zIndex: number;
}

function AvatarMotionContainer({
  children,
  zIndex,
  translate,
  transition,
  tooltipContent,
  tooltipProps,
}: AvatarMotionProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipTrigger>
        <motion.div
          className="relative"
          data-slot="avatar-container"
          style={{ zIndex }}
          transition={transition}
          whileHover={{
            y: translate,
          }}
        >
          {children}
        </motion.div>
      </TooltipTrigger>
      {tooltipContent && <AvatarGroupTooltip {...tooltipProps}>{tooltipContent}</AvatarGroupTooltip>}
    </TooltipPrimitive.Root>
  );
}

// Avatar Container for CSS-based interactions
interface AvatarCSSProps {
  children: React.ReactNode;
  tooltipContent?: React.ReactNode;
  tooltipProps?: Partial<TooltipContentProps>;
  zIndex: number;
}

function AvatarCSSContainer({ children, zIndex, tooltipContent, tooltipProps }: AvatarCSSProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipTrigger>
        <div
          className="relative transition-transform duration-300 ease-out hover:-translate-y-2"
          data-slot="avatar-container"
          style={{ zIndex }}
        >
          {children}
        </div>
      </TooltipTrigger>
      {tooltipContent && <AvatarGroupTooltip {...tooltipProps}>{tooltipContent}</AvatarGroupTooltip>}
    </TooltipPrimitive.Root>
  );
}

// Avatar Container for stack variant with mask
interface AvatarStackItemProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  size: number;
}

function AvatarStackItem({ children, index, size, className }: AvatarStackItemProps) {
  return (
    <div
      className={cn("size-full shrink-0 overflow-hidden rounded-full", "**:data-[slot='avatar']:size-full", className)}
      style={{
        width: size,
        height: size,
        maskImage: index
          ? `radial-gradient(circle ${size / 2}px at -${size / 4 + size / 10}px 50%, transparent 99%, white 100%)`
          : "",
      }}
    >
      {children}
    </div>
  );
}

type AvatarGroupTooltipProps = TooltipContentProps;

function AvatarGroupTooltip(props: AvatarGroupTooltipProps) {
  return <TooltipContent {...props} />;
}

type AvatarGroupVariant = "css" | "motion" | "stack";

type AvatarGroupProps = Omit<React.ComponentProps<"div">, "translate"> & {
  // Stack-specific props
  animate?: boolean;
  children: React.ReactElement[];
  invertOverlap?: boolean;
  size?: number;
  tooltipProps?: Partial<TooltipContentProps>;
  transition?: Transition;
  translate?: number | string;
  variant?: AvatarGroupVariant;
};

function AvatarGroup({
  ref,
  children,
  className,
  variant = "motion",
  transition = { type: "spring", stiffness: 300, damping: 17 },
  invertOverlap = false,
  translate = "-30%",
  tooltipProps = { side: "top", sideOffset: 24 },
  animate = false,
  size = 40,
  ...props
}: AvatarGroupProps) {
  // Stack variant
  if (variant === "stack") {
    return (
      <div
        className={cn(
          "flex items-center -space-x-1",
          animate && "hover:space-x-0 rtl:hover:space-x-reverse *:transition-all",
          className
        )}
        ref={ref}
        {...props}
      >
        {Children.map(children, (child, index) => {
          if (!child) {
            return null;
          }
          return (
            <AvatarStackItem className={className} index={index} key={index} size={size}>
              {child}
            </AvatarStackItem>
          );
        })}
      </div>
    );
  }

  // Motion and CSS variants with tooltips
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex items-center",
          variant === "css" && "-space-x-3",
          variant === "motion" && "h-8 flex-row -space-x-2",
          className
        )}
        data-slot="avatar-group"
        ref={ref}
        {...props}
      >
        {children?.map((child, index) => {
          const zIndex = invertOverlap ? React.Children.count(children) - index : index;

          if (variant === "motion") {
            return (
              <AvatarMotionContainer
                key={index}
                tooltipProps={tooltipProps}
                transition={transition}
                translate={translate}
                zIndex={zIndex}
              >
                {child}
              </AvatarMotionContainer>
            );
          }

          return (
            <AvatarCSSContainer key={index} tooltipProps={tooltipProps} zIndex={zIndex}>
              {child}
            </AvatarCSSContainer>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

export {
  AvatarGroup,
  AvatarGroupTooltip,
  type AvatarGroupProps,
  type AvatarGroupTooltipProps,
  type AvatarGroupVariant,
};

// Demo
export function Demo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <AvatarGroup variant="motion">
        {[1, 2, 3, 4, 5].map((i) => (
          <img
            alt={`User ${i}`}
            className="border-background size-10 rounded-full border-2"
            key={i}
            src={`https://i.pravatar.cc/64?img=${i}`}
          />
        ))}
      </AvatarGroup>
    </div>
  );
}
