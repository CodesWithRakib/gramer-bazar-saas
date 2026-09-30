'use client';

import React from 'react';
import { toast as sonnerToast } from 'sonner';
import {
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export type CustomToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default';

export interface CustomToastOptions {
  description?: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label?: string;
    onClick?: () => void;
  };
  link?: {
    href: string;
    label: string;
    external?: boolean;
  };
}

interface ToastCardProps {
  id: string | number;
  type: CustomToastType;
  title: React.ReactNode;
  options?: CustomToastOptions;
}

const TYPE_CONFIG = {
  success: {
    accentGradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/25 dark:border-emerald-500/35',
    glowColor: 'shadow-emerald-500/10 dark:shadow-emerald-500/15',
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/25',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    icon: Check,
  },
  error: {
    accentGradient: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-500/25 dark:border-rose-500/35',
    glowColor: 'shadow-rose-500/10 dark:shadow-rose-500/15',
    iconBg: 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/25',
    badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    icon: AlertCircle,
  },
  warning: {
    accentGradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/25 dark:border-amber-500/35',
    glowColor: 'shadow-amber-500/10 dark:shadow-amber-500/15',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/25',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    icon: AlertTriangle,
  },
  info: {
    accentGradient: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-500/25 dark:border-sky-500/35',
    glowColor: 'shadow-sky-500/10 dark:shadow-sky-500/15',
    iconBg: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 border border-sky-500/25',
    badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    icon: Info,
  },
  loading: {
    accentGradient: 'from-emerald-500 via-primary to-teal-500',
    borderColor: 'border-primary/25 dark:border-primary/35',
    glowColor: 'shadow-primary/10',
    iconBg: 'bg-primary/15 text-primary dark:bg-primary/20 border border-primary/25',
    badgeBg: 'bg-primary/10 text-primary border-primary/20',
    icon: Loader2,
  },
  default: {
    accentGradient: 'from-slate-400 to-slate-600',
    borderColor: 'border-border',
    glowColor: 'shadow-black/5 dark:shadow-black/20',
    iconBg: 'bg-muted text-foreground border border-border',
    badgeBg: 'bg-muted text-muted-foreground border-border',
    icon: Info,
  },
};

export function PremiumToastCard({ id, type, title, options }: ToastCardProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.default;
  const IconComponent = config.icon;
  const isSpinning = type === 'loading';

  return (
    <div
      role="alert"
      className={`relative w-full min-w-[320px] max-w-[420px] overflow-hidden rounded-2xl border ${config.borderColor} bg-card/95 p-3.5 backdrop-blur-xl shadow-xl ${config.glowColor} transition-all duration-300 select-none flex items-start gap-3`}
    >
      {/* Sleek Gradient Side Accent */}
      <div
        className={`absolute top-0 bottom-0 start-0 w-1 bg-gradient-to-b ${config.accentGradient}`}
      />

      {/* Semantic Icon Badge */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 shadow-xs ${config.iconBg}`}
      >
        {options?.icon ? (
          options.icon
        ) : (
          <IconComponent className={`w-4 h-4 stroke-[2.4] ${isSpinning ? 'animate-spin' : ''}`} />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 pe-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold tracking-tight text-foreground leading-snug">
            {title}
          </h4>
          {options?.badge && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${config.badgeBg}`}
            >
              {options.badge}
            </span>
          )}
        </div>

        {options?.description && (
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {options.description}
          </div>
        )}

        {/* Action Buttons / Link */}
        {(options?.action || options?.link) && (
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {options.action && (
              <button
                type="button"
                onClick={() => {
                  options.action?.onClick();
                  sonnerToast.dismiss(id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors cursor-pointer"
              >
                <span>{options.action.label}</span>
                <ArrowRight className="w-3 h-3 rtl:rotate-180" />
              </button>
            )}

            {options.link && (
              <a
                href={options.link.href}
                target={options.link.external ? '_blank' : '_self'}
                rel={options.link.external ? 'noopener noreferrer' : undefined}
                onClick={() => sonnerToast.dismiss(id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <span>{options.link.label}</span>
                {options.link.external ? (
                  <ExternalLink className="w-3 h-3" />
                ) : (
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                )}
              </a>
            )}

            {options.cancel && (
              <button
                type="button"
                onClick={() => {
                  options.cancel?.onClick?.();
                  sonnerToast.dismiss(id);
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
              >
                {options.cancel.label || 'Dismiss'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => sonnerToast.dismiss(id)}
        aria-label="Dismiss toast"
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * Custom Toast Helpers for Ultra-Premium Toast Notifications
 */
export const customToast = {
  success: (title: React.ReactNode, options?: CustomToastOptions) => {
    return sonnerToast.custom(
      (id) => <PremiumToastCard id={id} type="success" title={title} options={options} />,
      { duration: options?.duration ?? 4000 }
    );
  },

  error: (title: React.ReactNode, options?: CustomToastOptions) => {
    return sonnerToast.custom(
      (id) => <PremiumToastCard id={id} type="error" title={title} options={options} />,
      { duration: options?.duration ?? 5000 }
    );
  },

  warning: (title: React.ReactNode, options?: CustomToastOptions) => {
    return sonnerToast.custom(
      (id) => <PremiumToastCard id={id} type="warning" title={title} options={options} />,
      { duration: options?.duration ?? 4500 }
    );
  },

  info: (title: React.ReactNode, options?: CustomToastOptions) => {
    return sonnerToast.custom(
      (id) => <PremiumToastCard id={id} type="info" title={title} options={options} />,
      { duration: options?.duration ?? 4000 }
    );
  },

  loading: (title: React.ReactNode, options?: CustomToastOptions) => {
    return sonnerToast.custom(
      (id) => <PremiumToastCard id={id} type="loading" title={title} options={options} />,
      { duration: Infinity }
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: React.ReactNode;
      success: React.ReactNode | ((data: T) => React.ReactNode);
      error: React.ReactNode | ((error: any) => React.ReactNode);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
};

export { sonnerToast as toast };
