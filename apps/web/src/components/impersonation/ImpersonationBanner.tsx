'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, LogOut } from 'lucide-react';

import type { RootState, AppDispatch } from '@/store/store';
import { setCredentials } from '@/store/slices/authSlice';
import { useExitImpersonationMutation } from '@/features/impersonation';
import { customToast } from '@/components/ui/custom-toast';
import { getImpersonationDictionary } from '@/lib/impersonation-i18n';
import { Button } from '@/components/ui/button';

/**
 * Persistent banner shown on every page while a Super Admin is impersonating a
 * user. It is intentionally slim, non-gradient, and uses logical spacing so it
 * works in both LTR and RTL and across mobile/tablet/desktop breakpoints.
 */
export function ImpersonationBanner({ lang }: { lang: string }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const impersonation = user?.impersonation ?? null;

  const t = getImpersonationDictionary(lang);
  const isBn = lang === 'bn';

  const [exitImpersonation, { isLoading }] = useExitImpersonationMutation();
  const [isExiting, setIsExiting] = useState(false);
  const expiryHandled = useRef(false);

  const handleExit = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (isExiting) return;
      setIsExiting(true);
      try {
        const result = await exitImpersonation().unwrap();
        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          })
        );
        if (!options.silent) {
          customToast.success(t.ended);
        }
        router.push(`/${lang}/super-admin/users-management/users`);
      } catch {
        if (options.silent) {
          customToast.info({ title: t.sessionExpiredTitle, description: t.sessionExpired });
        } else {
          customToast.error(t.errorExit);
        }
      } finally {
        setIsExiting(false);
      }
    },
    [dispatch, exitImpersonation, isExiting, lang, router, t]
  );

  // Auto-return to the Super Admin context when the temporary session lapses.
  useEffect(() => {
    if (!impersonation) return;
    expiryHandled.current = false;
    const ms = new Date(impersonation.expiresAt).getTime() - Date.now();
    const timer = setTimeout(
      () => {
        if (!expiryHandled.current) {
          expiryHandled.current = true;
          void handleExit({ silent: true });
        }
      },
      ms > 0 ? ms : 0
    );
    return () => clearTimeout(timer);
  }, [impersonation, handleExit]);

  if (!impersonation) return null;

  const targetName =
    impersonation.targetName || (isBn ? 'ব্যবহারকারী' : 'User');
  const targetRole = impersonation.targetRole;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[60] w-full border-b border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-50"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="min-w-0 text-xs leading-tight sm:text-sm">
            <span className="hidden sm:inline">{t.bannerPrefix} </span>
            <span className="sm:hidden">{t.viewingAs}: </span>
            <span className="font-semibold break-words">
              {targetName} · {targetRole}
            </span>
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleExit()}
          disabled={isLoading || isExiting}
          className="h-8 shrink-0 border-amber-400 bg-transparent text-xs font-semibold text-amber-950 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-50 dark:hover:bg-amber-900/40"
        >
          <LogOut className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">
            {isExiting ? t.exiting : t.exitImpersonation}
          </span>
          <span className="sm:hidden">{isExiting ? t.exiting : t.exit}</span>
        </Button>
      </div>
    </div>
  );
}

export default ImpersonationBanner;
