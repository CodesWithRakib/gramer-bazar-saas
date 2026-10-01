'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ToastItemData, ToastType } from './types';
import { toastStore } from './toast-store';

interface ToastItemProps {
  toast: ToastItemData;
}

interface ToastTypeStyle {
  barClass: string;
  iconBgClass: string;
  iconColorClass: string;
  badgeClass: string;
  defaultIcon: React.ElementType;
}

const TYPE_STYLES: Record<ToastType, ToastTypeStyle> = {
  success: {
    barClass: 'bg-success',
    iconBgClass: 'bg-success/15 border-success/25',
    iconColorClass: 'text-success',
    badgeClass: 'bg-success/10 text-success border-success/20',
    defaultIcon: CheckCircle2,
  },
  error: {
    barClass: 'bg-destructive',
    iconBgClass: 'bg-destructive/15 border-destructive/25',
    iconColorClass: 'text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    defaultIcon: AlertCircle,
  },
  warning: {
    barClass: 'bg-warning',
    iconBgClass: 'bg-warning/15 border-warning/25',
    iconColorClass: 'text-warning',
    badgeClass: 'bg-warning/10 text-warning border-warning/20',
    defaultIcon: AlertTriangle,
  },
  info: {
    barClass: 'bg-info',
    iconBgClass: 'bg-info/15 border-info/25',
    iconColorClass: 'text-info',
    badgeClass: 'bg-info/10 text-info border-info/20',
    defaultIcon: Info,
  },
  loading: {
    barClass: 'bg-primary',
    iconBgClass: 'bg-primary/15 border-primary/25',
    iconColorClass: 'text-primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    defaultIcon: Loader2,
  },
  default: {
    barClass: 'bg-muted-foreground/50',
    iconBgClass: 'bg-muted border-border',
    iconColorClass: 'text-foreground',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    defaultIcon: Info,
  },
};

export function ToastItem({ toast }: ToastItemProps) {
  const {
    id,
    type,
    title,
    description,
    badge,
    icon: customIcon,
    duration,
    action,
    cancel,
    link,
    customContent,
    isDismissing,
    className = '',
  } = toast;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger smooth enter animation on next microtask
    const timer = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // Custom rendered toast
  if (customContent) {
    return (
      <div
        className={`w-full transition-all duration-240 ease-out ${
          isMounted && !isDismissing
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-2 scale-96'
        } ${className}`}
      >
        {customContent(id)}
      </div>
    );
  }

  const style = TYPE_STYLES[type] || TYPE_STYLES.default;
  const IconComponent = style.defaultIcon;
  const isSpinning = type === 'loading';
  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  const handleDismiss = () => {
    toastStore.dismiss(id);
  };

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`group/toast relative w-full overflow-hidden rounded-xl border border-border/80 bg-card/95 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 text-card-foreground select-none transition-all duration-240 ease-out ${
        isMounted && !isDismissing
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-2 scale-96'
      } ${className}`}
    >
      <div className="flex items-start gap-3 p-3.5 pe-9">
        {/* Subtle Brand/Semantic Accent Pillar */}
        <div
          aria-hidden="true"
          className={`absolute top-0 bottom-0 start-0 w-1 ${style.barClass}`}
        />

        {/* Semantic Icon Badge */}
        <div
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5 shadow-2xs ${style.iconBgClass} ${style.iconColorClass}`}
        >
          {customIcon ? (
            customIcon
          ) : (
            <IconComponent className={`w-4 h-4 stroke-[2.4] ${isSpinning ? 'animate-spin' : ''}`} />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {title && (
              <h4 className="text-sm font-semibold tracking-tight text-foreground leading-snug break-words">
                {title}
              </h4>
            )}
            {badge && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${style.badgeClass}`}
              >
                {badge}
              </span>
            )}
          </div>

          {description && (
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed break-words font-normal">
              {description}
            </div>
          )}

          {/* Action / Link / Cancel Controls */}
          {(action || link || cancel) && (
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {action && (
                <button
                  type="button"
                  onClick={(e) => {
                    action.onClick(e);
                    handleDismiss();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </button>
              )}

              {link && (
                <Link
                  href={link.href}
                  target={link.external ? '_blank' : '_self'}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={handleDismiss}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors"
                >
                  <span>{link.label}</span>
                  {link.external ? (
                    <ExternalLink className="w-3 h-3" />
                  ) : (
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  )}
                </Link>
              )}

              {cancel && (
                <button
                  type="button"
                  onClick={() => {
                    cancel.onClick?.();
                    handleDismiss();
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {cancel.label || 'Dismiss'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Close notification"
        className="absolute top-2.5 end-2.5 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Optional Animated Timeout Progress Bar */}
      {duration !== Infinity && duration > 0 && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-0.5 bg-muted/40 overflow-hidden"
        >
          <div
            className={`h-full ${style.barClass} opacity-60 origin-left motion-reduce:hidden`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
