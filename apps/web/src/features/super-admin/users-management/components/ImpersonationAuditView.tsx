'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, ShieldAlert, X } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getImpersonationAuditDictionary } from '@/lib/impersonation-audit-i18n';
import { getImpersonationDictionary } from '@/lib/impersonation-i18n';
import {
  useGetImpersonationSessionsQuery,
  type ImpersonationHistoryItem,
  type ImpersonationStatus,
} from '@/features/impersonation';

export interface ImpersonationAuditViewProps {
  lang?: string;
  /** Pre-filter the listing to a single effective user (from a user detail page). */
  initialTargetUserId?: string;
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

export function ImpersonationAuditView({
  lang = 'en',
  initialTargetUserId,
}: ImpersonationAuditViewProps) {
  const t = getImpersonationAuditDictionary(lang);
  const imp = getImpersonationDictionary(lang);
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ImpersonationStatus | 'ALL'>('ALL');
  const [targetUserId, setTargetUserId] = useState<string | undefined>(initialTargetUserId);

  const { data, isLoading, isError, refetch } = useGetImpersonationSessionsQuery({
    page,
    limit,
    search: search || undefined,
    status: status === 'ALL' ? undefined : status,
    targetUserId,
  });

  const statusLabel = (value: ImpersonationStatus): string => {
    if (value === 'ACTIVE') return t.statusActive;
    if (value === 'EXPIRED') return t.statusExpired;
    return t.statusEnded;
  };

  const statusVariant = (value: ImpersonationStatus): 'default' | 'secondary' | 'destructive' => {
    if (value === 'ACTIVE') return 'default';
    if (value === 'EXPIRED') return 'destructive';
    return 'secondary';
  };

  const columns: ColumnDef<ImpersonationHistoryItem>[] = [
    {
      id: 'actor',
      header: t.actor,
      cell: ({ row }) => (
        <span className="font-medium break-words">
          {row.original.actorName || (isBn ? 'সুপার অ্যাডমিন' : 'Super Admin')}
        </span>
      ),
    },
    {
      id: 'target',
      header: t.target,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium break-words">
            {row.original.targetName || row.original.targetUserId}
          </p>
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {row.original.targetRole}
          </Badge>
        </div>
      ),
    },
    {
      id: 'reason',
      header: t.reason,
      cell: ({ row }) => (
        <div className="max-w-[260px] min-w-0">
          <p className="break-words text-sm">{imp.reasons[row.original.reason]}</p>
          {row.original.reasonNote && (
            <p className="mt-0.5 text-xs break-words text-muted-foreground">
              {row.original.reasonNote}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'started',
      header: t.started,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.startedAt, lang)}
        </span>
      ),
    },
    {
      id: 'endedHeader',
      header: t.ended,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.endedAt ? formatDateTime(row.original.endedAt, lang) : '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: t.filterStatus,
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)}>
          {statusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: 'blocked',
      header: t.blocked,
      cell: ({ row }) =>
        row.original.blockedActionCount > 0 ? (
          <div className="max-w-[220px]">
            <Badge variant="destructive" className="gap-1">
              <ShieldAlert className="h-3 w-3" aria-hidden="true" />
              {row.original.blockedActionCount}
            </Badge>
            <ul className="mt-1 space-y-0.5">
              {row.original.blockedActions.map((action, index) => (
                <li key={`${action.path}-${index}`} className="text-[11px] break-all text-muted-foreground">
                  <span className="font-medium">{action.method}</span> {action.path}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t.noBlocked}</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${lang}/super-admin/users-management`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t.title}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      {targetUserId && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="text-xs font-medium text-foreground">{t.filteredTarget}</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-full text-xs"
            onClick={() => {
              setTargetUserId(undefined);
              setPage(1);
            }}
          >
            {t.clearTargetFilter}
            <X className="ms-1 h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      )}

      <DataTable<ImpersonationHistoryItem, unknown>
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.meta?.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{ singular: isBn ? 'সেশন' : 'session', plural: isBn ? 'সেশন' : 'sessions' }}
        isBn={isBn}
        pagination={{ pageIndex: page - 1, pageSize: limit }}
        onPaginationChange={(updater) => {
          const state =
            typeof updater === 'function'
              ? updater({ pageIndex: page - 1, pageSize: limit })
              : updater;
          setPage(state.pageIndex + 1);
          setLimit(state.pageSize);
        }}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={t.searchPlaceholder}
        emptyMessage={t.empty}
        errorMessage={t.error}
        filterSlot={
          <div className="w-full sm:w-44">
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val as ImpersonationStatus | 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 dark:border-border dark:bg-card dark:text-foreground">
                <SelectValue placeholder={t.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t.all}</SelectItem>
                <SelectItem value="ACTIVE">{t.statusActive}</SelectItem>
                <SelectItem value="ENDED">{t.statusEnded}</SelectItem>
                <SelectItem value="EXPIRED">{t.statusExpired}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}

export default ImpersonationAuditView;
