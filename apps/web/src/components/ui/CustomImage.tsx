'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface CustomImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export function CustomImage({ src, alt, fallbackSrc = '/placeholder.jpg', ...props }: CustomImageProps) {
  const [error, setError] = useState(false);

  // If no src is provided, immediately use fallback
  const imageSrc = !src || error ? fallbackSrc : src;

  return (
    <Image
      src={imageSrc}
      alt={alt || 'Image'}
      onError={() => setError(true)}
      {...props}
    />
  );
}
