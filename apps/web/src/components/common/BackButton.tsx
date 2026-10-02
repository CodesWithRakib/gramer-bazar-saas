'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BackButtonProps {
  href: string;
  label?: string;
  labelBn?: string;
  lang?: string;
  className?: string;
}

export function BackButton({
  href,
  label = 'Back',
  labelBn = 'ফিরে যান',
  lang = 'en',
  className,
}: BackButtonProps) {
  const isBn = lang === 'bn';

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(
        'group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground -ms-2 mb-3 transition-colors',
        className
      )}
    >
      <Link href={href}>
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
        <span>{isBn ? labelBn : label}</span>
      </Link>
    </Button>
  );
}

export default BackButton;
