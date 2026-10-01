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
  glowClass: string;
  iconClass: string;
  badgeClass: string;
  defaultIcon: React.ElementType;
}

const TYPE_STYLES: Record<ToastType, ToastTypeStyle> = {
  success: {
    barClass: 'gb-toast-bar-success',
    glowClass: 'gb-toast-glow-success',
    iconClass: 'gb-toast-icon-success',
    badgeClass: 'gb-toast-badge-success',
    defaultIcon: CheckCircle2,
  },
  error: {
    barClass: 'gb-toast-bar-error',
    glowClass: 'gb-toast-glow-error',
    iconClass: 'gb-toast-icon-error',
    badgeClass: 'gb-toast-badge-error',
    defaultIcon: AlertCircle,
  },
  warning: {
    barClass: 'gb-toast-bar-warning',
    glowClass: 'gb-toast-glow-warning',
    iconClass: 'gb-toast-icon-warning',
    badgeClass: 'gb-toast-badge-warning',
    defaultIcon: AlertTriangle,
  },
  info: {
    barClass: 'gb-toast-bar-info',
    glowClass: 'gb-toast-glow-info',
    iconClass: 'gb-toast-icon-info',
    badgeClass: 'gb-toast-badge-info',
    defaultIcon: Info,
  },
  loading: {
    barClass: 'gb-toast-bar-loading',
    glowClass: 'gb-toast-glow-loading',
    iconClass: 'gb-toast-icon-loading',
    badgeClass: 'gb-toast-badge-loading',
    defaultIcon: Loader2,
  },
  default: {
    barClass: 'gb-toast-bar-default',
    glowClass: 'gb-toast-glow-default',
    iconClass: 'gb-toast-icon-default',
    badgeClass: 'gb-toast-badge-default',
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
      className={`group/toast relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6),0_4px_16px_-4px_rgba(0,0,0,0.3)] text-card-foreground select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isMounted && !isDismissing
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
      } ${className}`}
    >
      {/* Subtle Luminous Ambient Radial Wash */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-10 -start-10 h-32 w-32 rounded-full blur-2xl transition-opacity duration-500 ${style.glowClass}`}
      />

      <div className="relative flex items-start gap-3.5 p-3.5 pe-9">
        {/* Handcrafted Brand/Semantic Accent Pillar */}
        <div
          aria-hidden="true"
          className={`absolute top-0 bottom-0 start-0 w-1 ${style.barClass}`}
        />

        {/* Semantic Icon Badge */}
        <div
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border mt-0.5 shadow-2xs transition-transform duration-200 group-hover/toast:scale-105 ${style.iconClass}`}
        >
          {customIcon ? (
            customIcon
          ) : (
            <IconComponent className={`w-4 h-4 stroke-[2.3] ${isSpinning ? 'animate-spin' : ''}`} />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {title && (
              <h4 className="text-[13.5px] font-semibold tracking-tight text-foreground leading-snug break-words">
                {title}
              </h4>
            )}
            {badge && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${style.badgeClass}`}
              >
                {badge}
              </span>
            )}
          </div>

          {description && (
            <div className="text-xs text-muted-foreground/90 mt-1 leading-relaxed break-words font-normal">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs transition-all active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
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
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
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
        className="absolute top-2.5 end-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
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
            className={`h-full ${style.barClass} opacity-85 origin-left motion-reduce:hidden group-hover/toast:[animation-play-state:paused]`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
