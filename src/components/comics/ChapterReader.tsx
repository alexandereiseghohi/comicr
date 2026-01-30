import Image from "next/image";
import React from "react";

interface ChapterReaderProps {
  title: string;
  pages: string[];
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({ title, pages }) => (
  <section aria-label="Chapter Reader">
    <h2 className="text-xl font-bold mb-2">{title}</h2>
    <div className="flex flex-col gap-4">
      {pages.map((src, idx) => (
        <Image
          key={idx}
          src={src}
          alt={`Page ${idx + 1} of ${title}`}
          className="rounded shadow max-w-full"
          width={800}
          height={1200}
          loading="lazy"
        />
      ))}
    </div>
  </section>
);
