"use client";

import Image from "next/image";
import { useState } from "react";
import { NO_IMAGE_FALLBACK } from "@/lib/image-fallback";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
};

export default function ProductImage({ src, alt, ...props }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = src?.trim() || null;
  const showFallback = !imageSrc || failedSrc === imageSrc;

  return (
    <Image
      {...props}
      src={showFallback ? NO_IMAGE_FALLBACK : imageSrc}
      alt={showFallback ? `No image available for ${alt}` : alt}
      unoptimized
      onError={() => {
        if (!showFallback) setFailedSrc(imageSrc);
      }}
    />
  );
}
