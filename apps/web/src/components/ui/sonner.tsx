'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { Check, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const CustomToastIcon = ({
  icon: Icon,
  variant,
  spin,
}: {
  icon: React.ElementType;
  variant: 'success' | 'error' | 'warning' | 'info' | 'loading';
  spin?: boolean;
}) => {
  const styles = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    error: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25',
    loading: 'bg-primary/15 text-primary border-primary/25',
  };

  return (
    <div
      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${styles[variant]}`}
    >
      <Icon className={`w-3.5 h-3.5 stroke-[2.5] ${spin ? 'animate-spin' : ''}`} />
    </div>
  );
};

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      closeButton
      gap={12}
      visibleToasts={5}
      duration={4200}
      icons={{
        success: <CustomToastIcon icon={Check} variant="success" />,
        error: <CustomToastIcon icon={AlertCircle} variant="error" />,
        warning: <CustomToastIcon icon={AlertTriangle} variant="warning" />,
        info: <CustomToastIcon icon={Info} variant="info" />,
        loading: <CustomToastIcon icon={Loader2} variant="loading" spin />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card/95 dark:group-[.toaster]:bg-card/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-border/80 group-[.toaster]:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.06)] group-[.toaster]:rounded-2xl group-[.toaster]:p-3.5 group-[.toaster]:gap-3 group-[.toaster]:transition-all group-[.toaster]:duration-300 font-sans',
          title:
            'group-[.toast]:font-semibold group-[.toast]:text-sm group-[.toast]:tracking-tight group-[.toast]:text-foreground leading-snug',
          description:
            'group-[.toast]:text-xs group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed group-[.toast]:mt-0.5',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground hover:group-[.toast]:bg-primary/90 group-[.toast]:font-semibold group-[.toast]:text-xs group-[.toast]:px-3.5 group-[.toast]:py-1.5 group-[.toast]:rounded-xl group-[.toast]:shadow-xs group-[.toast]:transition-all cursor-pointer',
          cancelButton:
            'group-[.toast]:bg-muted/80 hover:group-[.toast]:bg-muted group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:px-3.5 group-[.toast]:py-1.5 group-[.toast]:rounded-xl group-[.toast]:transition-colors cursor-pointer',
          closeButton:
            '!bg-muted/80 hover:!bg-muted !text-muted-foreground hover:!text-foreground !border !border-border/60 !rounded-full !w-6 !h-6 !top-3 !right-3 !transition-colors cursor-pointer',
          success:
            'group-[.toaster]:border-emerald-500/30 group-[.toaster]:shadow-emerald-500/10 dark:group-[.toaster]:border-emerald-500/30 dark:group-[.toaster]:bg-emerald-950/15',
          error:
            'group-[.toaster]:border-rose-500/30 group-[.toaster]:shadow-rose-500/10 dark:group-[.toaster]:border-rose-500/30 dark:group-[.toaster]:bg-rose-950/15',
          warning:
            'group-[.toaster]:border-amber-500/30 group-[.toaster]:shadow-amber-500/10 dark:group-[.toaster]:border-amber-500/30 dark:group-[.toaster]:bg-amber-950/15',
          info:
            'group-[.toaster]:border-sky-500/30 group-[.toaster]:shadow-sky-500/10 dark:group-[.toaster]:border-sky-500/30 dark:group-[.toaster]:bg-sky-950/15',
          loading:
            'group-[.toaster]:border-primary/30 group-[.toaster]:shadow-primary/10',
        },
      }}
      {...props}
    />
  );
};
