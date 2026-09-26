import React from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No Data Found',
  description = 'There is currently nothing to show here.',
  icon,
  action,
  secondaryAction,
  children,
  className,
}: EmptyStateProps) {
  const renderAction = (act: EmptyStateAction, variant: 'default' | 'outline') => {
    if (act.href) {
      return (
        <Button asChild variant={variant} className="rounded-xl shadow-xs">
          <Link href={act.href}>{act.label}</Link>
        </Button>
      );
    }
    return (
      <Button onClick={act.onClick} variant={variant} className="rounded-xl shadow-xs">
        {act.label}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center min-h-[360px] border rounded-3xl bg-muted/15 border-dashed border-border/80 transition-all',
        className
      )}
    >
      <div className="bg-muted/60 p-4 rounded-2xl mb-4 text-muted-foreground ring-1 ring-border/50 shadow-xs">
        {icon || <Inbox className="w-8 h-8 opacity-75" />}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {secondaryAction && renderAction(secondaryAction, 'outline')}
          {action && renderAction(action, 'default')}
        </div>
      )}
      {children && <div className="mt-6 w-full flex justify-center">{children}</div>}
    </div>
  );
}
