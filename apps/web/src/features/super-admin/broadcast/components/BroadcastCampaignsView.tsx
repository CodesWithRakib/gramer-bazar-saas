'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Plus, Eye } from 'lucide-react';

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
import { getBroadcastDictionary } from '@/lib/broadcast-i18n';
import {
  useGetBroadcastCampaignsQuery,
  type BroadcastCampaign,
  type BroadcastStatus,
} from '../broadcastApi';

export interface BroadcastCampaignsViewProps {
  lang?: string;
}

const STATUSES: BroadcastStatus[] = [
  'DRAFT',
  'SCHEDULED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
];

function statusVariant(status: BroadcastStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'COMPLETED') return 'default';
  if (status === 'FAILED') return 'destructive';
  if (status === 'PROCESSING') return 'default';
  return 'secondary';
}

function formatDateTime(value: string | null, lang: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BroadcastCampaignsView({ lang = 'en' }: BroadcastCampaignsViewProps) {
  const t = getBroadcastDictionary(lang);
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BroadcastStatus | 'ALL'>('ALL');

  const { data, isLoading, isError, refetch } = useGetBroadcastCampaignsQuery({
    page,
    limit,
    search: search || undefined,
    status: status === 'ALL' ? undefined : status,
  });

  const columns: ColumnDef<BroadcastCampaign>[] = [
    {
      accessorKey: 'title',
      header: t.campaigns.campaign,
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link
            href={`/${lang}/super-admin/broadcast/campaigns/${row.original.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {row.original.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {t.campaigns.createdBy}: {row.original.createdByName ?? '—'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'templateName',
      header: t.campaigns.template,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.templateName ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'audienceType',
      header: t.campaigns.audience,
      cell: ({ row }) => (
        <Badge variant="secondary">{t.audience.types[row.original.audienceType]}</Badge>
      ),
    },
    {
      accessorKey: 'totalRecipients',
      header: t.campaigns.recipients,
      cell: ({ row }) => <span className="text-sm">{row.original.totalRecipients}</span>,
    },
    {
      id: 'delivery',
      header: t.campaigns.delivered,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {t.campaigns.sent} {row.original.sentCount} · {t.campaigns.delivered}{' '}
          {row.original.deliveredCount} · {t.campaigns.failed} {row.original.failedCount}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t.campaigns.status,
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)}>
          {t.campaigns.statuses[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'scheduledAt',
      header: t.campaigns.scheduled,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.scheduledAt, lang)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: t.campaigns.createdAt,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.createdAt, lang)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${lang}/super-admin/broadcast/campaigns/${row.original.id}`}>
            <Eye className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {t.campaigns.view}
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${lang}/super-admin/broadcast`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t.campaigns.title}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t.campaigns.subtitle}</p>
        </div>
      </div>

      <DataTable<BroadcastCampaign, unknown>
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.meta?.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{ singular: isBn ? 'ক্যাম্পেইন' : 'campaign', plural: t.campaigns.items }}
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
        searchPlaceholder={t.campaigns.searchPlaceholder}
        emptyMessage={t.campaigns.empty}
        errorMessage={t.campaigns.error}
        filterSlot={
          <div className="w-full sm:w-44">
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val as BroadcastStatus | 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 dark:border-border dark:bg-card dark:text-foreground">
                <SelectValue placeholder={t.campaigns.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t.campaigns.all}</SelectItem>
                {STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t.campaigns.statuses[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        actionSlot={
          <Button asChild className="!h-11 rounded-full px-6 shadow-xs">
            <Link href={`/${lang}/super-admin/broadcast/campaigns/new`}>
              <Plus className="me-2 h-4 w-4" aria-hidden="true" />
              {t.campaigns.create}
            </Link>
          </Button>
        }
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}

export default BroadcastCampaignsView;
