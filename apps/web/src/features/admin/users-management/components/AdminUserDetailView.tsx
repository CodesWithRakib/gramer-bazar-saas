'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ArrowLeft, UserCog, Mail, Phone, Calendar, BadgeCheck, ShieldX } from 'lucide-react';

import { RootState } from '@/store/store';
import { userIsSuperAdmin } from '@/lib/roles';
import { getUserDetailsDictionary } from '@/lib/user-details-i18n';
import { getImpersonationDictionary } from '@/lib/impersonation-i18n';
import { useGetUserQuery } from '@/features/users/usersApi';
import { isImpersonatable } from '@/features/users/impersonationEligibility';
import {
  useGetTargetImpersonationHistoryQuery,
  type ImpersonationStatus,
} from '@/features/impersonation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImpersonateUserDialog } from './ImpersonateUserDialog';

export interface AdminUserDetailViewProps {
  lang?: string;
  id: string;
  basePath?: 'admin' | 'super-admin';
}

function formatDate(value: string | null | undefined, lang: string, fallback: string): string {
  if (!value) return fallback;
  return new Date(value).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value: string, lang: string): string {
  return new Date(value).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusVariant(status: ImpersonationStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'ACTIVE') return 'default';
  if (status === 'EXPIRED') return 'destructive';
  return 'secondary';
}

export function AdminUserDetailView({
  lang = 'en',
  id,
  basePath = 'super-admin',
}: AdminUserDetailViewProps) {
  const t = getUserDetailsDictionary(lang);
  const imp = getImpersonationDictionary(lang);
  const { data: user, isLoading, isError, refetch } = useGetUserQuery(id);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isSuperAdmin = userIsSuperAdmin(currentUser);
  const { data: history, isLoading: isHistoryLoading } = useGetTargetImpersonationHistoryQuery(
    id,
    { skip: !isSuperAdmin }
  );
  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);

  const canImpersonate = isSuperAdmin && !!user && isImpersonatable(user, currentUser?.id);

  const statusLabel = (status: ImpersonationStatus): string => {
    if (status === 'ACTIVE') return t.statusActive;
    if (status === 'EXPIRED') return t.statusExpired;
    return t.statusEnded;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        {t.loading}
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">{isError ? t.error : t.notFound}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            {t.retry}
          </Button>
          <Button asChild>
            <Link href={`/${lang}/${basePath}/users-management/users`}>{t.back}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const roles = (user.roles ?? []).map((r) => r.name as string);
  const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.phone;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${lang}/${basePath}/users-management/users`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t.back}
        </Link>

        {canImpersonate && (
          <Button onClick={() => setIsImpersonateOpen(true)}>
            <UserCog className="me-2 h-4 w-4" aria-hidden="true" />
            {imp.title}
          </Button>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
              {user.firstName?.[0]?.toUpperCase() || displayName[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
              {user.status}
            </Badge>
            {roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t.accountInfo}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {t.phone}
              </dt>
              <dd className="font-medium break-words text-end">{user.phone}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {t.email}
              </dt>
              <dd className="font-medium break-words text-end">{user.email || '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {t.joined}
              </dt>
              <dd className="font-medium text-end">{formatDate(user.createdAt, lang, '—')}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {t.lastLogin}
              </dt>
              <dd className="font-medium text-end">
                {formatDate(user.lastLoginAt, lang, t.never)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t.security}</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              {user.isPhoneVerified ? (
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <ShieldX className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span>{user.isPhoneVerified ? t.phoneVerified : t.phoneUnverified}</span>
            </li>
            <li className="flex items-center gap-2">
              {user.isEmailVerified ? (
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <ShieldX className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span>{user.isEmailVerified ? t.emailVerified : t.emailUnverified}</span>
            </li>
          </ul>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t.historyTitle}</h2>
          {isHistoryLoading ? (
            <p className="text-sm text-muted-foreground">{t.historyLoading}</p>
          ) : !history || history.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.historyEmpty}</p>
          ) : (
            <ul className="space-y-3">
              {history.map((item) => (
                <li
                  key={item.sessionId}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-xl border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium break-words text-foreground">
                      {item.actorName || (lang === 'bn' ? 'সুপার অ্যাডমিন' : 'Super Admin')}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {imp.reasons[item.reason]}
                      {item.reasonNote ? ` — ${item.reasonNote}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.historyStarted}: {formatDateTime(item.startedAt, lang)}
                      {item.endedAt ? ` · ${t.historyEnded}: ${formatDateTime(item.endedAt, lang)}` : ''}
                    </p>
                  </div>
                  <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {canImpersonate && (
        <ImpersonateUserDialog
          user={user}
          open={isImpersonateOpen}
          onOpenChange={setIsImpersonateOpen}
          lang={lang}
        />
      )}
    </div>
  );
}

export default AdminUserDetailView;
