'use client';

import React from 'react';
import {
  toast,
  toastStore,
  CustomToastOptions,
  ToastType,
  ToastInput,
  ToastPromiseMessages,
  ToastItemData,
} from './toast';

export type CustomToastType = ToastType;
export type { CustomToastOptions };

/**
 * Standardized Gramer Bazar Custom Toast Helper
 *
 * Fully supports:
 * - toast.success("Message", options?)
 * - toast.success({ title: "...", description: "...", ...options })
 * - toast.error(...)
 * - toast.warning(...)
 * - toast.info(...)
 * - toast.loading(...)
 * - toast.promise(promise, messages, options)
 * - toast.custom(renderFn, options)
 * - toast.dismiss(id?)
 */
export const customToast = {
  success: (input: ToastInput, options?: CustomToastOptions): string => {
    return toast.success(input, options);
  },

  error: (input: ToastInput, options?: CustomToastOptions): string => {
    return toast.error(input, options);
  },

  warning: (input: ToastInput, options?: CustomToastOptions): string => {
    return toast.warning(input, options);
  },

  info: (input: ToastInput, options?: CustomToastOptions): string => {
    return toast.info(input, options);
  },

  loading: (input: ToastInput, options?: CustomToastOptions): string => {
    return toast.loading(input, options);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: ToastPromiseMessages<T>,
    options?: CustomToastOptions
  ): Promise<T> => {
    return toast.promise(promise, messages, options);
  },

  custom: (
    renderFn: (id: string | number) => React.ReactNode,
    options?: CustomToastOptions
  ): string => {
    return toast.custom(renderFn, options);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  update: (id: string | number, updates: Partial<ToastItemData> & CustomToastOptions) => {
    toastStore.update(id, updates);
  },
};

export { toast };
export default toast;
