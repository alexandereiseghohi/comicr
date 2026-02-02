import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

("use client");
export const HoverEffect = ({
  items,
  className,
}: {
  className?: string;
  items: {
    description: string;
    image?: string;
    link: string;
    title: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);

  return (
    <div className={cn("grid grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, idx) => (
        <Link
          className="group relative block h-full w-full p-2"
          href={item?.link}
          key={item?.link}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                className="absolute inset-0 block h-full w-full rounded-3xl bg-neutral-200 dark:bg-slate-800/[0.8]"
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
                initial={{ opacity: 0 }}
                layoutId="hoverBackground"
              />
            )}
          </AnimatePresence>
          <Card>
            {item.image && <CardImage alt={item.title} src={item.image} />}
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const Card = ({ className, children }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={cn(
        "relative z-20 h-full w-full overflow-hidden rounded-2xl border border-transparent bg-black p-4 group-hover:border-slate-700 dark:border-white/[0.2]",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export const CardImage = ({ src, alt, className }: { alt: string; className?: string; src: string }) => {
  return (
    <div className={cn("relative mb-4 h-48 w-full overflow-hidden rounded-lg", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        src={src}
      />
    </div>
  );
};

export const CardTitle = ({ className, children }: { children: React.ReactNode; className?: string }) => {
  return <h4 className={cn("mt-4 font-bold tracking-wide text-zinc-100", className)}>{children}</h4>;
};

export const CardDescription = ({ className, children }: { children: React.ReactNode; className?: string }) => {
  return <p className={cn("mt-8 text-sm leading-relaxed tracking-wide text-zinc-400", className)}>{children}</p>;
};
