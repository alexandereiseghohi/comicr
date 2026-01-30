import Image from "next/image";
import React from "react";

interface ImageViewerProps {
  src: string;
  alt: string;
  caption?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, caption }) => (
  <figure>
    <Image
      src={src}
      alt={alt}
      className="rounded shadow max-w-full"
      width={800}
      height={1200}
      loading="lazy"
    />
    {caption && <figcaption className="text-sm text-center mt-2">{caption}</figcaption>}
  </figure>
);
