import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  isBn?: boolean;
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  secondaryAction,
  isBn = false,
  className,
}: ErrorStateProps) {
  const defaultTitle = title || (isBn ? 'একটি সমস্যা হয়েছে' : 'Something went wrong');
  const defaultMessage =
    message ||
    (isBn
      ? 'অনুরোধটি সম্পন্ন করা যায়নি। দয়া করে পুনরায় চেষ্টা করুন।'
      : 'An unexpected error occurred. Please try again later.');
  const defaultRetryLabel = retryLabel || (isBn ? 'আবার চেষ্টা করুন' : 'Try Again');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center min-h-[360px] border rounded-3xl bg-destructive/5 border-destructive/20 transition-all',
        className
      )}
    >
      <div className="bg-destructive/10 p-4 rounded-2xl mb-4 text-destructive ring-1 ring-destructive/20 shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{defaultTitle}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">{defaultMessage}</p>
      {(onRetry || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {secondaryAction && (
            secondaryAction.href ? (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button onClick={secondaryAction.onClick} variant="outline" className="rounded-xl">
                {secondaryAction.label}
              </Button>
            )
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{defaultRetryLabel}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
