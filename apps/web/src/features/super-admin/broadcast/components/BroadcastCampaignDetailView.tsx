'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Loader2, Play, Send, ShieldAlert, XCircle } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { customToast } from '@/components/ui/custom-toast';
import { getBroadcastDictionary } from '@/lib/broadcast-i18n';
import {
  useGetBroadcastCampaignQuery,
  useGetBroadcastTemplateQuery,
  useGetBroadcastStatsQuery,
  useGetBroadcastRecipientsQuery,
  useSendBroadcastCampaignMutation,
  useCancelBroadcastCampaignMutation,
  useTestSendCampaignMutation,
  type BroadcastCampaign,
  type BroadcastRecipient,
} from '../broadcastApi';

export interface BroadcastCampaignDetailViewProps {
  lang?: string;
  id: string;
}

const CONTENT_TYPE = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

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

export function BroadcastCampaignDetailView({ lang = 'en', id }: BroadcastCampaignDetailViewProps) {
  const t = getBroadcastDictionary(lang);
  const isBn = lang === 'bn';

  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientLimit, setRecipientLimit] = useState(10);
  const [recipientSearch, setRecipientSearch] = useState('');

  const [sendOpen, setSendOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('');

  const { data: campaign, isLoading, isError, refetch } = useGetBroadcastCampaignQuery(id);
  const { data: template } = useGetBroadcastTemplateQuery(campaign?.templateId ?? '', {
    skip: !campaign?.templateId,
  });
  const { data: stats } = useGetBroadcastStatsQuery(id, {
    pollingInterval: campaign?.status === 'PROCESSING' ? 5000 : 0,
  });
  const { data: recipients, isLoading: isRecipientsLoading } = useGetBroadcastRecipientsQuery({
    id,
    page: recipientPage,
    limit: recipientLimit,
    search: recipientSearch || undefined,
  });

  const [sendCampaign, { isLoading: isSending }] = useSendBroadcastCampaignMutation();
  const [cancelCampaign, { isLoading: isCancelling }] = useCancelBroadcastCampaignMutation();
  const [testSend, { isLoading: isTesting }] = useTestSendCampaignMutation();

  const statusVariant = (status: BroadcastCampaign['status']) => {
    if (status === 'COMPLETED' || status === 'PROCESSING') return 'default' as const;
    if (status === 'FAILED') return 'destructive' as const;
    return 'secondary' as const;
  };

  const canSend = campaign?.status === 'DRAFT' || campaign?.status === 'SCHEDULED';
  const canCancel = canSend;

  const renderedMessage = (() => {
    if (!template) return '';
    const values = campaign?.audienceConfig?.variables ?? {};
    return template.body.replace(CONTENT_TYPE, (full, key: string) => {
      const sample: Record<string, string> = {
        customer_name: isBn ? 'রাকিব' : 'Rakib',
        customer_phone: '+8801700000000',
        ...values,
      };
      return sample[key] ?? full;
    });
  })();

  const handleSend = async () => {
    try {
      await sendCampaign(id).unwrap();
      customToast.success(t.campaignDetail.sent);
    } catch (err) {
      const message = (err as { data?: { message?: string | string[] } })?.data?.message;
      customToast.error(
        Array.isArray(message) ? message[0] : message || t.campaignDetail.actionError,
      );
    }
  };

  const handleCancel = async () => {
    try {
      await cancelCampaign(id).unwrap();
      customToast.success(t.campaignDetail.cancelled);
    } catch (err) {
      const message = (err as { data?: { message?: string | string[] } })?.data?.message;
      customToast.error(
        Array.isArray(message) ? message[0] : message || t.campaignDetail.actionError,
      );
    }
  };

  const handleTest = async () => {
    if (!testPhone.trim()) return;
    try {
      await testSend({ id, phone: testPhone.trim() }).unwrap();
      customToast.success(t.campaignDetail.testSent);
      setTestOpen(false);
      setTestPhone('');
    } catch {
      customToast.error(t.campaignDetail.testError);
    }
  };

  const recipientColumns: ColumnDef<BroadcastRecipient>[] = [
    {
      accessorKey: 'customerName',
      header: t.campaignDetail.colCustomer,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.customerName ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: t.campaignDetail.colPhone,
      cell: ({ row }) => <span className="text-sm">{row.original.phone}</span>,
    },
    {
      accessorKey: 'status',
      header: t.campaignDetail.colStatus,
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'FAILED' ? 'destructive' : 'secondary'}>
          {t.recipientStatuses[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'sentAt',
      header: t.campaignDetail.colSent,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.sentAt, lang)}
        </span>
      ),
    },
    {
      accessorKey: 'deliveredAt',
      header: t.campaignDetail.colDelivered,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.deliveredAt, lang)}
        </span>
      ),
    },
    {
      accessorKey: 'readAt',
      header: t.campaignDetail.colRead,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original.readAt, lang)}
        </span>
      ),
    },
    {
      accessorKey: 'failedReason',
      header: t.campaignDetail.colFailure,
      cell: ({ row }) => (
        <span className="text-xs break-words text-destructive">
          {row.original.failedReason ?? '—'}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {t.campaignDetail.info}…
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">{t.campaignDetail.notFound}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            {isBn ? 'আবার চেষ্টা করুন' : 'Retry'}
          </Button>
          <Button asChild>
            <Link href={`/${lang}/super-admin/broadcast/campaigns`}>
              {t.campaignDetail.back}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${lang}/super-admin/broadcast/campaigns`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t.campaignDetail.back}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setTestOpen(true)}>
            <Send className="me-2 h-4 w-4" aria-hidden="true" />
            {t.campaignDetail.testSend}
          </Button>
          {canSend && (
            <Button onClick={() => setSendOpen(true)}>
              <Play className="me-2 h-4 w-4" aria-hidden="true" />
              {t.campaignDetail.sendNow}
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" onClick={() => setCancelOpen(true)}>
              <XCircle className="me-2 h-4 w-4" aria-hidden="true" />
              {t.campaignDetail.cancel}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{campaign.title}</h1>
            <p className="text-sm text-muted-foreground">
              {campaign.templateName ?? t.campaigns.template}
            </p>
          </div>
          <Badge variant={statusVariant(campaign.status)}>
            {t.campaigns.statuses[campaign.status]}
          </Badge>
        </div>
      </div>

      {campaign.simulated && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t.campaignDetail.simulatedNotice}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label={t.campaignDetail.totalRecipients} value={stats?.totalRecipients ?? 0} />
        <StatCard label={t.campaignDetail.queued} value={stats?.queued ?? 0} />
        <StatCard label={t.campaignDetail.sentLabel} value={stats?.sent ?? 0} />
        <StatCard label={t.campaignDetail.deliveredLabel} value={stats?.delivered ?? 0} />
        <StatCard label={t.campaignDetail.readLabel} value={stats?.read ?? 0} />
        <StatCard label={t.campaignDetail.failedLabel} value={stats?.failed ?? 0} danger />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">{t.campaignDetail.info}</h2>
          <dl className="space-y-2 text-sm">
            <InfoRow label={t.campaignDetail.audience} value={t.audience.types[campaign.audienceType]} />
            <InfoRow label={t.campaigns.createdBy} value={campaign.createdByName ?? '—'} />
            <InfoRow label={t.campaignDetail.schedule} value={formatDateTime(campaign.scheduledAt, lang)} />
            <InfoRow label={t.campaigns.createdAt} value={formatDateTime(campaign.createdAt, lang)} />
            <InfoRow
              label={t.campaignDetail.statistics}
              value={campaign.completedAt ? formatDateTime(campaign.completedAt, lang) : '—'}
            />
          </dl>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">{t.campaignDetail.rendered}</h2>
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="whitespace-pre-wrap break-words text-sm">{renderedMessage || '—'}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">{t.campaignDetail.recipients}</h2>
        <DataTable<BroadcastRecipient, unknown>
          columns={recipientColumns}
          data={recipients?.data ?? []}
          pageCount={recipients?.meta?.totalPages ?? -1}
          totalCount={recipients?.meta?.total}
          itemLabel={{
            singular: isBn ? 'প্রাপক' : 'recipient',
            plural: isBn ? 'প্রাপক' : 'recipients',
          }}
          isBn={isBn}
          pagination={{ pageIndex: recipientPage - 1, pageSize: recipientLimit }}
          onPaginationChange={(updater) => {
            const state =
              typeof updater === 'function'
                ? updater({ pageIndex: recipientPage - 1, pageSize: recipientLimit })
                : updater;
            setRecipientPage(state.pageIndex + 1);
            setRecipientLimit(state.pageSize);
          }}
          search={recipientSearch}
          onSearchChange={(val) => {
            setRecipientSearch(val);
            setRecipientPage(1);
          }}
          searchPlaceholder={t.campaignDetail.recipientSearch}
          emptyMessage={t.campaigns.empty}
          isLoading={isRecipientsLoading}
        />
      </div>

      <ConfirmDialog
        isOpen={sendOpen}
        onOpenChange={setSendOpen}
        title={t.campaignDetail.sendConfirmTitle}
        description={t.campaignDetail.sendConfirm}
        confirmLabel={isSending ? t.campaignDetail.sending : t.campaignDetail.sendNow}
        variant="default"
        isLoading={isSending}
        onConfirm={handleSend}
        isBn={isBn}
      />

      <ConfirmDialog
        isOpen={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t.campaignDetail.cancelConfirmTitle}
        description={t.campaignDetail.cancelConfirm}
        confirmLabel={t.campaignDetail.cancel}
        isLoading={isCancelling}
        onConfirm={handleCancel}
        isBn={isBn}
      />

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.campaignDetail.testSend}</DialogTitle>
            <DialogDescription className="text-xs">
              {t.campaignDetail.testSendHint}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="test-phone">{t.campaignDetail.testPhone}</Label>
            <Input
              id="test-phone"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder={t.campaignDetail.testPhonePlaceholder}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTestOpen(false)} disabled={isTesting}>
              {t.templateForm.cancel}
            </Button>
            <Button onClick={handleTest} disabled={isTesting || !testPhone.trim()}>
              {isTesting && <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isTesting ? t.campaignDetail.testing : t.campaignDetail.testSendAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${danger ? 'text-destructive' : ''}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-end">{value}</dd>
    </div>
  );
}

export default BroadcastCampaignDetailView;
