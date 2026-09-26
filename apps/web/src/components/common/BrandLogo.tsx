'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  lang?: string;
  variant?: 'full' | 'icon' | 'auto';
  className?: string;
  imageClassName?: string;
  href?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export function BrandLogo({
  lang = 'en',
  variant = 'full',
  className,
  imageClassName,
  href,
  width,
  height,
  onClick,
}: BrandLogoProps) {
  const isBn = lang === 'bn';

  const logoSrc =
    variant === 'icon'
      ? '/icon.svg'
      : isBn
      ? '/logo-bn.svg'
      : '/logo-en.svg';

  const defaultWidth = variant === 'icon' ? 36 : 140;
  const defaultHeight = variant === 'icon' ? 36 : 42;

  const content = (
    <div className={cn('inline-flex items-center gap-2 select-none', className)}>
      <Image
        src={logoSrc}
        alt={isBn ? 'গ্রামের বাজার' : 'Gramer Bazar'}
        width={width || defaultWidth}
        height={height || defaultHeight}
        priority
        className={cn('object-contain', imageClassName)}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex items-center focus-visible:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}

export default BrandLogo;
