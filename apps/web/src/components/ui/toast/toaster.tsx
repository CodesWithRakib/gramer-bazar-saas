'use client';

import React, { useSyncExternalStore } from 'react';
import { toastStore } from './toast-store';
import { ToastItem } from './toast-item';
import { ToastItemData } from './types';

export interface ToasterProps {
  className?: string;
  position?:
    'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

const EMPTY_TOASTS: ToastItemData[] = [];
const getServerSnapshot = () => EMPTY_TOASTS;

export function Toaster({ className = '', position = 'top-right' }: ToasterProps) {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    getServerSnapshot
  );

  if (!toasts || toasts.length === 0) {
    return null;
  }

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 inset-x-4 sm:top-5 sm:inset-x-auto sm:start-5';
      case 'top-center':
        return 'top-4 inset-x-4 sm:top-5 sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 inset-x-4 sm:bottom-5 sm:inset-x-auto sm:end-5 pb-[env(safe-area-inset-bottom,0px)]';
      case 'bottom-left':
        return 'bottom-4 inset-x-4 sm:bottom-5 sm:inset-x-auto sm:start-5 pb-[env(safe-area-inset-bottom,0px)]';
      case 'bottom-center':
        return 'bottom-4 inset-x-4 sm:bottom-5 sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2 pb-[env(safe-area-inset-bottom,0px)]';
      case 'top-right':
      default:
        return 'top-4 inset-x-4 sm:top-5 sm:inset-x-auto sm:end-5 pt-[env(safe-area-inset-top,0px)]';
    }
  };

  return (
    <aside
      aria-label="Notifications"
      role="region"
      onMouseEnter={() => toastStore.pauseAll()}
      onMouseLeave={() => toastStore.resumeAll()}
      onFocusCapture={() => toastStore.pauseAll()}
      onBlurCapture={() => toastStore.resumeAll()}
      className={`fixed ${getPositionClasses()} z-[9999] pointer-events-none
        flex flex-col gap-3 w-auto sm:w-[380px] max-w-full ${className}`}
    >
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto w-full">
          <ToastItem toast={item} />
        </div>
      ))}
    </aside>
  );
}
