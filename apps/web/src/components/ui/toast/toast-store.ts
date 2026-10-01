'use client';

import React from 'react';
import {
  ToastItemData,
  ToastType,
  CustomToastOptions,
  ToastInput,
  ToastPromiseMessages,
} from './types';

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3800,
  info: 4200,
  warning: 5000,
  error: 6000,
  loading: Infinity,
  default: 4200,
};

const MAX_VISIBLE_TOASTS = 4;
const DISMISS_ANIMATION_DURATION = 240; // ms

type Listener = () => void;

class ToastStore {
  private toasts: ToastItemData[] = [];
  private listeners = new Set<Listener>();
  private timers = new Map<
    string,
    { timeoutId: ReturnType<typeof setTimeout>; remaining: number; startedAt: number }
  >();
  private idCounter = 0;
  private isPaused = false;

  private generateId(): string {
    this.idCounter = (this.idCounter + 1) % 1000000;
    return `gb-toast-${Date.now()}-${this.idCounter}`;
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): ToastItemData[] => {
    return this.toasts;
  };

  private startTimer(id: string, duration: number) {
    if (duration === Infinity || duration <= 0) return;

    this.clearTimer(id);

    const startedAt = Date.now();
    const timeoutId = setTimeout(() => {
      const item = this.toasts.find((t) => t.id === id);
      if (item) {
        item.onAutoClose?.(id);
      }
      this.dismiss(id);
    }, duration);

    this.timers.set(id, { timeoutId, remaining: duration, startedAt });
  }

  private clearTimer(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer.timeoutId);
      this.timers.delete(id);
    }
  }

  public pauseAll() {
    if (this.isPaused) return;
    this.isPaused = true;
    const now = Date.now();

    this.timers.forEach((timer, id) => {
      clearTimeout(timer.timeoutId);
      const elapsed = now - timer.startedAt;
      const remaining = Math.max(0, timer.remaining - elapsed);
      this.timers.set(id, { ...timer, remaining });
    });
  }

  public resumeAll() {
    if (!this.isPaused) return;
    this.isPaused = false;

    this.timers.forEach((timer, id) => {
      if (timer.remaining > 0) {
        this.startTimer(id, timer.remaining);
      }
    });
  }

  public add(type: ToastType, input: ToastInput, options?: CustomToastOptions): string {
    let title: React.ReactNode = '';
    let mergedOptions: CustomToastOptions = {};

    if (
      input !== null &&
      typeof input === 'object' &&
      !React.isValidElement(input) &&
      ('title' in input || 'description' in input)
    ) {
      const { title: inputTitle, ...rest } = input as {
        title?: React.ReactNode;
      } & CustomToastOptions;
      title = inputTitle ?? '';
      mergedOptions = { ...rest, ...options };
    } else {
      title = input as React.ReactNode;
      mergedOptions = { ...options };
    }

    const id = mergedOptions.id ? String(mergedOptions.id) : this.generateId();
    const duration = mergedOptions.duration ?? DEFAULT_DURATIONS[type];

    // If an item with this ID already exists, update it cleanly
    const existingIndex = this.toasts.findIndex((t) => t.id === id);
    if (existingIndex !== -1) {
      this.toasts[existingIndex] = {
        ...this.toasts[existingIndex],
        type,
        title,
        description: mergedOptions.description,
        badge: mergedOptions.badge,
        icon: mergedOptions.icon,
        duration,
        action: mergedOptions.action,
        cancel: mergedOptions.cancel,
        link: mergedOptions.link,
        className: mergedOptions.className,
        isDismissing: false,
      };

      if (!this.isPaused && duration !== Infinity) {
        this.startTimer(id, duration);
      }
      this.notify();
      return id;
    }

    const newToast: ToastItemData = {
      id,
      type,
      title,
      description: mergedOptions.description,
      badge: mergedOptions.badge,
      icon: mergedOptions.icon,
      duration,
      action: mergedOptions.action,
      cancel: mergedOptions.cancel,
      link: mergedOptions.link,
      onDismiss: mergedOptions.onDismiss,
      onAutoClose: mergedOptions.onAutoClose,
      className: mergedOptions.className,
      createdAt: Date.now(),
      isDismissing: false,
    };

    // Keep visible toast count within MAX_VISIBLE_TOASTS
    const activeToasts = this.toasts.filter((t) => !t.isDismissing);
    if (activeToasts.length >= MAX_VISIBLE_TOASTS) {
      // Find oldest non-loading toast to dismiss
      const oldestDismissible = activeToasts.find((t) => t.type !== 'loading');
      if (oldestDismissible) {
        this.dismiss(oldestDismissible.id);
      }
    }

    this.toasts = [newToast, ...this.toasts];

    if (!this.isPaused && duration !== Infinity) {
      this.startTimer(id, duration);
    }

    this.notify();
    return id;
  }

  public custom(
    renderFn: (id: string | number) => React.ReactNode,
    options?: CustomToastOptions
  ): string {
    const id = options?.id ? String(options.id) : this.generateId();
    const duration = options?.duration ?? DEFAULT_DURATIONS.default;

    const newToast: ToastItemData = {
      id,
      type: 'default',
      title: '',
      duration,
      customContent: renderFn,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
      className: options?.className,
      createdAt: Date.now(),
      isDismissing: false,
    };

    this.toasts = [newToast, ...this.toasts];

    if (!this.isPaused && duration !== Infinity) {
      this.startTimer(id, duration);
    }

    this.notify();
    return id;
  }

  public update(id: string | number, updates: Partial<ToastItemData> & CustomToastOptions) {
    const stringId = String(id);
    const index = this.toasts.findIndex((t) => t.id === stringId);
    if (index === -1) return;

    const current = this.toasts[index];
    const duration = updates.duration ?? current.duration;

    this.toasts[index] = {
      ...current,
      ...updates,
      duration,
      isDismissing: false,
    };

    if (duration !== Infinity && !this.isPaused) {
      this.startTimer(stringId, duration);
    } else if (duration === Infinity) {
      this.clearTimer(stringId);
    }

    this.notify();
  }

  public dismiss = (toastId?: string | number) => {
    if (!toastId) {
      // Dismiss all
      this.toasts.forEach((t) => {
        this.clearTimer(t.id);
        t.onDismiss?.(t.id);
      });
      this.toasts = this.toasts.map((t) => ({ ...t, isDismissing: true }));
      this.notify();

      setTimeout(() => {
        this.toasts = [];
        this.notify();
      }, DISMISS_ANIMATION_DURATION);
      return;
    }

    const stringId = String(toastId);
    const target = this.toasts.find((t) => t.id === stringId);
    if (!target || target.isDismissing) return;

    this.clearTimer(stringId);
    target.onDismiss?.(stringId);

    // Mark as dismissing for smooth exit animation
    this.toasts = this.toasts.map((t) => (t.id === stringId ? { ...t, isDismissing: true } : t));
    this.notify();

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== stringId);
      this.notify();
    }, DISMISS_ANIMATION_DURATION);
  };

  public remove = (toastId: string | number) => {
    const stringId = String(toastId);
    this.clearTimer(stringId);
    this.toasts = this.toasts.filter((t) => t.id !== stringId);
    this.notify();
  };

  public clear = () => {
    this.timers.forEach((timer) => clearTimeout(timer.timeoutId));
    this.timers.clear();
    this.toasts = [];
    this.notify();
  };
}

