'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface CustomImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export function resolveImageUrl(src?: string | null, fallback = '/placeholder.jpg'): string {
  if (!src || typeof src !== 'string') return fallback;
  const trimmed = src.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/uploads/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const origin = apiBase.replace(/\/api\/v1\/?$/, '');
    return `${origin}${trimmed}`;
  }
  if (trimmed.startsWith('/')) return trimmed;
  // If it's a relative path with image extension (e.g. "placeholder.jpg")
  if (/^[a-zA-Z0-9_\-./]+\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(trimmed)) {
    return `/${trimmed.replace(/^\.?\//, '')}`;
  }
  // Non-URL strings like emojis or raw text return fallback
  return fallback;
}

export function CustomImage({
  src,
  alt,
  fallbackSrc = '/placeholder.jpg',
  onError,
  unoptimized,
  ...props
}: CustomImageProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [error, setError] = useState(false);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  const resolved = resolveImageUrl(src, fallbackSrc);
  const imageSrc = !src || error ? fallbackSrc : resolved;

  return (
    <Image
      src={imageSrc}
      alt={alt || 'Image'}
      onError={(e) => {
        setError(true);
        if (onError) onError(e);
      }}
      unoptimized={unoptimized}
      {...props}
    />
  );
}

