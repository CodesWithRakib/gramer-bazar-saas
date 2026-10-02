'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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

interface ToastTypeConfig {
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  accentColor: string;
  progressColor: string;
  defaultIcon: React.ElementType;
}

const TYPE_CONFIG: Record<ToastType, ToastTypeConfig> = {
  success: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBorder: 'ring-emerald-200/60 dark:ring-emerald-800/40',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    progressColor: 'bg-emerald-500',
    defaultIcon: CheckCircle2,
  },
  error: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBorder: 'ring-rose-200/60 dark:ring-rose-800/40',
    accentColor: 'text-rose-600 dark:text-rose-400',
    progressColor: 'bg-rose-500',
    defaultIcon: AlertCircle,
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBorder: 'ring-amber-200/60 dark:ring-amber-800/40',
    accentColor: 'text-amber-600 dark:text-amber-400',
    progressColor: 'bg-amber-500',
    defaultIcon: AlertTriangle,
  },
  info: {
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBorder: 'ring-sky-200/60 dark:ring-sky-800/40',
    accentColor: 'text-sky-600 dark:text-sky-400',
    progressColor: 'bg-sky-500',
    defaultIcon: Info,
  },
  loading: {
    iconBg: 'bg-slate-50 dark:bg-slate-800/40',
    iconColor: 'text-slate-600 dark:text-slate-300',
    iconBorder: 'ring-slate-200/60 dark:ring-slate-700/40',
    accentColor: 'text-slate-600 dark:text-slate-400',
    progressColor: 'bg-slate-400',
    defaultIcon: Loader2,
  },
  default: {
    iconBg: 'bg-slate-50 dark:bg-slate-800/40',
    iconColor: 'text-slate-600 dark:text-slate-300',
    iconBorder: 'ring-slate-200/60 dark:ring-slate-700/40',
    accentColor: 'text-slate-600 dark:text-slate-400',
    progressColor: 'bg-slate-400',
    defaultIcon: Info,
  },
};

const SWIPE_THRESHOLD = 80;

export function ToastItem({ toast: toastData }: ToastItemProps) {
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
  } = toastData;

  const [isMounted, setIsMounted] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ─── Swipe to dismiss ─────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    setSwipeX(deltaX);
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    if (Math.abs(swipeX) > SWIPE_THRESHOLD) {
      toastStore.dismiss(id);
    } else {
      setSwipeX(0);
    }
  }, [swipeX, id]);

  // Custom rendered toast
  if (customContent) {
    return (
      <div
        className={`w-full transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMounted && !isDismissing
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-3 scale-95'
        } ${className}`}
      >
        {customContent(id)}
      </div>
    );
  }

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.default;
  const IconComponent = config.defaultIcon;
  const isSpinning = type === 'loading';
  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  const handleDismiss = () => toastStore.dismiss(id);

  const swipeOpacity = Math.max(0, 1 - Math.abs(swipeX) / 200);
  const swipeStyle = swipeX !== 0
    ? { transform: `translateX(${swipeX}px)`, opacity: swipeOpacity, transition: isSwiping ? 'none' : undefined }
    : undefined;

  return (
    <div
      ref={elementRef}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={swipeStyle}
      className={`group/toast relative w-full overflow-hidden rounded-xl bg-white dark:bg-slate-900
        border border-slate-200/80 dark:border-slate-700/60
        shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)]
        dark:shadow-[0_4px_32px_-4px_rgba(0,0,0,0.5),0_2px_12px_-2px_rgba(0,0,0,0.3)]
        text-slate-900 dark:text-slate-50 select-none
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isMounted && !isDismissing
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-3 scale-[0.97] pointer-events-none'
        } ${className}`}
    >
      <div className="relative flex items-start gap-3 p-3.5 pe-10">
        {/* Semantic Icon */}
        <div
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ring-1 ${config.iconBg} ${config.iconColor} ${config.iconBorder}`}
        >
          {customIcon ? (
            customIcon
          ) : (
            <IconComponent
              className={`w-[18px] h-[18px] stroke-[2.2] ${isSpinning ? 'animate-spin' : ''}`}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2">
            {title && (
              <p className="text-[13.5px] font-semibold leading-snug text-slate-900 dark:text-slate-50 break-words">
                {title}
              </p>
            )}
            {badge && (
              <span
                className={`inline-flex items-center px-1.5 py-px rounded-md text-[10px] font-bold uppercase tracking-wider ${config.iconBg} ${config.accentColor}`}
              >
                {badge}
              </span>
            )}
          </div>

          {description && (
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">
              {description}
            </p>
          )}

          {/* Actions */}
          {(action || link || cancel) && (
            <div className="flex items-center gap-2 mt-2.5">
              {action && (
                <button
                  type="button"
                  onClick={(e) => {
                    action.onClick(e);
                    handleDismiss();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                    bg-slate-900 dark:bg-white text-white dark:text-slate-900
                    hover:bg-slate-800 dark:hover:bg-slate-100
                    shadow-sm transition-all active:scale-[0.97] cursor-pointer
                    focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400`}
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
                  className={`inline-flex items-center gap-1 text-[12px] font-semibold ${config.accentColor} hover:underline transition-colors`}
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
                  className="px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {cancel.label || 'Dismiss'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Close Button — appears on hover */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Close notification"
        className="absolute top-3 end-3 w-6 h-6 rounded-md flex items-center justify-center
          text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer
          opacity-0 group-hover/toast:opacity-100 focus-visible:opacity-100
          focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-300"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress Bar — thin, minimal */}
      {duration !== Infinity && duration > 0 && (
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full ${config.progressColor} opacity-60 origin-left
              motion-reduce:hidden group-hover/toast:[animation-play-state:paused]`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
