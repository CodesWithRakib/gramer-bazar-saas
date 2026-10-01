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
  neutral: 'bg-muted text-muted-foreground border border-border/50',
  info: 'bg-info/10 text-info border border-info/20',
  progress: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  danger: 'bg-destructive/10 text-destructive border border-destructive/20',
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
