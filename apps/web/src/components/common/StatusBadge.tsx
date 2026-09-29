import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Centralised status tone system.
 *
 * Every status pill in the app (orders, payments, deliveries, disputes,
 * payouts, applications) should render through this component so tones stay
 * consistent and remain readable in both light and dark themes.
 *
 * Tones are named semantically rather than by colour so pages never pick a
 * random palette. Text colours stay on the `-700` / `-400` scale for contrast.
 */
export type StatusTone = 'neutral' | 'info' | 'progress' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'bg-muted text-muted-foreground dark:bg-muted/60',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  progress: 'bg-primary/10 text-primary dark:bg-primary/15',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  danger: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
};

export interface StatusBadgeProps {
  label: React.ReactNode;
  tone?: StatusTone;
  icon?: React.ReactNode;
  className?: string;
}

export function StatusBadge({ label, tone = 'neutral', icon, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONE_CLASSES[tone],
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}
