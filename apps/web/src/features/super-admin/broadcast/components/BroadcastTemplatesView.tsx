'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { customToast } from '@/components/ui/custom-toast';
import { getBroadcastDictionary } from '@/lib/broadcast-i18n';
import {
  useGetBroadcastTemplatesQuery,
  useDeleteBroadcastTemplateMutation,
  type BroadcastTemplate,
} from '../broadcastApi';
import { BroadcastTemplateDialog } from './BroadcastTemplateDialog';

export interface BroadcastTemplatesViewProps {
  lang?: string;
}

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
  if (status === 'ACTIVE') return 'default';
  if (status === 'ARCHIVED') return 'destructive';
  return 'secondary';
};

export function BroadcastTemplatesView({ lang = 'en' }: BroadcastTemplatesViewProps) {
  const t = getBroadcastDictionary(lang);
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BroadcastTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BroadcastTemplate | null>(null);

  const { data, isLoading, isError, refetch } = useGetBroadcastTemplatesQuery({
    page,
    limit,
    search: search || undefined,
  });
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteBroadcastTemplateMutation();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (template: BroadcastTemplate) => {
    setEditing(template);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate(deleteTarget.id).unwrap();
      customToast.success(t.templates.deleted);
      setDeleteTarget(null);
    } catch {
      customToast.error(t.templates.deleteError);
    }
  };

  const columns: ColumnDef<BroadcastTemplate>[] = [
    {
      accessorKey: 'name',
      header: t.templates.name,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium break-words">{row.original.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{row.original.body}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: t.templates.category,
      cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'language',
      header: t.templates.language,
      cell: ({ row }) => <span className="text-xs uppercase">{row.original.language}</span>,
    },
    {
      accessorKey: 'status',
      header: t.templates.status,
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: 'provider',
      header: t.templates.provider,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.provider} · {row.original.providerStatus}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t.templates.actions,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {t.templates.edit}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">{t.templates.delete}</span>
          </Button>
        </div>
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t.templates.title}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t.templates.subtitle}</p>
        </div>
      </div>

      <DataTable<BroadcastTemplate, unknown>
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.meta?.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{ singular: isBn ? 'টেমপ্লেট' : 'template', plural: t.templates.items }}
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
        searchPlaceholder={t.templates.searchPlaceholder}
        emptyMessage={t.templates.empty}
        errorMessage={t.templates.error}
        actionSlot={
          <Button onClick={openCreate} className="!h-11 rounded-full px-6 shadow-xs">
            <Plus className="me-2 h-4 w-4" aria-hidden="true" />
            {t.templates.create}
          </Button>
        }
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />

      <BroadcastTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lang={lang}
        template={editing}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t.templates.deleteConfirmTitle}
        description={t.templates.deleteConfirm}
        confirmLabel={t.templates.delete}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        isBn={isBn}
      />
    </div>
  );
}

export default BroadcastTemplatesView;