export const toastStore = new ToastStore();

/**
 * Public Developer API: toast(...)
 */
export function toast(input: ToastInput, options?: CustomToastOptions): string {
  return toastStore.add('default', input, options);
}

toast.success = (input: ToastInput, options?: CustomToastOptions): string => {
  return toastStore.add('success', input, options);
};

toast.error = (input: ToastInput, options?: CustomToastOptions): string => {
  return toastStore.add('error', input, options);
};

toast.warning = (input: ToastInput, options?: CustomToastOptions): string => {
  return toastStore.add('warning', input, options);
};

toast.info = (input: ToastInput, options?: CustomToastOptions): string => {
  return toastStore.add('info', input, options);
};

toast.loading = (input: ToastInput, options?: CustomToastOptions): string => {
  return toastStore.add('loading', input, options);
};

toast.custom = (
  renderFn: (id: string | number) => React.ReactNode,
  options?: CustomToastOptions
): string => {
  return toastStore.custom(renderFn, options);
};

toast.dismiss = (toastId?: string | number) => {
  toastStore.dismiss(toastId);
};

toast.remove = (toastId: string | number) => {
  toastStore.remove(toastId);
};

toast.update = (id: string | number, updates: Partial<ToastItemData> & CustomToastOptions) => {
  toastStore.update(id, updates);
};

toast.promise = <T>(
  promise: Promise<T>,
  messages: ToastPromiseMessages<T>,
  options?: CustomToastOptions
): Promise<T> => {
  const id = toast.loading(messages.loading, options);

  return promise
    .then((data) => {
      const successMsg =
        typeof messages.success === 'function' ? messages.success(data) : messages.success;

      toastStore.update(id, {
        type: 'success',
        title: successMsg,
        duration: options?.duration ?? DEFAULT_DURATIONS.success,
      });

      return data;
    })
    .catch((error: unknown) => {
      const errorMsg =
        typeof messages.error === 'function' ? messages.error(error) : messages.error;

      toastStore.update(id, {
        type: 'error',
        title: errorMsg,
        duration: options?.duration ?? DEFAULT_DURATIONS.error,
      });

      throw error;
    });
};
