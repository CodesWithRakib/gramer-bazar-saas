import React from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default';

export interface ToastAction {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  altText?: string;
}

export interface ToastLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface ToastCancel {
  label?: string;
  onClick?: () => void;
}

export interface CustomToastOptions {
  id?: string | number;
  description?: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
  duration?: number;
  action?: ToastAction;
  cancel?: ToastCancel;
  link?: ToastLink;
  onDismiss?: (id: string | number) => void;
  onAutoClose?: (id: string | number) => void;
  className?: string;
}

export type ToastInput =
  | React.ReactNode
  | ({
      title?: React.ReactNode;
    } & CustomToastOptions);

export interface ToastItemData {
  id: string;
  type: ToastType;
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
  duration: number; // in milliseconds, or Infinity
  action?: ToastAction;
  cancel?: ToastCancel;
  link?: ToastLink;
  onDismiss?: (id: string | number) => void;
  onAutoClose?: (id: string | number) => void;
  className?: string;
  createdAt: number;
  customContent?: (id: string | number) => React.ReactNode;
  isDismissing?: boolean;
}

export interface ToastPromiseMessages<T> {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error: React.ReactNode | ((error: unknown) => React.ReactNode);
}
